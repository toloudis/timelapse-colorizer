import React from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, createHashRouter, RouterProvider } from "react-router-dom";

import { getBuildDisplayDateString } from "src/colorizer/utils/math_utils";
import { BASE_URL, INTERNAL_BUILD, VERSION_NUMBER } from "src/constants";
import { ErrorPage, LandingPage } from "src/routes";
import AppStyle from "src/styles/AppStyle";
import { decodeGitHubPagesUrl, isEncodedPathUrl, tryRemoveHashRouting } from "src/utils/gh_routing";
import Viewer from "src/Viewer";

// Detect if running in Electron via file:// protocol
const isElectron = window.location.protocol === "file:";

// Decode URL path if it was encoded for GitHub pages or uses hash routing.
const locationUrl = new URL(window.location.toString());
if (!isElectron && (locationUrl.hash !== "" || isEncodedPathUrl(locationUrl))) {
  const decodedUrl = tryRemoveHashRouting(decodeGitHubPagesUrl(locationUrl));
  const newRelativePath = decodedUrl.pathname + decodedUrl.search + decodedUrl.hash;
  console.log("Redirecting to " + newRelativePath);
  // Replaces the query string path with the original path now that the
  // single-page app has loaded. This lets routing work as normal below.
  window.history.replaceState(null, "", newRelativePath);
}

console.log(`Timelapse Feature Explorer - Version ${VERSION_NUMBER}`);
console.log(`Timelapse Feature Explorer - Basename ${BASE_URL}`);
console.log(`Timelapse Feature Explorer - Last built ${getBuildDisplayDateString()}`);
console.log(`Timelapse Feature Explorer - Running in ${isElectron ? "Electron" : "Browser"}`);
INTERNAL_BUILD && console.log("Timelapse Feature Explorer - --INTERNAL BUILD--");

// Set up react router
// Use hash-based routing for Electron (file:// protocol), browser routing for web
const routes = [
  {
    path: "/",
    element: <LandingPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: "viewer",
    element: <Viewer />,
    errorElement: <ErrorPage />,
  },
];

const router = isElectron
  ? createHashRouter(routes)
  : createBrowserRouter(routes, { basename: BASE_URL });

// Render React component
const container = document.getElementById("root");
const root = createRoot(container!);
root.render(
  <React.StrictMode>
    <AppStyle>
      <RouterProvider router={router} />
    </AppStyle>
  </React.StrictMode>
);
