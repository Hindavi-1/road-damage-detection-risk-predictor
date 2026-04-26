/**
 * App — root component.
 * Sets up React Router with a shared layout (Sidebar + Navbar) wrapping all pages.
 */

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/layout/Sidebar";
import Navbar  from "./components/layout/Navbar";

import LandingPage     from "./pages/LandingPage";
import DetectPage      from "./pages/DetectPage";
import DashboardPage   from "./pages/DashboardPage";
import DatasetPage     from "./pages/DatasetPage";
import MethodologyPage from "./pages/MethodologyPage";
import AboutPage       from "./pages/AboutPage";

/**
 * AppLayout — wraps authenticated pages with sidebar + navbar chrome.
 */
function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-[#0B0F1A]">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing page — uses full-screen layout */}
        <Route
          path="/"
          element={
            <AppLayout>
              <LandingPage />
            </AppLayout>
          }
        />

        {/* Detection workflow */}
        <Route
          path="/detect"
          element={
            <AppLayout>
              <DetectPage />
            </AppLayout>
          }
        />

        {/* Analytics dashboard */}
        <Route
          path="/dashboard"
          element={
            <AppLayout>
              <DashboardPage />
            </AppLayout>
          }
        />

        {/* Dataset overview */}
        <Route
          path="/dataset"
          element={
            <AppLayout>
              <DatasetPage />
            </AppLayout>
          }
        />

        {/* Methodology */}
        <Route
          path="/methodology"
          element={
            <AppLayout>
              <MethodologyPage />
            </AppLayout>
          }
        />

        {/* About */}
        <Route
          path="/about"
          element={
            <AppLayout>
              <AboutPage />
            </AppLayout>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
