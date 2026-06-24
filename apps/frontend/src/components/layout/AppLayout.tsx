import { useRef, useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { ScrollToTop } from "./ScrollToTop";

export function AppLayout() {
  const mainRef = useRef<HTMLDivElement>(null!);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    if (isMobileSidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileSidebarOpen]);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
      />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header onMenuToggle={() => setIsMobileSidebarOpen((prev) => !prev)} />
        <main ref={mainRef} className="flex-1 overflow-y-auto"
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
        <ScrollToTop containerRef={mainRef} />
        <div className="p-2 border-t md:hidden">
          <p className="text-xs text-center text-muted-foreground" dir="ltr">
            Designed and developed by{" "}
            <a
              className="hover:text-[#cf1717] font-bold duration-300"
              href="https://github.com/AbolfazlMahkam"
              target="_blank"
            >
              a.mahkam.950
            </a>{" "}
            ©
          </p>
        </div>
      </div>
    </div>
  );
}
