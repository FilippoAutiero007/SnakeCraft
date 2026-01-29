/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CLERK_PUBLISHABLE_KEY: string
  // aggiungi altre variabili d'ambiente qui se necessario
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
