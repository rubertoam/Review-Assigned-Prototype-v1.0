# ACE Design System — component gaps (Review Assigned)

Source repo: [ACEDesignSystem](https://github.com/rubertoam/ACEDesignSystem)  
Local path (sandbox): `C:\UX Design\Design System\Design System Sandbox\src`  
Configured alias: `@ace-ds` → sandbox `src` (intended `ds-github` clone when present)

## Swapped to `@ace-ds`

| Local shim | ACE component | Import |
|---|---|---|
| `ui/checkbox.tsx` | `Checkbox` | `@ace-ds/components/atoms/Checkbox/Checkbox` |
| `ui/utils.ts` | `cn` | `@ace-ds/lib/cn` |
| `ui/dialog.tsx` | `DialogModal` | `@ace-ds/components/molecules/DialogModal/DialogModal` |
| `ui/dropdown-menu.tsx` | `AceDropdownMenu` panel + variants (`compact` overflow, `primary` wide) | `@ace-ds/components/molecules/AceDropdownMenu/AceDropdownMenu` |
| `ui/select.tsx` | `AceDropdownMenu` (field trigger + radio group) | `@ace-ds/components/molecules/AceDropdownMenu/AceDropdownMenu` |
| `ResponsiveReviewInterface` site header | `AceSiteHeader` + Janet profile | `@ace-ds/components/organisms/AceSiteHeader/AceSiteHeader` — photo: `public/brand/profiles/janet.png` (`src/app/lib/profileAssets.ts`) |
| `ResponsiveReviewInterface` sidebar | `AceSidebar` (`variant="navigation"`) | `@ace-ds/components/organisms/AceSidebar/AceSidebar` |
| Client profile + screening section + simulator alias rows | `AceAccordion` | `@ace-ds/components/molecules/AceAccordion/AceAccordion` |

Design tokens: `variables.css`, `typography-tokens.css` (imported in `src/main.tsx`).

**Tailwind:** `@ace-ds` component files must be listed in `src/styles/tailwind.css` `@source` — otherwise DS arbitrary utilities (`bg-[var(--dialog-modal-surface)]`, etc.) are not emitted and overlays/menus render transparent.

## Adapter notes

These shims preserve the prototype’s composable Radix-style API while rendering ACE components underneath:

- **Dialog** — `Dialog` + `DialogContent` children are parsed into `DialogModal` props; custom in-content headers and the Match Simulator layout are unchanged.
- **Dropdown** — Radix trigger/content structure with `aceDropdownMenuPanelClass`. Use `variant="compact"` for three-dot overflow menus (`w-[6.75rem]`, matches `SidebarOverflowMenu`); `variant="primary"` for wide menus with purple left accent on items (`w-[16.5rem]`). ACE `Checkbox` for checkbox rows.
- **Select** — `SelectTrigger` / `SelectItem` children are parsed into `AceDropdownMenu` with a field trigger and radio group (same pattern as `LabSelect`).

## Available in ACE DS (not yet used here)

Atoms: `AceButton`, `AceInputField`, `Toggle`, `RadioGroup`, `AceTabs`, `AceTabCards`, `FinScanIcon`, `AceAvailabilityTag`  
Molecules: `AceAccordion`, `AcePagination`, `AceSlider`, `AceTable`, `AceDropdownMenu`, `DialogModal`  
Organisms: `ScreeningResultsTable`, `AceSidebar`, `AceSiteHeader`, `AceDatePicker`, `AceTimePicker`, `AceLandingPageCard`, `AceDataCard`

## Typography / shadow / accordion helpers

- `src/app/lib/aceTypography.ts` — `aceTypography('--ace-type-…')` pairs font + letter-spacing tokens.
- `src/app/lib/aceShadow.ts` — `aceDropShadowXsClass` → `shadow-[var(--ace-drop-shadow-xs)]`.
- `src/app/lib/aceAccordion.ts` — `aceAccordionFixedHeaderClass` → fixed `3.5rem` header row (`--screening-header-min-height`).

## Still partial / not on ACE DS

| Area | Status | Notes |
|---|---|---|
| **Ask Chatty / AI chat bubble** | Missing in ACE DS | Local `AskChattyBubble` uses `AceInputField` + `AceButton`; no DS chat/assistant organism yet. |
| **`AceToast` countdown / progress** | Added in sandbox | Optional `progress` (0–1) bar + default-layout `actionLabel` (Undo) for auto-dismiss hosts. Ship to ACEDesignSystem when ready. |
| **`GroupFormDialog` contextual titles** | Partial | Edit/Copy titles are fixed to “Edit/Copy Group”. Reporting pages need page-specific wording (e.g. report category); delete confirm already uses local contextual copy. Prefer optional `title` / `description` props on `GroupFormDialog`. |
| **`AceSiteHeader` logo click** | Missing | No `onLogoClick` / home action. Prototype overlays a hit target in `ReviewFlowSiteHeader` to open the selected start page. |
| **`AceSidebar` hide New Group** | Missing | Groups variant always renders the top “New Group” control. Data Manager hides it via a local CSS selector until DS adds e.g. `showNewGroup`. |
| **Case list, task bar, review drawer** | Custom | Figma-derived markup; not yet migrated to DS organisms. |
| **Full screening table cells** | Partial | Section shell uses `AceAccordion`; row/table chrome still has hardcoded colors in places. |
| **Typography & colors (shell)** | Partial | Top nav, page header, pills, and accordion headers use `--ace-type-*` / `--screening-*` tokens. Many detail panels and table cells still use legacy hex / `font-['Noto_Sans:…']`. |
| **Unused shims** | Local only | `ui/sidebar.tsx`, `ui/accordion.tsx` (shadcn/Radix) remain unused. |
