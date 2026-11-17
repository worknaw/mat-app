---
name: MAT - Netflix Style Media Tracking
description: Cinematic Netflix-inspired media tracking dashboard & personal analytics hub
colors:
  bg-primary: "#141414"
  bg-secondary: "#181818"
  bg-card: "#2f2f2f"
  bg-card-hover: "#3d3d3d"
  accent-primary: "#e50914"
  accent-secondary: "#b81d24"
  accent-badge: "#e50914"
  accent-green: "#46d369"
  accent-yellow: "#f5c518"
  text-primary: "#ffffff"
  text-secondary: "#b3b3b3"
  text-muted: "#808080"
  border: "rgba(255, 255, 255, 0.1)"
  border-bright: "rgba(255, 255, 255, 0.25)"
typography:
  fontFamily: "'Inter', system-ui, -apple-system, sans-serif"
  display:
    fontFamily: "'Inter', system-ui, sans-serif"
    fontSize: "2.5rem"
    fontWeight: 900
    lineHeight: 1.1
  body:
    fontFamily: "'Inter', system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
rounded:
  sm: "4px"
  md: "8px"
  lg: "12px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "36px"
components:
  hero-banner:
    backgroundColor: "{colors.bg-primary}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.lg}"
    padding: "48px 36px"
  button-primary:
    backgroundColor: "{colors.text-primary}"
    textColor: "{colors.bg-primary}"
    rounded: "{rounded.sm}"
    padding: "10px 24px"
  button-secondary:
    backgroundColor: "rgba(109, 109, 110, 0.7)"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.sm}"
    padding: "10px 24px"
---

# Design System: MAT Netflix Redesign

## 1. Overview

MAT is redesigned with a cinematic, Netflix-style interface. Featuring a full-bleed Hero Featured Spotlight, horizontal poster carousels, Netflix red (`#e50914`) branding highlights, deep `#141414` canvas, high-contrast white typography, and hover-to-expand card micro-interactions.

## 2. Colors: Cinematic Netflix Palette

- **Canvas Surfaces**: `#141414` main background, `#181818` header/nav background, `#2f2f2f` card container, `#3d3d3d` card hover.
- **Accents**: Netflix Red `#e50914` for active badges, progress highlights, and branding logo; `#46d369` (green) for match percentages and watch status; `#f5c518` (yellow) for ratings.
- **Typography & Borders**: `#ffffff` primary text, `#b3b3b3` secondary text, `#808080` muted labels. `rgba(255, 255, 255, 0.1)` translucent sub-borders.

## 3. Typography: Bold Cinematic Hierarchy

- **Font Family**: Inter / System sans-serif.
- **Hierarchy**: Extra-bold display titles for featured hero banners; bold 18px headers for section rows; medium 14px titles for media cards.

## 4. Elevation: Layered Media Cards

- **Poster Cards**: Aspect ratio 16/9 for continue watching episodes and 2/3 for library posters.
- **Hover Micro-interactions**: `scale(1.05)` zoom on hover with drop shadow (`0 12px 30px rgba(0, 0, 0, 0.8)`), displaying quick-action play, `+` episode, and info buttons.

## 5. Components

- **Netflix Navbar**: Sticky top navigation bar transitioning from transparent to solid `#141414` on scroll, featuring brand logo, menu categories, global search (`Ctrl+K`), and profile avatar.
- **Hero Spotlight**: Large featured banner displaying active "Continue Watching" item with background artwork backdrop, episode progress bar, big Play/Resume button, and quick details.
- **Horizontal Media Shelves**: Smooth horizontal scrolling rows ("Continue Watching", "Recently Updated", "Top Genres", "Recommendations") with left/right scroll arrows.
- **Media Detail Modal**: Netflix-style popover overlay displaying trailer/backdrop image, full synopsis, episode picker, genre tags, and status actions.

## 6. Do's and Don'ts

- **Do**: Use deep `#141414` backgrounds with high-contrast `#ffffff` titles; use Netflix red `#e50914` for CTA accents and active indicators; structure dashboard as cinematic horizontal content shelves.
- **Don't**: Use harsh bright white backgrounds, cluttered multi-column tables, or plain unstyled card lists.
