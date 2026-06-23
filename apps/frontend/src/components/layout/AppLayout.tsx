import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

export function AppLayout() {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto"
          style={{
            background: `
              radial-gradient(ellipse at 80% 20%, hsl(var(--primary) / 0.05) 0%, transparent 50%),
              radial-gradient(ellipse at 20% 80%, hsl(var(--accent) / 0.03) 0%, transparent 50%),
              hsl(var(--muted) / 0.4)
            `
          }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
