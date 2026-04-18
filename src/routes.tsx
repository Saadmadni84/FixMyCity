import { RouteObject } from "react-router-dom";
import { lazy } from "react";
import HomePage from "./pages/index";
import ReportPage from "./pages/report";
import CitizenLoginPage from "./pages/citizen-login";
import CitizenDashboard from "./pages/citizen-dashboard";
import OfficerLoginPage from "./pages/officer-login";
import OfficerDashboard from "./pages/officer-dashboard";
import TrackPage from "./pages/track";
import MapPage from "./pages/map";

const NotFoundPage = import.meta.env.DEV
  ? lazy(() => import("../dev-tools/src/PageNotFound"))
  : lazy(() => import("./pages/_404"));

export const routes: RouteObject[] = [
  { path: "/", element: <HomePage /> },
  { path: "/report", element: <ReportPage /> },
  { path: "/map", element: <MapPage /> },
  { path: "/citizen-login", element: <CitizenLoginPage /> },
  { path: "/citizen-dashboard", element: <CitizenDashboard /> },
  { path: "/officer-login", element: <OfficerLoginPage /> },
  { path: "/officer-dashboard", element: <OfficerDashboard /> },
  { path: "/track", element: <TrackPage /> },
  { path: "*", element: <NotFoundPage /> },
];

export type Path =
  | "/"
  | "/report"
  | "/map"
  | "/citizen-login"
  | "/citizen-dashboard"
  | "/officer-login"
  | "/officer-dashboard"
  | "/track";
export type Params = Record<string, string | undefined>;
