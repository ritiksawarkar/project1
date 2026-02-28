import { Outlet } from "react-router-dom";
import AppHeader from "./components/AppHeader.jsx";
import AppFooter from "./components/AppFooter.jsx";

function AppLayout() {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      <AppHeader />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>

      <AppFooter />
    </div>
  );
}

export default AppLayout;
