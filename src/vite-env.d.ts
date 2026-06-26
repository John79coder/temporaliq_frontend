/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_API_URL: string
    readonly VITE_STRIPE_PUBLIC_KEY: string
    readonly VITE_APPLE_CLIENT_ID: string
    readonly VITE_NOTION_CLIENT_ID: string
    readonly VITE_NOTION_REDIRECT_URI: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}