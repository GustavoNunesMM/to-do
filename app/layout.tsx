import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TasksProvider } from "./store/tasks";
import { SettingsProvider } from "./store/settings";
import WallpaperProvider from "./components/WallpaperProvider";
import { TimerLiveProvider } from "./store/timerContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


export const metadata: Metadata = {
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Minha App',
  },
};

// Script inline que desregistra qualquer service worker em dev ou no WebView Flutter.
// Em produção o SW é gerenciado pelo next-pwa normalmente.
const unregisterSW = `
if ('serviceWorker' in navigator && (location.hostname === 'localhost' || navigator.userAgent.includes('wv'))) {
  navigator.serviceWorker.getRegistrations().then(regs => regs.forEach(r => r.unregister()));
}
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased bg-no-repeat bg-cover`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: unregisterSW }} />
      </head>
      <body className="min-h-full flex flex-col">
        <SettingsProvider>
          <WallpaperProvider>
            <TasksProvider><TimerLiveProvider>{children}</TimerLiveProvider></TasksProvider>
          </WallpaperProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}
