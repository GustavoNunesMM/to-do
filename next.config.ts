import type { NextConfig } from 'next';
const { PHASE_DEVELOPMENT_SERVER, PHASE_PRODUCTION_BUILD } = require('next/constants');

const nextConfig: NextConfig = {
    reactStrictMode: true,
    webpack: (config, { dev }) => {
        if (dev) {
            config.watchOptions = {
                ...config.watchOptions,
                ignored: /node_modules|\.next|flutter_app[\\/]build|public[\\/](sw\.js|workbox-|swe-worker-)/,
            };
        }
        return config;
    },
};

module.exports = (phase: string) => {
    if (phase === PHASE_PRODUCTION_BUILD) {
        const withPWA = require('@ducanh2912/next-pwa').default({
            dest: 'public',
            cacheOnFrontEndNav: true,
            reloadOnOnline: false,
        });
        return withPWA(nextConfig);
    }
    return nextConfig;
};