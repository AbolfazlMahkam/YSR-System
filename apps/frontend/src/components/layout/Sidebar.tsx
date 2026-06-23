import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  Home,
  Users,
  ClipboardList,
  ChevronDown,
  Settings,
  FileText,
  Database,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "../../hooks/useAuth";
import { useActiveForms } from "../../hooks/useActiveForms";
import logo from "@/assets/logo-nt.png";

const navItems = [
  {
    to: "/",
    label: "خانه",
    icon: Home,
    roles: ["user", "admin", "super_admin"],
  },
  {
    to: "/users",
    label: "کاربران",
    icon: Users,
    roles: ["admin", "super_admin"],
  },
];

export function Sidebar() {
  const { user } = useAuth();
  const { forms } = useActiveForms();
  const [formsOpen, setFormsOpen] = useState(false);
  const [formsMgmtOpen, setFormsMgmtOpen] = useState(false);

  const isAdmin = user?.role === "admin" || user?.role === "super_admin";

  const filteredNavItems = navItems.filter((item) =>
    item.roles.includes(user?.role || "user"),
  );

  return (
    <aside className="w-64 border-l glass flex flex-col h-full hidden md:flex">
      <div className="p-4 h-[74px]">
        <div className="flex items-center gap-2">
          <div className="flex justify-center">
            <img src={logo} alt="Logo" className="h-10 w-10" />
          </div>
          <h2 className="font-semibold">موسسه یاوران سلامت روان</h2>
        </div>
      </div>
      <Separator />
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {filteredNavItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200",
                    "hover:bg-accent hover:text-accent-foreground hover:translate-x-1",
                    isActive
                      ? "bg-accent text-accent-foreground font-medium shadow-sm"
                      : "text-muted-foreground",
                  )
                }
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
          {/* Forms Management (admin) */}
          {isAdmin && (
            <li>
              <button
                onClick={() => setFormsMgmtOpen((prev) => !prev)}
                className={cn(
                  "flex items-center gap-3 w-full px-3 py-2 rounded-md transition-all duration-200",
                  "hover:bg-accent hover:text-accent-foreground hover:translate-x-1",
                  "text-muted-foreground",
                  formsMgmtOpen && "bg-accent/50 text-accent-foreground",
                )}
              >
                <Settings className="h-5 w-5" />
                <span className="flex-1 text-right">مدیریت فرم‌ها</span>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform duration-200",
                    formsMgmtOpen && "rotate-180",
                  )}
                />
              </button>
              {formsMgmtOpen && (
                <ul className="mr-6 mt-1 space-y-1">
                  <li>
                    <NavLink
                      to="/admin/forms"
                      className={({ isActive }) =>
                        cn(
                          "flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 text-sm",
                          "hover:bg-accent hover:text-accent-foreground",
                          isActive
                            ? "bg-accent text-accent-foreground font-medium"
                            : "text-muted-foreground",
                        )
                      }
                    >
                      <FileText className="h-4 w-4" />
                      <span>تعاریف فرم‌ها</span>
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/admin/form-submissions"
                      className={({ isActive }) =>
                        cn(
                          "flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 text-sm",
                          "hover:bg-accent hover:text-accent-foreground",
                          isActive
                            ? "bg-accent text-accent-foreground font-medium"
                            : "text-muted-foreground",
                        )
                      }
                    >
                      <Database className="h-4 w-4" />
                      <span>ارسال‌های فرم‌ها</span>
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/admin/self-declarations"
                      className={({ isActive }) =>
                        cn(
                          "flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 text-sm",
                          "hover:bg-accent hover:text-accent-foreground",
                          isActive
                            ? "bg-accent text-accent-foreground font-medium"
                            : "text-muted-foreground",
                        )
                      }
                    >
                      <ClipboardList className="h-4 w-4" />
                      <span>اظهارنامه‌ها</span>
                    </NavLink>
                  </li>
                </ul>
              )}
            </li>
          )}
          {/* User forms (for all roles) */}
          <li>
            <button
              onClick={() => setFormsOpen((prev) => !prev)}
              className={cn(
                "flex items-center gap-3 w-full px-3 py-2 rounded-md transition-all duration-200",
                "hover:bg-accent hover:text-accent-foreground hover:translate-x-1",
                "text-muted-foreground",
                formsOpen && "bg-accent/50 text-accent-foreground",
              )}
            >
              <ClipboardList className="h-5 w-5" />
              <span className="flex-1 text-right">فرم‌ها</span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform duration-200",
                  formsOpen && "rotate-180",
                )}
              />
            </button>
            {formsOpen && (
              <ul className="mr-6 mt-1 space-y-1">
                {forms.map((form) => (
                  <li key={form.id}>
                    <NavLink
                      to={`/forms/${form.slug}`}
                      className={({ isActive }) =>
                        cn(
                          "flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 text-sm",
                          "hover:bg-accent hover:text-accent-foreground",
                          isActive
                            ? "bg-accent text-accent-foreground font-medium"
                            : "text-muted-foreground",
                        )
                      }
                    >
                      <span className="mr-1">•</span>
                      <span>{form.title}</span>
                    </NavLink>
                  </li>
                ))}
                <li>
                  <NavLink
                    to="/forms/self-declaration"
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 text-sm",
                        "hover:bg-accent hover:text-accent-foreground",
                        isActive
                          ? "bg-accent text-accent-foreground font-medium"
                          : "text-muted-foreground",
                      )
                    }
                  >
                    <span className="mr-1">•</span>
                    <span>اظهارنامه</span>
                  </NavLink>
                </li>
              </ul>
            )}
          </li>
        </ul>
      </nav>
      <div className="p-4 border-t">
        <p className="text-xs text-start text-muted-foreground" dir="ltr">
          Designed and developed by{" "}
          <a
            className="hover:text-[#cf1717] hover:text-[13px] font-bold duration-300"
            href="https://github.com/AbolfazlMahkam"
            target="_blank"
          >
            a.mahkam.950
          </a>{" "}
          ©
        </p>
      </div>
    </aside>
  );
}
