---
name: ui-design-system
description: CSS variables, fonts, pixelBtn classes, and Storybook component inventory for DANCADE
metadata:
  type: reference
---

## CSS Variables (globals.css)
```
--color-cyan: #1af9d9
--color-blue: #4285f4
--color-pink: #ff006e
--color-white: #ffffff
--color-black: #000000
--color-navy: #003b84
--color-dark-blue: #1a1a2e
--color-midnight: #222345
--color-slate-gray: #414656
```

## Fonts
- `--font-neo` / `font-neo` class → NeoDunggeunmo (pixel Korean font)
- `--font-arcade` → Press Start 2P
- `--font-korean` → Noto Sans KR

## PixelButton styles (CSS classes in globals.css)
- Base: `.pixelBtn` — border-image pixel art button
- `.pixelBtn--cyan` — cyan variant
- `.pixelBtn--pink` — pink variant
- `.pixelBtn--gray` — gray variant
- Usage: `<PixelButton styleClass="pixelBtn pixelBtn--cyan" />`

## Storybook stories registered
- UI/Common: Window, PixelButton (LoginButton), ToastContainer
- UI/Form: FormField (includes PasswordConfirmField)
- UI/CharacterSelect: Button (SelectButton, ButtonGroup, ActionButton), Feedback (LoadingScreen, ErrorScreen)
- UI/Chat: ChatInput, GuestQuickPanel, MessageList
- UI/Inventory: InventoryItemCard
- UI/Ranking: RankingBoard
- UI/Shop: CategoryTabs, ProductDetailModal, ProductItem, ProductList
- Showcase: Auth, CharacterSelect, Chat, Shop (full-page demos)

## Window variants
- `variant="page"` (default) — full-screen page with bg image, back button, max-w-[1400px]
- `variant="overlay"` — floating overlay, no bg image
- `variant="modal"` — compact modal, no bg image
