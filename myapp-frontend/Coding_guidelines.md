# Coding Guidelines — myapp-frontend

---

Use this documents as a guidline for future human development and/or as an instruction to yout favourite LLM-AI-coder

## Role-Based UI Gating

The app supports three user roles. A logged-in user can hold any combination of them simultaneously.

| DB value      | Display name  | Meaning                   |
|---------------|---------------|---------------------------|
| `User`        | Sökande       | Job seeker / candidate    |
| `Recruiter`   | Rekryterare   | Recruiter                 |
| `Manager`     | Säljare       | Sales / account manager   |

Roles are stored in `UserRoleAssignment` rows in the backend and returned as `selected_roles: string[]` from `GET /api/users/profile/me/`. They are loaded into React context on login and kept live via `refreshRoles()`.

---

### Primitives

#### `useRoles()` — programmatic checks

```ts
import { useRoles } from '../../hooks/useRoles';

const { roles, hasRole, hasAnyRole, isCandidate, isRecruiter, isSeller } = useRoles();
```

| Member | Type | Returns true when… |
|---|---|---|
| `roles` | `string[]` | — the full raw array |
| `hasRole(r)` | `(string) => boolean` | user has exactly this role |
| `hasAnyRole(rs)` | `(string[]) => boolean` | user has at least one of the given roles |
| `isCandidate` | `boolean` | user has `'User'` role |
| `isRecruiter` | `boolean` | user has `'Recruiter'` role |
| `isSeller` | `boolean` | user has `'Manager'` role |

Use `useRoles()` for conditional logic inside component bodies.

```tsx
const { isRecruiter, isSeller } = useRoles();

if (isRecruiter) {
  // show recruiter-only data
}
```

---

#### `<RoleGate>` — declarative JSX gating

```tsx
import { RoleGate } from '../../components/common';
```

Wraps any JSX and either hides it or renders it disabled based on role.

**Props**

| Prop | Type | Default | Description |
|---|---|---|---|
| `roles` | `string[]` | required | Show content if user has ANY of these roles. `[]` = visible to all logged-in users. |
| `mode` | `'hide' \| 'disable'` | `'hide'` | `hide` removes the element entirely; `disable` renders it with `pointer-events-none opacity-40`. |
| `fallback` | `ReactNode` | `null` | Rendered when access is denied and `mode='hide'`. |

**Examples**

```tsx
// Visible only to recruiters and sellers
<RoleGate roles={['Recruiter', 'Manager']}>
  <button>Lägg till kandidat</button>
</RoleGate>

// Visible to candidates only; show a message to others
<RoleGate roles={['User']} fallback={<p>Kräver Sökande-roll</p>}>
  <ProfileInfoCard ... />
</RoleGate>

// Rendered but disabled (greyed out) for non-sellers
<RoleGate roles={['Manager']} mode="disable">
  <input placeholder="Säljare-specifikt fält" />
</RoleGate>

// Visible to all logged-in users (empty roles array)
<RoleGate roles={[]}>
  <SomeComponent />
</RoleGate>
```

> `<RoleGate>` does **not** replace backend authorization. It is purely a UI convenience. Always enforce permissions server-side as well.

---

### Gating an entire route/page

To restrict a whole page to specific roles, add a redirect guard at the top of the page component and add the menu entry with matching roles.

**Step 1 — redirect unauthorized visitors**

```tsx
// src/features/example/ExamplePage.tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRoles } from '../../hooks/useRoles';

export default function ExamplePage() {
  const { isRecruiter } = useRoles();   // or hasAnyRole(['Recruiter', 'Manager'])
  const navigate = useNavigate();

  useEffect(() => {
    if (!isRecruiter) navigate('/');
  }, [isRecruiter, navigate]);

  if (!isRecruiter) return null;        // prevent flash of content

  return ( /* page JSX */ );
}
```

**Step 2 — hide the menu item for non-recruiters**

```ts
// src/components/common/navigation/HamburgerMenu.tsx  — MENU_ITEMS array
{ to: '/example-view', labelKey: 'menu_example', roles: ['Recruiter'] },
```

**Step 3 — add the locale key**

```json
// sv.json
"menu_example": "Exempel-vy",

// en.json
"menu_example": "Example view",
```

The route itself (`App.tsx`) needs no role check — the page component handles unauthorized access.

---

### Role-gated navigation

Menu items in `HamburgerMenu.tsx` use a `MENU_ITEMS` config array. Each entry has a `roles` field that follows the same rule as `<RoleGate>`:

```ts
// src/components/common/navigation/HamburgerMenu.tsx
const MENU_ITEMS: MenuItem[] = [
  { to: '/profile',        labelKey: 'menu_profile',        roles: ['User'] },
  { to: '/seller-profile', labelKey: 'menu_seller_profile', roles: ['Manager'] },
  // roles: [] means visible to all authenticated users
  { to: '/settings',       labelKey: 'menu_settings',       roles: [] },
  ...
];
```

To add a new menu item, append an entry to `MENU_ITEMS`. Do not add separate `{user && ...}` conditionals.

---

### Changing roles at runtime

Roles are managed by the user in `/settings` (checkbox group) and in `/account` (edit form). Any successful role change calls `refreshRoles()` from `useAuth()`, which re-fetches roles from the API and updates the context. All `useRoles()` consumers and `<RoleGate>` wrappers react immediately — no page reload needed.

If you add a new place in the UI where roles can be changed, follow this pattern:

```ts
const { refreshRoles } = useAuth();

// After a successful role-update API call:
await ApiService.updateAccountSettings({ updateRoles: newRoles });
await refreshRoles();
```

---

### Adding a new role (future)

1. Add the value to `UserRole` choices in the Django model (`JBDH-backend/apps/users/models/roles.py`).
2. Add a locale key for the display name in `sv.json` and `en.json`.
3. Add a checkbox option to the `CheckboxGroup` in `SettingsPage.tsx`.
4. Gate any UI elements with `<RoleGate roles={['NewRole']}>` or `hasRole('NewRole')`.

> Note: `ADMIN` role is **out of scope** for this web app's UI gating. Do not add it to the frontend role list.

---

### Decision guide

| Situation | Use |
|---|---|
| Conditionally render a JSX block | `<RoleGate roles={[...]}>` |
| Render but visually disable a control | `<RoleGate roles={[...]} mode="disable">` |
| Conditional logic in component code | `useRoles()` |
| Gate a menu item | Add entry to `MENU_ITEMS` in `HamburgerMenu.tsx` |
| Persist a role change and update the UI | `updateAccountSettings({ updateRoles })` + `refreshRoles()` |
