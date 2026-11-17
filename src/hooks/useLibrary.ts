'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import type { AppState, UserLibraryEntry, WatchHistoryEntry, Collection, FilterState, MediaItem, WatchStatus } from '@/lib/types';
import { supabase } from '@/lib/supabase';
import { computeStats, exportJSON, exportCSV, importJSON } from '@/lib/storage';

export function useLibrary() {
  const [state, setState] = useState<AppState>({ library: [], watchHistory: [], collections: [], universeTimelines: [] });
  const [filter, setFilter] = useState<FilterState>({ status: 'all', type: 'all', sort: 'recently_updated', search: '' });
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // Fetch all user data from Supabase Cloud Database
  const fetchSupabaseData = useCallback(async (uid: string) => {
    setLoading(true);
    try {
      // 1. Fetch user_library
      const { data: libraryData, error: libErr } = await supabase
        .from('user_library')
        .select('*')
        .eq('user_id', uid)
        .order('updated_at', { ascending: false });

      if (libErr) console.error('Error fetching library from Supabase:', libErr);

      // 2. Fetch watch_history
      const { data: historyData, error: histErr } = await supabase
        .from('watch_history')
        .select('*')
        .eq('user_id', uid)
        .order('watched_at', { ascending: false });

      if (histErr) console.error('Error fetching history from Supabase:', histErr);

      // 3. Fetch collections
      const { data: collectionsData, error: colErr } = await supabase
        .from('collections')
        .select('*')
        .eq('user_id', uid)
        .order('created_at', { ascending: false });

      if (colErr) console.error('Error fetching collections from Supabase:', colErr);

      // 4. Fetch universe_timelines
      let universeData: Record<string, unknown>[] = [];
      try {
        const { data: uData } = await supabase
          .from('universe_timelines')
          .select('*')
          .eq('user_id', uid)
          .order('created_at', { ascending: false });
        if (uData) universeData = uData as Record<string, unknown>[];
      } catch (e) {
        console.error('Error fetching universe_timelines from Supabase:', e);
      }

      // Map DB schema back to frontend types with automatic deduplication
      const rawLibrary: UserLibraryEntry[] = (libraryData || []).map((row) => ({
        id: row.id,
        mediaId: row.media_id,
        media: row.media,
        status: row.status,
        currentEpisode: row.media?.type === 'movie' ? undefined : (row.current_episode || 0),
        currentSeason: row.current_season || 1,
        progressPercent: row.progress_percent || 0,
        userRating: row.user_rating || 0,
        isFavorite: row.is_favorite || false,
        notes: row.notes || '',
        platforms: row.platforms || [],
        addedAt: row.added_at,
        updatedAt: row.updated_at,
      }));

      // Deduplicate library entries by TMDB ID / AniList ID / exact title match
      const deduplicatedLibraryMap = new Map<string, UserLibraryEntry>();
      for (const entry of rawLibrary) {
        if (!entry || !entry.media) continue;

        let key = entry.mediaId || entry.id;
        if (entry.media.tmdbId) {
          const titleSuffix = (entry.media.title || entry.media.titleEnglish || '').toLowerCase().replace(/[^a-z0-9\u0e00-\u0e7f]/g, '');
          key = `tmdb-${entry.media.tmdbId}-${titleSuffix}`;
        } else if (entry.media.anilistId) {
          key = `al-${entry.media.anilistId}`;
        } else {
          const cleanTitle = (entry.media.titleEnglish || entry.media.title || '')
            .toLowerCase()
            .replace(/[^a-z0-9\u0e00-\u0e7f]/g, '');
          key = `title-${cleanTitle}`;
        }

        // Fix legacy 404 truncated posters
        if (entry.media.poster && entry.media.poster.includes('vSNxB2M2xIFiOSzII9uW0aKGgU5')) {
          entry.media.poster = 'https://image.tmdb.org/t/p/w500/vSNxAJTlD0r02V9sPYpOjqDZXUK.jpg';
        }
        if (entry.media.poster && entry.media.poster.includes('z0TawE1763g5oHqT3LlhS8mNldq')) {
          entry.media.poster = 'https://image.tmdb.org/t/p/w500/bG23nZW96LxmWkJjsagRZI9hF6t.jpg';
        }

        if (deduplicatedLibraryMap.has(key)) {
          const existing = deduplicatedLibraryMap.get(key)!;
          if (entry.status === 'completed') existing.status = 'completed';
          if (entry.userRating && !existing.userRating) existing.userRating = entry.userRating;
          if (entry.media.poster && !entry.media.poster.includes('vSNxB2M2xIFiOSzII9uW0aKGgU5') && !entry.media.poster.includes('unsplash')) {
            existing.media.poster = entry.media.poster;
          }
          if (new Date(entry.updatedAt) > new Date(existing.updatedAt)) {
            existing.updatedAt = entry.updatedAt;
          }
        } else {
          deduplicatedLibraryMap.set(key, entry);
        }
      }
      const mappedLibrary = Array.from(deduplicatedLibraryMap.values());

      const mappedHistory: WatchHistoryEntry[] = (historyData || []).map((row) => ({
        id: row.id,
        libraryEntryId: row.media_id,
        mediaId: row.media_id,
        mediaTitle: row.media_title,
        mediaPoster: row.media_poster,
        mediaType: row.media_type,
        episode: row.media_type === 'movie' ? undefined : row.episode,
        season: row.season,
        watchedAt: row.watched_at,
      }));

      // Deduplicate watch history entries
      const seenHistory = new Set<string>();
      const deduplicatedHistory: WatchHistoryEntry[] = [];
      for (const hist of mappedHistory) {
        const histKey = `${hist.mediaTitle.toLowerCase().replace(/[^a-z0-9\u0e00-\u0e7f]/g, '')}-${hist.watchedAt.substring(0, 16)}`;
        if (!seenHistory.has(histKey)) {
          seenHistory.add(histKey);
          deduplicatedHistory.push(hist);
        }
      }

      const mappedCollections: Collection[] = (collectionsData || []).map((row) => ({
        id: row.id,
        name: row.name,
        description: row.description || '',
        emoji: row.emoji || '📁',
        items: row.items || [],
        itemIds: (row.items || []).map((i: Record<string, unknown>) => (i.id || i.mediaId) as string),
        createdAt: row.created_at,
        updatedAt: row.created_at,
      }));

      const mappedUniverseTimelines: Collection[] = (universeData || []).map((row: Record<string, unknown>) => ({
        id: row.id as string,
        name: row.name as string,
        description: (row.description as string) || '',
        emoji: (row.emoji as string) || '',
        items: (row.items as (MediaItem | Record<string, unknown>)[]) || [],
        itemIds: ((row.items as Record<string, unknown>[]) || []).map((i: Record<string, unknown>) => (i.id || i.mediaId) as string),
        createdAt: row.created_at as string,
        updatedAt: row.created_at as string,
      }));

      setState({
        library: mappedLibrary,
        watchHistory: deduplicatedHistory,
        collections: mappedCollections,
        universeTimelines: mappedUniverseTimelines,
      });
    } catch (e) {
      console.error('Failed to sync with Supabase:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  // Listen to Auth state and load database
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUserId(session.user.id);
        fetchSupabaseData(session.user.id);
      } else {
        setUserId(null);
        setState({ library: [], watchHistory: [], collections: [], universeTimelines: [] });
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUserId(session.user.id);
        fetchSupabaseData(session.user.id);
      } else {
        setUserId(null);
        setState({ library: [], watchHistory: [], collections: [], universeTimelines: [] });
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchSupabaseData]);

  function isValidUuid(id: string): boolean {
    return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(id);
  }

  // Add entry to Supabase (with exact multi-field title & ID deduplication check)
  const addEntry = useCallback(async (entry: UserLibraryEntry) => {
    let existingEntry: UserLibraryEntry | undefined;

    setState((prev) => {
      existingEntry = prev.library.find((e) => {
        // 1. Direct mediaId / ID match
        if (entry.mediaId && e.mediaId && entry.mediaId === e.mediaId) return true;
        if (entry.id && e.id && entry.id === e.id) return true;

        // 2. Exact title matching
        const t1 = (entry.media.title || '').toLowerCase().replace(/[^a-z0-9\u0e00-\u0e7f]/g, '');
        const t2 = (e.media.title || '').toLowerCase().replace(/[^a-z0-9\u0e00-\u0e7f]/g, '');
        const eng1 = (entry.media.titleEnglish || '').toLowerCase().replace(/[^a-z0-9\u0e00-\u0e7f]/g, '');
        const eng2 = (e.media.titleEnglish || '').toLowerCase().replace(/[^a-z0-9\u0e00-\u0e7f]/g, '');

        if (t1 && t2 && t1 === t2) return true;
        if (eng1 && eng2 && eng1 === eng2) return true;

        // 3. TMDB ID match (ONLY if season designations do not conflict)
        if (entry.media?.tmdbId && e.media?.tmdbId && Number(entry.media.tmdbId) === Number(e.media.tmdbId)) {
          const season1 = (entry.media?.title || '').match(/\s+(S\d+|Season\s+\d+|Vol\.\s*\d+)$/i)?.[1]?.toLowerCase();
          const season2 = (e.media?.title || '').match(/\s+(S\d+|Season\s+\d+|Vol\.\s*\d+)$/i)?.[1]?.toLowerCase();
          if (season1 || season2) {
            return season1 === season2;
          }
          return true;
        }

        // 4. AniList ID match
        if (entry.media?.anilistId && e.media?.anilistId && Number(entry.media.anilistId) === Number(e.media.anilistId)) return true;

        return false;
      });

      if (existingEntry) {
        return {
          ...prev,
          library: prev.library.map((e) =>
            e.id === existingEntry!.id
              ? {
                  ...e,
                  status: entry.status,
                  userRating: entry.userRating || e.userRating,
                  currentEpisode: entry.media.type === 'movie' ? undefined : (entry.currentEpisode || e.currentEpisode),
                  updatedAt: new Date().toISOString(),
                }
              : e
          ),
        };
      }

      return { ...prev, library: [entry, ...prev.library] };
    });

    if (existingEntry) {
      if (userId && isValidUuid(existingEntry.id)) {
        await supabase.from('user_library').update({
          status: entry.status,
          user_rating: entry.userRating || existingEntry.userRating,
          current_episode: entry.media.type === 'movie' ? 0 : (entry.currentEpisode || existingEntry.currentEpisode || 0),
          updated_at: new Date().toISOString(),
        }).eq('id', existingEntry.id);
      }
      return;
    }

    if (!userId) return;

    try {
      const { data, error } = await supabase.from('user_library').insert({
        user_id: userId,
        media_id: entry.mediaId,
        media: entry.media,
        status: entry.status,
        current_episode: entry.media.type === 'movie' ? 0 : (entry.currentEpisode || 0),
        current_season: entry.currentSeason || 1,
        progress_percent: entry.progressPercent || 0,
        user_rating: entry.userRating || 0,
        is_favorite: entry.isFavorite || false,
        notes: entry.notes || '',
        platforms: entry.platforms || [],
        added_at: entry.addedAt,
        updated_at: entry.updatedAt,
      }).select().single();

      if (error) console.error('Supabase add error:', error);
      else if (data) {
        setState((prev) => ({
          ...prev,
          library: prev.library.map((e) => (e.id === entry.id ? { ...e, id: data.id } : e)),
        }));
      }
    } catch (e) {
      console.error('Supabase add error:', e);
    }
  }, [userId]);

  // Update entry in Supabase
  const updateEntry = useCallback(async (entryId: string, updates: Partial<UserLibraryEntry>) => {
    let targetEntry: UserLibraryEntry | undefined;

    setState((prev) => {
      targetEntry = prev.library.find((e) => e.id === entryId);
      return {
        ...prev,
        library: prev.library.map((e) =>
          e.id === entryId ? { ...e, ...updates, updatedAt: new Date().toISOString() } : e
        ),
      };
    });

    if (!userId) return;

    if (!isValidUuid(entryId)) {
      if (targetEntry) {
        const fullEntry: UserLibraryEntry = { ...targetEntry, ...updates, updatedAt: new Date().toISOString() };
        addEntry(fullEntry);
      }
      return;
    }

    try {
      const dbUpdates: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (updates.status !== undefined) dbUpdates.status = updates.status;
      if (updates.currentEpisode !== undefined) dbUpdates.current_episode = updates.currentEpisode;
      if (updates.currentSeason !== undefined) dbUpdates.current_season = updates.currentSeason;
      if (updates.userRating !== undefined) dbUpdates.user_rating = updates.userRating;
      if (updates.isFavorite !== undefined) dbUpdates.is_favorite = updates.isFavorite;
      if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
      if (updates.platforms !== undefined) dbUpdates.platforms = updates.platforms;

      const { error } = await supabase.from('user_library').update(dbUpdates).eq('id', entryId);
      if (error) console.error('Supabase update error:', error);
    } catch (e) {
      console.error('Supabase update error:', e);
    }
  }, [userId, addEntry]);

  // Remove entry from Supabase
  const removeEntry = useCallback(async (entryId: string) => {
    setState((prev) => ({ ...prev, library: prev.library.filter((e) => e.id !== entryId) }));
    if (!userId) return;

    try {
      const { error } = await supabase.from('user_library').delete().eq('id', entryId);
      if (error) console.error('Supabase delete error:', error);
    } catch (e) {
      console.error('Supabase delete error:', e);
    }
  }, [userId]);

  // Increment Episode & log watch history in Supabase
  const addEpisode = useCallback(async (entryId: string) => {
    let entryToUpdate: UserLibraryEntry | undefined;
    let newEpisode = 0;
    let newStatus: WatchHistoryEntry['mediaType'] | string = 'watching';
    const nowIso = new Date().toISOString();

    setState((prev) => {
      const entry = prev.library.find((e) => e.id === entryId);
      if (!entry) return prev;

      if (entry.media.totalEpisodes && (entry.currentEpisode || 0) >= entry.media.totalEpisodes) {
        return prev;
      }

      newEpisode = (entry.currentEpisode || 0) + 1;
      const isCompleted = Boolean(entry.media.totalEpisodes && newEpisode >= entry.media.totalEpisodes);
      newStatus = isCompleted ? 'completed' : entry.status;
      entryToUpdate = entry;

      const historyEntry: WatchHistoryEntry = {
        id: `hist-${Date.now()}`,
        libraryEntryId: entryId,
        mediaId: entry.mediaId,
        mediaTitle: entry.media.title,
        mediaPoster: entry.media.poster,
        mediaType: entry.media.type,
        episode: newEpisode,
        season: entry.currentSeason,
        watchedAt: nowIso,
        durationWatched: entry.media.runtime,
      };

      return {
        ...prev,
        library: prev.library.map((e) =>
          e.id === entryId ? { ...e, currentEpisode: newEpisode, status: newStatus as WatchStatus, updatedAt: nowIso } : e
        ),
        watchHistory: [historyEntry, ...prev.watchHistory],
      };
    });

    if (userId && entryToUpdate) {
      try {
        await supabase.from('user_library').update({
          current_episode: newEpisode,
          status: newStatus,
          updated_at: nowIso,
        }).eq('id', entryId);

        await supabase.from('watch_history').insert({
          user_id: userId,
          media_id: entryToUpdate.mediaId,
          media_title: entryToUpdate.media.title,
          media_poster: entryToUpdate.media.poster,
          media_type: entryToUpdate.media.type,
          episode: newEpisode,
          season: entryToUpdate.currentSeason,
          watched_at: nowIso,
        });
      } catch (e) {
        console.error('Supabase addEpisode error:', e);
      }
    }
  }, [userId]);

  // Decrement Episode
  const subtractEpisode = useCallback(async (entryId: string) => {
    let newEpisode = 0;
    const nowIso = new Date().toISOString();
    let updated = false;

    setState((prev) => {
      const entry = prev.library.find((e) => e.id === entryId);
      if (!entry || !entry.currentEpisode || entry.currentEpisode <= 1) return prev;
      newEpisode = entry.currentEpisode - 1;
      updated = true;

      return {
        ...prev,
        library: prev.library.map((e) =>
          e.id === entryId ? { ...e, currentEpisode: newEpisode, updatedAt: nowIso } : e
        ),
      };
    });

    if (userId && updated) {
      try {
        await supabase.from('user_library').update({
          current_episode: newEpisode,
          updated_at: nowIso,
        }).eq('id', entryId);
      } catch (e) {
        console.error('Supabase subtractEpisode error:', e);
      }
    }
  }, [userId]);

  // Collection Methods
  const addCollection = useCallback(async (name: string, description: string, emoji: string) => {
    const tempId = `col-${Date.now()}`;
    const newCol: Collection = {
      id: tempId,
      name,
      description,
      emoji,
      items: [],
      itemIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setState((prev) => ({ ...prev, collections: [newCol, ...prev.collections] }));
    if (!userId) return;

    try {
      const { data } = await supabase.from('collections').insert({
        user_id: userId,
        name,
        description,
        emoji,
        items: [],
      }).select().single();

      if (data) {
        setState((prev) => ({
          ...prev,
          collections: prev.collections.map((c) => (c.id === tempId ? { ...c, id: data.id } : c)),
        }));
      }
    } catch (e) {
      console.error('Supabase addCollection error:', e);
    }
  }, [userId]);

  const deleteCollection = useCallback(async (colId: string) => {
    setState((prev) => ({ ...prev, collections: prev.collections.filter((c) => c.id !== colId) }));
    if (!userId) return;

    try {
      await supabase.from('collections').delete().eq('id', colId);
    } catch (e) {
      console.error('Supabase deleteCollection error:', e);
    }
  }, [userId]);

  const addItemToCollection = useCallback(async (colId: string, item: MediaItem | Record<string, unknown>) => {
    let newItems: (MediaItem | Record<string, unknown>)[] = [];

    setState((prev) => ({
      ...prev,
      collections: prev.collections.map((c) => {
        if (c.id === colId) {
          const currentItems = c.items || [];
          const itemObj = item as Record<string, unknown>;
          const exists = currentItems.some((i) => {
            const iObj = i as Record<string, unknown>;
            return iObj.id === itemObj.id || iObj.title === itemObj.title;
          });
          if (exists) {
            newItems = currentItems;
            return c;
          }
          newItems = [...currentItems, item];
          return { ...c, items: newItems };
        }
        return c;
      }),
    }));

    if (!userId || !newItems.length) return;

    try {
      await supabase.from('collections').update({
        items: newItems,
      }).eq('id', colId);
    } catch (e) {
      console.error('Supabase addItemToCollection error:', e);
    }
  }, [userId]);

  const removeItemFromCollection = useCallback(async (colId: string, itemId: string) => {
    let newItems: (MediaItem | Record<string, unknown>)[] = [];

    setState((prev) => ({
      ...prev,
      collections: prev.collections.map((c) => {
        if (c.id === colId) {
          newItems = (c.items || []).filter((i) => {
            const iObj = i as Record<string, unknown>;
            return iObj.id !== itemId && iObj.mediaId !== itemId && iObj.title !== itemId;
          });
          return { ...c, items: newItems };
        }
        return c;
      }),
    }));

    if (!userId) return;

    try {
      await supabase.from('collections').update({
        items: newItems,
      }).eq('id', colId);
    } catch (e) {
      console.error('Supabase removeItemFromCollection error:', e);
    }
  }, [userId]);

  const toggleItemInCollection = useCallback(async (colId: string, item: UserLibraryEntry | Record<string, unknown>) => {
    const targetCol = state.collections.find((c) => c.id === colId);
    if (!targetCol) return;
    const itemObj = item as Record<string, unknown>;
    const mediaObj = (itemObj.media || {}) as Record<string, unknown>;
    const exists = (targetCol.items || []).some((i) => {
      const iObj = i as Record<string, unknown>;
      return iObj.id === itemObj.id || iObj.mediaId === itemObj.id || iObj.title === itemObj.title || iObj.title === mediaObj.title;
    });

    if (exists) {
      await removeItemFromCollection(colId, (itemObj.id || itemObj.mediaId || itemObj.title) as string);
    } else {
      const newItem = {
        id: itemObj.id || itemObj.mediaId,
        title: mediaObj.title || itemObj.title,
        poster: mediaObj.poster || itemObj.poster,
        type: mediaObj.type || itemObj.type,
        year: mediaObj.year || itemObj.year,
        rating: itemObj.userRating || mediaObj.rating || itemObj.rating,
      };
      await addItemToCollection(colId, newItem);
    }
  }, [state.collections, addItemToCollection, removeItemFromCollection]);

  // Universe Timelines
  const addUniverseTimeline = useCallback((name: string, description: string, emoji: string) => {
    const tempId = `uni-${Date.now()}`;
    const newUni: Collection = {
      id: tempId,
      name,
      description,
      emoji,
      items: [],
      itemIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setState((prev) => ({ ...prev, universeTimelines: [newUni, ...prev.universeTimelines] }));
    if (!userId) return tempId;

    void (async () => {
      try {
        const { data } = await supabase.from('universe_timelines').insert({
          user_id: userId,
          name,
          description,
          emoji,
          items: [],
        }).select().single();

        if (data) {
          setState((prev) => ({
            ...prev,
            universeTimelines: prev.universeTimelines.map((u) => (u.id === tempId ? { ...u, id: data.id } : u)),
          }));
        }
      } catch (e) {
        console.error('Supabase addUniverseTimeline error:', e);
      }
    })();

    return tempId;
  }, [userId]);

  const deleteUniverseTimeline = useCallback(async (uniId: string) => {
    setState((prev) => ({ ...prev, universeTimelines: prev.universeTimelines.filter((u) => u.id !== uniId) }));
    if (!userId) return;

    try {
      await supabase.from('universe_timelines').delete().eq('id', uniId);
    } catch (e) {
      console.error('Supabase deleteUniverseTimeline error:', e);
    }
  }, [userId]);

  const addItemToUniverseTimeline = useCallback(async (uniId: string, item: MediaItem | Record<string, unknown>) => {
    let newItems: (MediaItem | Record<string, unknown>)[] = [];

    setState((prev) => ({
      ...prev,
      universeTimelines: prev.universeTimelines.map((u) => {
        if (u.id === uniId) {
          const currentItems = u.items || [];
          const itemObj = item as Record<string, unknown>;
          const exists = currentItems.some((i) => {
            const iObj = i as Record<string, unknown>;
            return iObj.id === itemObj.id || iObj.title === itemObj.title;
          });
          if (exists) return u;
          newItems = [...currentItems, item];
          return { ...u, items: newItems };
        }
        return u;
      }),
    }));

    if (!userId || !newItems.length) return;

    try {
      await supabase.from('universe_timelines').update({
        items: newItems,
      }).eq('id', uniId);
    } catch (e) {
      console.error('Supabase addItemToUniverseTimeline error:', e);
    }
  }, [userId]);

  const removeItemFromUniverseTimeline = useCallback(async (uniId: string, itemId: string) => {
    let newItems: (MediaItem | Record<string, unknown>)[] = [];

    setState((prev) => ({
      ...prev,
      universeTimelines: prev.universeTimelines.map((u) => {
        if (u.id === uniId) {
          newItems = (u.items || []).filter((i) => {
            const iObj = i as Record<string, unknown>;
            return iObj.id !== itemId && iObj.mediaId !== itemId && iObj.title !== itemId;
          });
          return { ...u, items: newItems };
        }
        return u;
      }),
    }));

    if (!userId) return;

    try {
      await supabase.from('universe_timelines').update({
        items: newItems,
      }).eq('id', uniId);
    } catch (e) {
      console.error('Supabase removeItemFromUniverseTimeline error:', e);
    }
  }, [userId]);

  const reorderUniverseTimelineItems = useCallback(async (uniId: string, itemId: string, direction: 'up' | 'down') => {
    let reindexedItems: (MediaItem | Record<string, unknown>)[] = [];

    setState((prev) => ({
      ...prev,
      universeTimelines: prev.universeTimelines.map((u) => {
        if (u.id !== uniId) return u;

        const currentItems = [...(u.items || [])];
        const index = currentItems.findIndex((item) => {
          const itemObj = item as Record<string, unknown>;
          return (itemObj.id || itemObj.title) === itemId;
        });
        if (index === -1) return u;

        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= currentItems.length) return u;

        const [movedItem] = currentItems.splice(index, 1);
        currentItems.splice(targetIndex, 0, movedItem);
        reindexedItems = currentItems.map((item, idx: number) => ({ ...(item as Record<string, unknown>), chronoOrder: idx + 1 }));
        return { ...u, items: reindexedItems };
      }),
    }));

    if (!userId || !reindexedItems.length) return;

    try {
      await supabase.from('universe_timelines').update({ items: reindexedItems }).eq('id', uniId);
    } catch (e) {
      console.error('Supabase reorderUniverseTimelineItems error:', e);
    }
  }, [userId]);

  // Memoized Filtered Library
  const filteredLibrary = useMemo(() => {
    let entries = [...state.library];
    if (filter.status !== 'all') entries = entries.filter((e) => e.status === filter.status);
    if (filter.type !== 'all') entries = entries.filter((e) => e.media.type === filter.type);
    if (filter.search) {
      const q = filter.search.toLowerCase();
      entries = entries.filter((e) => e.media.title.toLowerCase().includes(q) || (e.media.titleEnglish && e.media.titleEnglish.toLowerCase().includes(q)));
    }
    switch (filter.sort) {
      case 'recently_updated': entries.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()); break;
      case 'recently_added': entries.sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()); break;
      case 'a_z': entries.sort((a, b) => a.media.title.localeCompare(b.media.title)); break;
      case 'rating': entries.sort((a, b) => (b.userRating || 0) - (a.userRating || 0)); break;
      case 'release_date': entries.sort((a, b) => b.media.year - a.media.year); break;
    }
    return entries;
  }, [state.library, filter]);

  // Memoized Continue Watching
  const continueWatching = useMemo(() => {
    return state.library
      .filter((e) => e.status === 'watching')
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [state.library]);

  // Memoized Stats
  const stats = useMemo(() => computeStats(state), [state]);

  const handleExportJSON = useCallback(() => exportJSON(state), [state]);
  const handleExportCSV = useCallback(() => exportCSV(state), [state]);
  const handleImportJSON = useCallback((text: string) => {
    const newState = importJSON(text);
    setState(newState);
  }, []);

  return {
    state, filter, setFilter, filteredLibrary,
    continueWatching, watchHistory: state.watchHistory,
    collections: state.collections,
    universeTimelines: state.universeTimelines,
    stats, loading, hydrated: !loading,
    addEntry, updateEntry, removeEntry, addEpisode, subtractEpisode,
    addCollection, deleteCollection, addItemToCollection, removeItemFromCollection, toggleItemInCollection,
    addUniverseTimeline, deleteUniverseTimeline, addItemToUniverseTimeline, removeItemFromUniverseTimeline, reorderUniverseTimelineItems,
    handleExportJSON, handleExportCSV, handleImportJSON,
  };
}
