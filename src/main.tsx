import "./index.css";

import { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, useRoutes } from "react-router";
import routes from "~react-pages";

import { LoadingFrame } from "@/components/shell";
import { LocaleProvider } from "@/i18n";
import SiteLayout from "@/pages/_layout";

// eslint-disable-next-line react-refresh/only-export-components
function App() {
  return (
    <Suspense fallback={<LoadingFrame />}>
      {useRoutes([{ element: <SiteLayout />, children: routes }])}
    </Suspense>
  );
}

const app = createRoot(document.getElementById("root")!);

app.render(
  <StrictMode>
    <LocaleProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </LocaleProvider>
  </StrictMode>,
);
