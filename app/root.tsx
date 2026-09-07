import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteError,
} from "react-router";
import { Sidebar } from "~/components/Sidebar";
import { GameProvider } from "~/store/GameProvider";
import "~/styles/app.css";

export function links() {
  return [
    { rel: "preconnect", href: "https://fonts.googleapis.com" },
    { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
    {
      rel: "stylesheet",
      href: "https://fonts.googleapis.com/css2?family=Audiowide&display=swap",
    },
  ];
}

export function meta() {
  return [
    { title: "Blackstone Fortress" },
    {
      name: "description",
      content: "Hostile behaviour tracker for Warhammer Quest: Blackstone Fortress.",
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
      <div className="flex min-h-screen flex-col md:flex-row">
        <Sidebar />
        <main className="bf-backdrop min-w-0 flex-1">
          <div className="px-4 pt-4 pb-8">
            <Outlet />
          </div>
        </main>
      </div>
    </GameProvider>
  );
}

/** Rendered into index.html at build time while the SPA bundle hydrates. */
export function HydrateFallback() {
  return <p className="p-8 text-white">Loading...</p>;
}

export function ErrorBoundary() {
  const error = useRouteError();
  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : error instanceof Error
      ? error.message
      : "Unknown error";

  return (
    <div className="p-8 text-white">
      <h1 className="text-2xl">Something went wrong</h1>
      <p className="mt-2 text-bf-text">{message}</p>
    </div>
  );
}
