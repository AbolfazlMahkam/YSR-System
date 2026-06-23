import {
  Monitor,
  Moon,
  Sun,
  LogOut,
  User,
  Menu,
  Users as UsersIcon,
  Home,
  ClipboardList,
  Settings,
  FileText,
  Database,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useTheme } from "@/components/theme-provider";
import { useAuth } from "@/hooks/useAuth";
import { useActiveForms } from "@/hooks/useActiveForms";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toPersianDigits } from "@/lib/utils";
import logo from "../../assets/logo-nt.png";

export function Header() {
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const { forms } = useActiveForms();
  const isAdmin =
    user?.role === "admin" || user?.role === "super_admin";

  const handleLogout = () => {
    logout();
  };

  const themeIcon = {
    light: <Sun className="h-5 w-5" />,
    dark: <Moon className="h-5 w-5" />,
    system: <Monitor className="h-5 w-5" />,
  }[theme];

  const themeLabel = {
    light: "روشن",
    dark: "تاریک",
    system: "سیستم",
  }[theme];

  return (
    <header className="h-[75px] border-b glass flex items-center justify-between px-4 md:px-6">
      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild className="md:hidden">
            <Button variant="outline" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel className="text-end">منو</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <NavLink to="/" className="flex items-center gap-2 justify-end">
                <span>خانه</span>
                <Home className="h-4 w-4" />
              </NavLink>
            </DropdownMenuItem>
            {(forms.length > 0) && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-end text-xs text-muted-foreground">
                  <span className="flex items-center gap-2 justify-end">
                    <ClipboardList className="h-4 w-4" />
                    فرم‌ها
                  </span>
                </DropdownMenuLabel>
                {forms.map((form) => (
                  <DropdownMenuItem key={form.id} asChild>
                    <NavLink
                      to={`/forms/${form.slug}`}
                      className="flex items-center gap-2 justify-end"
                    >
                      <span>{form.title}</span>
                    </NavLink>
                  </DropdownMenuItem>
                ))}
              </>
            )}
            <DropdownMenuItem asChild>
              <NavLink
                to="/forms/self-declaration"
                className="flex items-center gap-2 justify-end"
              >
                <span>اظهارنامه</span>
              </NavLink>
            </DropdownMenuItem>
            {isAdmin && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-end text-xs text-muted-foreground">
                  <span className="flex items-center gap-2 justify-end">
                    <Settings className="h-4 w-4" />
                    مدیریت فرم‌ها
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuItem asChild>
                  <NavLink
                    to="/admin/forms"
                    className="flex items-center gap-2 justify-end"
                  >
                    <span>تعاریف فرم‌ها</span>
                    <FileText className="h-4 w-4" />
                  </NavLink>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <NavLink
                    to="/admin/form-submissions"
                    className="flex items-center gap-2 justify-end"
                  >
                    <span>ارسال‌های فرم‌ها</span>
                    <Database className="h-4 w-4" />
                  </NavLink>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <NavLink
                    to="/admin/self-declarations"
                    className="flex items-center gap-2 justify-end"
                  >
                    <span>اظهارنامه‌ها</span>
                    <ClipboardList className="h-4 w-4" />
                  </NavLink>
                </DropdownMenuItem>
              </>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <NavLink
                to="/users"
                className="flex items-center gap-2 justify-end"
              >
                <span>کاربران</span>
                <UsersIcon className="h-4 w-4" />
              </NavLink>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <NavLink
                to="/profile"
                className="flex items-center gap-2 justify-end"
              >
                <span>حساب کاربری</span>
                <User className="h-4 w-4" />
              </NavLink>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              {themeIcon}
              <span className="hidden sm:inline">{themeLabel}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel className="text-end">تم</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => setTheme("light")}
              className="gap-2 justify-end"
            >
              <span>روشن</span>
              <Sun className="h-4 w-4" />
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setTheme("dark")}
              className="gap-2 justify-end"
            >
              <span>تاریک</span>
              <Moon className="h-4 w-4" />
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setTheme("system")}
              className="gap-2 justify-end"
            >
              <span>سیستم</span>
              <Monitor className="h-4 w-4" />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-center gap-2 md:hidden">
        <div className="flex justify-center">
          <img src={logo} alt="Logo" className="h-10 w-10" />
        </div>
        <h2 className="font-semibold">موسسه یاوران سلامت روان</h2>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="relative h-10 w-10 rounded-full transition-all hover:scale-105"
          >
            <Avatar>
              <AvatarFallback className="bg-primary text-primary-foreground">
                <User className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {user?.first_name && user?.last_name
                  ? `${user.first_name} ${user.last_name}`
                  : toPersianDigits(user?.phone) || "User"}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <NavLink
              to="/profile"
              className="flex items-center gap-2 cursor-pointer"
            >
              <User className="h-4 w-4" />
              <span>حساب کاربری</span>
            </NavLink>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleLogout}
            className="gap-2 text-destructive focus:text-destructive cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            <span>خروج از حساب</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
