import React, { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  Bell,
  LogOut,
  Menu,
  X,
  LayoutDashboard,
  ShoppingBag,
  Settings,
  Inbox,
  User,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  {
    path: "/user",
    label: "My Dashboard",
    icon: <LayoutDashboard className="w-5 h-5" />,
  },
  {
    path: "/user/orders",
    label: "My Orders",
    icon: <ShoppingBag className="w-5 h-5" />,
  },
  {
    path: "/user/preferences",
    label: "My Preferences",
    icon: <Settings className="w-5 h-5" />,
  },
  {
    path: "/user/notifications",
    label: "My Notifications",
    icon: <Inbox className="w-5 h-5" />,
  },
  {
    path: "/user/profile",
    label: "My Profile",
    icon: <User className="w-5 h-5" />,
  },
];

export const UserDashboardLayout: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path: string) => {
    if (path === "/user") {
      return location.pathname === "/user";
    }
    return location.pathname.startsWith(path);
  };

  const NavigationItems = () => (
    <>
      {navItems.map((item) => (
        <button
          key={item.path}
          onClick={() => {
            navigate(item.path);
            setIsMobileMenuOpen(false);
          }}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg w-full transition-all ${
            isActive(item.path)
              ? "bg-white text-slate-900 shadow-lg"
              : "text-slate-100 hover:bg-slate-700/50"
          }`}
        >
          {item.icon}
          <span className="font-medium">{item.label}</span>
        </button>
      ))}
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="hidden lg:block w-64 h-screen fixed left-0 top-0 z-30 bg-gradient-to-b from-slate-900 to-slate-800 text-white">
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="p-6 border-b border-slate-700 flex flex-col items-center text-center">
            <img
              src="/logo.png"
              alt="Campaign Manager Logo"
              className="w-36 sm:w-40 md:w-44 h-auto mb-2"
            />
            <p className="text-slate-300 text-sm tracking-wide">
              User Portal
            </p>
          </div>

          {/* User Info */}
          <div className="px-6 py-4 bg-slate-800/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-lg font-semibold">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.name}</p>
                <p className="text-xs text-slate-300 truncate">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            <NavigationItems />
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t border-slate-700">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 rounded-lg w-full text-slate-100 hover:bg-slate-700/50 transition-all"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white shadow-md">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <Bell className="w-6 h-6 text-primary-600" />
            <h1 className="text-xl font-bold">NotifyCamp</h1>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <aside className="fixed left-0 top-0 w-64 h-screen z-50 lg:hidden bg-gradient-to-b from-slate-900 to-slate-800 text-white">
            <div className="h-full flex flex-col">
              <div className="p-6 border-b border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img
                    src="/logo.png"
                    alt="Campaign Manager Logo"
                    className="w-24 h-auto"
                  />
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)}>
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="px-6 py-4 bg-slate-800/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-lg font-semibold">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{user?.name}</p>
                    <p className="text-xs text-slate-300 truncate">{user?.email}</p>
                  </div>
                </div>
              </div>

              <nav className="flex-1 px-4 py-6 space-y-2">
                <NavigationItems />
              </nav>

              <div className="p-4 border-t border-slate-700">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg w-full text-slate-100 hover:bg-slate-700/50 transition-all"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            </div>
          </aside>
        </>
      )}

      {/* Main Content */}
      <main className="lg:ml-64 pt-16 lg:pt-0">
        <Outlet />
      </main>
    </div>
  );
};
