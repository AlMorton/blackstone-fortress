import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteError,
} from "react-router";
import { GameProvider } from "~/store/GameProvider";
import "~/styles/app.css";

export function links() {
  return [
    { rel: "preconnect", href: "https://fonts.googleapis.com" },
    {
      rel: "preconnect",
      href: "https://fonts.gstatic.com",
      crossOrigin: "anonymous",
    },
    {
      rel: "stylesheet",
      href:
        "https://fonts.googleapis.com/css2?family=Audiowide&family=Oswald:wght@400;500;600&family=Barlow:ital,wght@0,400;0,500;0,600;1,400&display=swap",
    },
  ];
}

export function meta() {
  return [
    { title: "Blackstone Fortress" },
    {
      name: "description",
      content:
        "Hostile behaviour tracker for Warhammer Quest: Blackstone Fortress.",
    },
  ];
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="min-h-screen">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <GameProvider>
      <main className="bf-wash min-h-screen">
        <div className="mx-auto max-w-[1400px] px-4 pt-4 pb-10">
          <Outlet />
        </div>
      </main>
    </GameProvider>
  );
}

/** Rendered into index.html at build time while the SPA bundle hydrates. */
export function HydrateFallback() {
  return <p className="p-8 text-bf-text">Loading…</p>;
}

export function ErrorBoundary() {
  const error = useRouteError();
  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : error instanceof Error
      ? error.message
      : "Unknown error";

  return (
    <div className="p-8">
      <p className="bf-eyebrow text-bf-kicker">Error</p>
      <h1 className="mt-1 text-2xl text-bf-bright">Something went wrong</h1>
      <p className="mt-2 text-bf-text">{message}</p>
    </div>
  );
}
