# Third-Party Components — JBDH Frontend

This file lists all third-party libraries included in the frontend build.
Update this file whenever a new dependency is added or removed.

---

## Runtime dependencies (`dependencies`)

| Package | Version | License | Purpose |
|---------|---------|---------|---------|
| [@tailwindcss/typography](https://github.com/tailwindlabs/tailwindcss-typography) | ^0.5 | MIT | Tailwind `prose` classes for styled markdown/rich text |
| [expo](https://expo.dev) | ^54 | MIT | React Native / Expo platform |
| [react](https://react.dev) | ^19 | MIT | UI library |
| [react-dom](https://react.dev) | ^19 | MIT | DOM rendering for React |
| [react-markdown](https://github.com/remarkjs/react-markdown) | ^10 | MIT | Render Markdown as React components |
| [react-modal](https://github.com/reactjs/react-modal) | ^3 | MIT | Accessible modal dialogs |
| [react-router-dom](https://reactrouter.com) | ^7 | MIT | Client-side routing |
| [remark-gfm](https://github.com/remarkjs/remark-gfm) | ^4 | MIT | GitHub Flavored Markdown support for react-markdown |

## Dev / build dependencies (`devDependencies`)

| Package | Version | License | Purpose |
|---------|---------|---------|---------|
| [@eslint/js](https://github.com/eslint/eslint) | ^9 | MIT | ESLint core JS rules |
| [@types/node](https://github.com/DefinitelyTyped/DefinitelyTyped) | ^24 | MIT | TypeScript types for Node.js |
| [@types/react](https://github.com/DefinitelyTyped/DefinitelyTyped) | ^19 | MIT | TypeScript types for React |
| [@types/react-dom](https://github.com/DefinitelyTyped/DefinitelyTyped) | ^19 | MIT | TypeScript types for React DOM |
| [@types/react-modal](https://github.com/DefinitelyTyped/DefinitelyTyped) | ^3 | MIT | TypeScript types for react-modal |
| [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react) | ^5 | MIT | Vite plugin for React (Babel) |
| [autoprefixer](https://github.com/postcss/autoprefixer) | ^10 | MIT | PostCSS plugin for vendor prefixes |
| [eslint](https://eslint.org) | ^9 | MIT | JavaScript/TypeScript linter |
| [eslint-plugin-react-hooks](https://github.com/facebook/react) | ^5 | MIT | ESLint rules for React hooks |
| [eslint-plugin-react-refresh](https://github.com/ArnaudBarre/eslint-plugin-react-refresh) | ^0.4 | MIT | ESLint rules for Vite React Refresh |
| [globals](https://github.com/sindresorhus/globals) | ^16 | MIT | Global variable definitions for ESLint |
| [postcss](https://postcss.org) | ^8 | MIT | CSS transformer |
| [tailwindcss](https://tailwindcss.com) | ^3 | MIT | Utility-first CSS framework |
| [typescript](https://www.typescriptlang.org) | ~5.9 | Apache-2.0 | Typed JavaScript |
| [typescript-eslint](https://typescript-eslint.io) | ^8 | MIT | TypeScript support for ESLint |
| [vite](https://vitejs.dev) | ^7 | MIT | Build tool and dev server |

## External resources (CDN)

| Resource | Provider | Purpose |
|----------|----------|---------|
| Barlow font | Google Fonts | Primary typeface |
| Material Symbols Outlined | Google Fonts | Icon library |

---

> **Note:** Versions listed are the semver ranges from `package.json`.
> Run `npm list --depth=0` for exact installed versions.
