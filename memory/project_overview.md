---
name: project-overview
description: DANCADE project stack, folder structure, and key architectural decisions
metadata:
  type: project
---

DANCADE is a Next.js (App Router) pixel-art arcade platform. Users pick/customize a character then enter a Phaser.js game room with real-time chat.

**Why:** Educational/portfolio project with Supabase backend, Railway deployment.

**How to apply:** When editing pages/components, assume Next.js App Router conventions. Supabase handles auth + DB. Phaser handles the game canvas.

## Stack
- Next.js (App Router) + TypeScript
- Tailwind CSS v4 (`@import "tailwindcss"` in globals.css — no tailwind.config.ts)
- Supabase (auth, DB, storage)
- Phaser.js (game engine, dynamic import)
- Storybook (UI source of truth)
- Railway (deployment)

## Key folders
- `app/` — Next.js pages (login, register, character-select, chat, shop, game)
- `components/` — React components grouped by domain (auth, chat, shop, inventory, ranking, common, character-select, avatar)
- `stories/` — Storybook stories mirroring components structure
- `hooks/` — Custom hooks
- `lib/supabase/` — Supabase client + queries
- `game/` — Phaser game scenes and managers
- `public/assets/` — Sprites, icons, backgrounds, fonts

## Common components
- `Window` — Page/Modal/Overlay container with pink title bar
- `PixelButton` (LoginButton.tsx) — pixel-art styled button (pixelBtn--cyan/pink/gray)
- `FormField` + `PasswordConfirmField` — auth form inputs with status/error display
- `ToastContainer` / `ToastProvider` — toast notifications
