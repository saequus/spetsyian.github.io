# 0. Project Overview

**spetsyian.github.io** is the personal website and digital presence for **Slava Saequus** (also known as saequus).

## Purpose

This is a minimalist yet rich personal site that serves as:

- Professional portfolio and CV hub
- Showcase of current work (Serpentaria Capital / SalesAmplifier) and past experience
- Curated collection of "favorite links" and intellectual resources
- Availability and booking surface (calendar integration)
- Personal identity expression (including personality test results like Enneagram and Human Design)

The tone is thoughtful, precise, and warm — reflecting the personality of its owner: a senior engineer and team lead who values clear thinking, craftsmanship, and meaningful connections.

## Technical Foundation

- **Framework**: Next.js (Pages Router) + TypeScript + React
- **Styling**: Custom CSS with heavy emphasis on a bespoke "liquid glass" design system (see `styles/globals.css` and components like `GlassNav`, `SiteShell`, `GlassFooter`)
- **Deployment**: Static export (`next build` → `out/`) hosted on GitHub Pages
- **Key features**:
  - Video background layer with subtle vignette
  - Fully responsive floating glass navigation
  - Glassmorphic content blocks and cards
  - Booking/calendar flow
  - Project showcases with images

## Design Direction

The visual language centers on **liquid glass / frosted glassmorphism** over deep, gentle black backgrounds with mild warm orange accents. 

Reference imagery in `tempfolder/` demonstrates the intended premium glass aesthetic:
- Soft, heavily rounded forms with internal light and glow
- Layered translucency and backdrop blur
- Strong directional lighting (especially warm bottom glows)
- Tactile, almost physical presence

Current implementation uses a more restrained version of this language (warm gold tints). The design guidelines document expands on how to evolve toward the richer, more luminous glass style shown in the references while maintaining excellent readability and performance.

## Repository Structure (key paths)

- `pages/` — Next.js pages (home, work, projects, links, calendar)
- `components/` — Reusable glass components (GlassNav, SiteShell, etc.)
- `styles/globals.css` — Core design system (liquid-glass primitives)
- `lib/profile.ts` — Centralized personal and content data
- `public/assets/` — Static images, CV, etc.
- `docs/` — Project documentation (this folder)

The site is intentionally lightweight, fast, and self-contained.
