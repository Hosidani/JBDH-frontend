# Coding Guidelines — myapp-frontend

---

Use this document as a guideline for future human development and/or as an instruction to your favourite LLM AI coder.

---

## Designdirektiv — Komponentbibliotek

Dessa direktiv gäller all ny och modifierad kod i `myapp-frontend`. Avvik **inte** från dem utan att uppdatera denna fil.

### 1. Använd alltid de etablerade komponenterna

Vi har ett tvålagers komponentbibliotek. Skapa **inte** egna inline-varianter av saker som redan finns.

**UI-primitiver** (`src/components/ui/`) — atoma, återanvändbara byggstenar:

| Komponent | Används för |
|---|---|
| `TextInput` | Alla textfält — stödjer `readOnly`-läge för visning |
| `Button` | Alla knappar — `variant`: `primary \| secondary \| danger \| ghost` |
| `Heading` | Rubriker — `level`: `1–4`, ger konsekvent typografi |
| `Badge` | Etiketter/taggar — `color`: `blue \| green \| red \| yellow \| gray \| purple` |
| `Toggle` | Av/på-brytare (boolean) |
| `CheckboxGroup` | Grupp av kryssrutor med etiketter |
| `FileDropZone` | Fil-uppladdning med drag-and-drop |

```tsx
import { TextInput, Button, Heading, Badge, Toggle, CheckboxGroup, FileDropZone } from '../../components/ui';
```

**Sammansatta komponenter** (`src/components/common/`) — byggda på primitiver:

| Komponent | Används för |
|---|---|
| `PageWrapper` | Yttre sidombrytning — **alltid** `<PageWrapper>` som rot på en sida |
| `SectionCard` | Vitt kort med skugga och border — ersätter alla `<div className="card ...">` |
| `PageCard` | `SectionCard` med titelfält och valfri åtgärdsknapp |
| `FormField` | Label + input + felmeddelande |
| `InfoRow` | Etikett + visningsvärde (readonly `TextInput`) |
| `Modal` | Dialogruta med backdrop och stängknapp |
| `ConfirmModal` | Bekräftelsedialog med Bekräfta/Avbryt-knappar |
| `RoleGate` | Döljer eller inaktiverar UI-element baserat på användarens roll |
| `PageBackground` | Bakgrundsbild med opacity/blur |

```tsx
import { PageWrapper, PageBackground, SectionCard, PageCard, FormField, InfoRow, Modal } from '../../components/common';
```

### 2. Sidstruktur — alltid samma mönster

Varje sida ska följa denna grundstruktur:

```tsx
return (
  <>
    <PageBackground imageUrl="/min-bild.png" opacity={1} blur={0} />
    <PageWrapper>
      <SectionCard>
        {/* sidinnehåll */}
      </SectionCard>
    </PageWrapper>
  </>
);
```

- `PageWrapper` bestämmer bredden (760 px, centrerad). Lägg **aldrig** en egen `max-w-*` eller `w-*` utanpå.
- `SectionCard` är alltid det vita kortet. Använd **inte** `<div className="card ...">` eller egna `bg-white rounded shadow`-kombinationer.

### 3. Formulär och fält

- Alla textinputs → `TextInput`. Stöder `readOnly`, `error`, `label`, `placeholder`.
- Visa data (ej redigerbart) → `InfoRow` eller `TextInput readOnly`.
- Knappar → `Button` med rätt `variant`. Använd **inte** råa `<button>` med Tailwind-klasser.
- Rubrik på sektion → `Heading level={2}` eller `level={3}`. Använd **inte** `<h2 className="text-2xl font-bold ...">`.

### 4. Skapa inte nya komponenter i onödan

Innan du skapar en ny komponent, kontrollera:

1. Finns primitiven redan i `src/components/ui/`?
2. Finns den sammansatta varianten i `src/components/common/`?
3. Räcker `SectionCard` + `PageCard` + inbyggda HTML-element?

Skapa en ny komponent bara om den fyller ett genuint nytt syfte som inte kan lösas med de befintliga.

### 5. Uppdatera denna fil vid förändringar

Om du lägger till, byter namn på eller tar bort en komponent ur biblioteket — uppdatera tabellerna ovan. Filen är källan till sanning för vilka komponenter som finns och hur de används.

---

## Role-Based UI Gating

The app supports three user roles. A logged-in user can hold any combination of them simultaneously.

| DB value      | Display name  | Meaning                   |
|---------------|---------------|---------------------------|
| `User`        | Sökande       | Job seeker / candidate    |
| `Recruiter`   | Rekryterare   | Recruiter                 |
| `Manager`     | Säljare       | Sales / account manager   |

Roles are stored in the backend and fetched client-side from `GET /api/account/getaccountsettings` (via `ApiService.getAccountSettings()`). They are enriched into React context automatically after login — if the login response does not include roles, the context fetches them from account settings. Roles are kept live via `refreshRoles()` from `useAuth()`.

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
| `roles` | `string[]` | required | Show content if user has ANY of these roles. `[]` = visible to all **authenticated** users. |
| `mode` | `'hide' \| 'disable'` | `'hide'` | `hide` removes the element entirely; `disable` renders it wrapped in `pointer-events-none opacity-40`. |
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

Menu items in `HamburgerMenu.tsx` use a `MENU_ITEMS` config array. Each entry has a `roles` field:

| `roles` value | Visibility |
|---|---|
| `null` | Always visible — even to unauthenticated users |
| `[]` | Visible to all authenticated users |
| `['Recruiter']` | Visible only if user has that role |

```ts
// src/components/common/navigation/HamburgerMenu.tsx
const MENU_ITEMS: MenuItem[] = [
  { to: '/profile',          labelKey: 'menu_profile',          roles: [] },
  { to: '/account',          labelKey: 'menu_account_settings', roles: [] },
  { to: '/search',           labelKey: 'menu_match_cv_ads',     roles: null },
  { to: '/saved-jobs',       labelKey: 'menu_saved_jobs',       roles: [] },
  { to: '/add-job-ad',       labelKey: 'menu_post_ad',          roles: ['Recruiter'] },
  { to: '/compare-cv-jobad', labelKey: 'menu_match_cv_jobad',   roles: null },
  { to: '/about',            labelKey: 'menu_how_it_works',     roles: null },
];
```

To add a new menu item, append an entry to `MENU_ITEMS`. Do not add separate `{user && ...}` conditionals.

---

### Changing roles at runtime

Roles are managed in `/account` (edit form). Any successful role change should call `refreshRoles()` from `useAuth()`, which re-fetches roles from `getAccountSettings()` and updates the context. All `useRoles()` consumers and `<RoleGate>` wrappers react immediately — no page reload needed.

If you add a new place in the UI where roles can be changed, follow this pattern:

```ts
const { refreshRoles } = useAuth();

// After a successful role-update API call:
await ApiService.updateAccountSettings({ roles: newRoles });
await refreshRoles();
```

---

### Adding a new role (future)

1. Add the value to `UserRole` choices in the Django model (`JBDH-backend`).
2. Add a locale key for the display name in `sv.json` and `en.json`.
3. Add a checkbox option to the `CheckboxGroup` in `/account` (AccountPage.tsx).
4. Gate any UI elements with `<RoleGate roles={['NewRole']}>` or `hasRole('NewRole')`.
5. Add a shortcut boolean to `useRoles.ts` if the role will be checked frequently (e.g. `isNewRole: roles.includes('NewRole')`).

> Note: `ADMIN` role is **out of scope** for this web app's UI gating. Do not add it to the frontend role list.

---

### Decision guide

| Situation | Use |
|---|---|
| Conditionally render a JSX block | `<RoleGate roles={[...]}>` |
| Render but visually disable a control | `<RoleGate roles={[...]} mode="disable">` |
| Conditional logic in component code | `useRoles()` |
| Gate a menu item | Add entry to `MENU_ITEMS` in `HamburgerMenu.tsx` with correct `roles` value |
| Persist a role change and update the UI | `updateAccountSettings({ roles })` + `refreshRoles()` from `useAuth()` |
