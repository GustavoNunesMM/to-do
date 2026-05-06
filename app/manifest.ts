import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Minha App',
        short_name: 'App',
        description: 'Gerenciador de atividades',
        start_url: '/',
        display: 'standalone',        // <- sem barra do browser
        background_color: '#0f0f1a',
        theme_color: '#0f0f1a',
        orientation: 'portrait',
        icons: [
            {
                src: '/icons/icon-192x192.png',
                sizes: '192x192',
                type: 'image/png',
                purpose: 'any',
            },
            {
                src: '/icons/icon-512x512.png',
                sizes: '512x512',
                type: 'image/png',
            },
        ],
    };
}