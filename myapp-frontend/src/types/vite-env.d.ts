/// <reference types="vite/client" />

// Allows importing .md files as raw strings via `import content from './file.md?raw'`
declare module '*.md' {
  const content: string;
  export default content;
}
