# Wireframe UI Implementation Plan

> **For agentic workers:** Implement this plan in the current checkout, one task at a time.

**Goal:** Build the desktop Figma wireframe as the project's navigable frontend with no business logic or API calls.

**Architecture:** Use the existing React + Vite frontend folders, adding named application routes and a shared shell. Render role-specific screens from local illustrative data; navigation changes the visible screen only.

**Tech Stack:** React, Vite, plain CSS.

**Spec:** `docs/superpowers/specs/2026-11-03-project-foundation-design.md` plus Figma file `NvBMJEVL0hXbaoZDkDPYu4` and `docs/wireframe.png`.

## Global Constraints

- Keep frontend code under `frontend/`.
- Match the wireframe's restrained grayscale style and Vietnamese labels.
- Keep all records illustrative; do not call the backend or imply actions persist.
- Cover the 16 desktop screens and the shared state/reference screen. Mobile layouts are out of scope per user direction.
- Preserve pre-existing changes in README.md, docs/wireframe.png, docs/project-notes.md, and other untracked docs.

## Review Focus

- Every registered screen is reachable from the screen switcher and role navigation.
- Target the 1440px desktop wireframe; mobile and responsive layouts are out of scope per user direction.
- Buttons are presentational/navigation affordances only; no API requests or business mutations occur.
- Empty, status, and confirmation patterns remain visible where shown in the wireframe.
- Screen labels and role context remain clear when switching between customer, technician, and admin screens.

---

### Task 1: App entry, screen registry, shared navigation, and visual foundation

**Files:**
- Create or modify `frontend/package.json`, `frontend/vite.config.js`, `frontend/index.html`.
- Modify `frontend/src/main.jsx`, `frontend/src/App.jsx`, `frontend/src/routes/AppRouter.jsx`, `frontend/src/components/AppLayout.jsx`, `frontend/src/styles/index.css`.

**Deliverable:** A React/Vite shell with named application routes, desktop header, screen chooser for review, typography, spacing, form, card, table, and badge components.

### Task 2: Wireframe screen compositions

**Files:**
- Create `frontend/src/data/demoData.js`, `frontend/src/navigation/screenRoutes.js`, and shared components in `frontend/src/components/`.
- Fill the existing page files under `frontend/src/pages/shared/`, `customer/`, `technician/`, and `admin/`; add the tracking/review pages needed for screens 07, 08, and 14.

**Deliverable:** Render screens 01–16 and S from the app's role-specific pages, with named routes that move through the depicted customer/technician/admin flows. No separate wireframe page folder.

### Task 3: Launchable preview and visual pass

**Files:** No new files unless a concrete display issue requires a focused CSS change.

**Deliverable:** Start the local Vite preview and inspect desktop navigation/layout. Resolve visual defects found during that pass. No automated tests are required for this UI-only request.
