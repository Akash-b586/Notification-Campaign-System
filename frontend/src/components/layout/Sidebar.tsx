import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Bell,
  Megaphone,
  FileText,
  LogOut,
  UserPlus,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

interface SidebarProps {
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  permission?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, onMobileClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, hasPermission } = useAuthStore();

  const navItems: NavItem[] = [
    {
      path: '/dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
      permission: 'dashboard',
    },
    {
      path: '/users',
      label: 'User Management',
      icon: <Users className="w-5 h-5" />,
      permission: 'users',
    },
    {
      path: '/preferences',
      label: 'Preferences',
      icon: <Bell className="w-5 h-5" />,
      permission: 'preferences',
    },
    {
      path: '/campaigns',
      label: 'Campaigns',
      icon: <Megaphone className="w-5 h-5" />,
      permission: 'campaigns',
    },
    {
      path: '/staff/add',
      label: 'Add Staff',
      icon: <UserPlus className="w-5 h-5" />,
      permission: 'staff',
    },
    {
      path: '/logs',
      label: 'Notification Logs',
      icon: <FileText className="w-5 h-5" />,
      permission: 'logs',
    },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const sidebarContent = (
    <div className="h-full flex flex-col bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      {/* Logo */}
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Bell className="w-7 h-7" />
          NotifyCamp
        </h1>
        <p className="text-slate-200 text-sm mt-1">Campaign Manager</p>
      </div>

      {/* User Info */}
      <div className="px-6 py-4 bg-slate-800/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center text-lg font-semibold">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <p className="text-xs text-slate-300 capitalize">{user?.role}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => {
          if (item.permission && !hasPermission(item.permission, 'read')) {
            return null;
          }

          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onMobileClose}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? 'bg-white text-slate-900 shadow-lg'
                  : 'text-slate-100 hover:bg-slate-700/50'
              }`}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
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
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 h-screen fixed left-0 top-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar */}
      {isMobileOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={onMobileClose}
          />

          {/* Sidebar */}
          <aside className="fixed left-0 top-0 w-64 h-screen z-50 lg:hidden">
            {sidebarContent}
          </aside>
        </>
      )}
    </>
  );
};
