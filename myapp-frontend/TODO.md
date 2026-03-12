# Role-Based UI Gating — Implementation Plan

## Role Mapping

| DB Role     | Display Name  | Miro Label    |
|-------------|---------------|---------------|
| `User`      | Kandidat      | KANDIDAT      |
| `Recruiter` | Rekryterare   | REKRYTERARE   |
| `Manager`   | Säljare       | SÄLJARE       |

ADMIN is out of scope for this implementation plan — will be added in a later phase.

---

## Goals

- UI elements (buttons, fields, icons, components) can be shown/hidden per role
- Menu items can be shown/hidden or enabled/disabled per role
- All React components can declaratively express role requirements
- Role changes in `/account` persist to DB and immediately update the UI (reactive, like language switching)
- Users can have multiple roles simultaneously

---

## Implementation Steps

### Step 1 — Extend AuthContext with live roles

**File:** `src/context/AuthContext.tsx`

- Add `roles: string[]` to the context state (populated from `getMyProfile().selected_roles`)
- Add `refreshRoles(): Promise<void>` — re-fetches roles from the API and updates state
- Load roles on initial session restore (alongside user)
- Expose roles via `useAuth()`

```ts
// AuthContext additions
roles: string[];
refreshRoles: () => Promise<void>;
```

---

### Step 2 — Create `useRoles` hook

**File:** `src/hooks/useRoles.ts`

Thin wrapper around `useAuth()` for role checks:

```ts
export function useRoles() {
  const { roles } = useAuth();
  return {
    roles,
    hasRole: (role: string) => roles.includes(role),
    hasAnyRole: (check: string[]) => check.some(r => roles.includes(r)),
    isCandidate:  roles.includes('User'),
    isRecruiter:  roles.includes('Recruiter'),
    isSeller:     roles.includes('Manager'),
  };
}
```

---

### Step 3 — Create `<RoleGate>` component

**File:** `src/components/common/RoleGate.tsx`

Wraps any UI element and shows/hides it based on role:

```tsx
<RoleGate roles={['Recruiter', 'Manager']}>
  <SomeButton />
</RoleGate>
```

Props:
- `roles: string[]` — show if user has ANY of these roles
- `fallback?: ReactNode` — optional content shown when access denied (default: null)
- `mode?: 'hide' | 'disable'` — hide entirely (default) or render disabled

---

### Step 4 — Update HamburgerMenu to use role gating

**File:** `src/components/common/navigation/HamburgerMenu.tsx`

Define a menu config with role requirements per item:

```ts
const menuItems = [
  { to: '/profile',        label: 'menu_profile',         roles: ['User'] },
  { to: '/seller-profile', label: 'menu_seller_profile',  roles: ['Manager'] },
  { to: '/search',         label: 'menu_match_cv_ads',    roles: ['User'] },
  { to: '/matching',       label: 'menu_matching',        roles: ['User'] },
  { to: '/add-job-ad',     label: 'menu_post_ad',         roles: ['Recruiter', 'Manager'] },
  { to: '/match-ad-cvs',   label: 'menu_match_cv_ads',    roles: ['Recruiter', 'Manager'] },
  { to: '/compare-cv-jobad', label: 'menu_match_cv_jobad', roles: [] }, // all roles
  { to: '/settings',       label: 'menu_settings',        roles: [] },  // all roles
  { to: '/account',        label: 'menu_account_settings', roles: [] }, // all roles
];
```

Empty `roles: []` = visible to all authenticated users.

---

### Step 5 — Trigger `refreshRoles` after role change in AccountPage

**File:** `src/features/account/AccountPage.tsx`

After `updateRoles` API call succeeds, call `refreshRoles()` from `useAuth()` to make the UI update immediately — same pattern as `changeLanguage()` in TranslationProvider.

---

### Step 6 — Add locale keys for new menu items

**Files:** `src/locales/sv.json`, `src/locales/en.json`

Add missing translation keys for any role-gated menu items that need new labels (e.g. `menu_seller_profile`).

---

## Usage Examples

```tsx
// Hide a button for non-recruiters
<RoleGate roles={['Recruiter', 'Manager']}>
  <button>Lägg till kandidat</button>
</RoleGate>

// Conditionally render in component logic
const { isRecruiter, isSeller } = useRoles();
if (isRecruiter) { ... }

// Disable (not hide) for wrong role
<RoleGate roles={['Manager']} mode="disable">
  <input ... />
</RoleGate>
```

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/context/AuthContext.tsx` | Add `roles`, `refreshRoles` |
| `src/hooks/useRoles.ts` | Create |
| `src/components/common/RoleGate.tsx` | Create |
| `src/components/common/index.ts` | Export `RoleGate` |
| `src/components/common/navigation/HamburgerMenu.tsx` | Use role-gated menu config |
| `src/features/account/AccountPage.tsx` | Call `refreshRoles()` after role save |
| `src/locales/sv.json` + `en.json` | Add missing keys |
