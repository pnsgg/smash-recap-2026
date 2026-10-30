import type { ReactNode } from "react";
import { isRouteErrorResponse, Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";
import type { Route } from "./+types/root";
import { PRE_PAINT_SCRIPT, SettingsProvider } from "./lib/settings";
import { NotFound } from "./pages/NotFound";
import { ServerError } from "./pages/ServerError";
import "./styles/global.css";

export const links: Route.LinksFunction = () => [
  { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
  { rel: "preload", href: "/fonts/dos-iyagi-boldface.woff2", as: "font", type: "font/woff2", crossOrigin: "anonymous" },
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Libre+Franklin:wght@400;600;700&display=swap",
  },
];

export function Layout({ children }: { children: ReactNode }) {
  return (
    // The pre-paint script adds classes to <html> before React hydrates it.
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0b0f0d" />
        <script dangerouslySetInnerHTML={{ __html: PRE_PAINT_SCRIPT }} />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <SettingsProvider>
      <Outlet />
    </SettingsProvider>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return (
    <SettingsProvider>
      {isRouteErrorResponse(error) && error.status === 404 ? <NotFound /> : <ServerError />}
    </SettingsProvider>
  );
}
