import React, { useContext, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
  Barcode, 
  Award, 
  FolderTree, 
  Layers, 
  LogOut, 
  Menu, 
  X, 
  Bell
} from 'lucide-react';

const DashboardLayout = () => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const navigation = [
    { name: 'Label Generator', href: '/dashboard/label', icon: Barcode },
    { name: 'Brands', href: '/dashboard/brands', icon: Award },
    { name: 'Category', href: '/dashboard/category', icon: FolderTree },
    { name: 'Stock', href: '/dashboard/stock', icon: Layers },
  ];

  const getInitials = (name) => {
    if (!name) return 'AD';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 border-r border-zinc-900 bg-zinc-950">
        {/* Sidebar Header */}
        <div className="flex items-center h-16 px-6 border-b border-zinc-900 gap-3">
          <div className="w-9 h-9 bg-white text-black flex items-center justify-center rounded-lg font-bold">
            <Barcode className="w-5.5 h-5.5" />
          </div>
          <span className="font-bold text-base tracking-wider text-white">
            LABEL PRO
          </span>
        </div>

        {/* Sidebar Links */}
        <div className="flex-1 flex flex-col justify-between overflow-y-auto p-4">
          <nav className="space-y-1">
            {navigation.map((item) => {
              const active = location.pathname.startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-lg gap-3 transition-colors ${
                    active 
                      ? 'bg-zinc-900 text-white' 
                      : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/50'
                  }`}
                >
                  <item.icon className={`w-4.5 h-4.5 ${active ? 'text-white' : 'text-zinc-400'}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2.5 text-sm font-medium text-zinc-400 hover:text-red-400 hover:bg-red-950/10 rounded-lg gap-3 transition-colors cursor-pointer"
          >
            <LogOut className="w-4.5 h-4.5" />
            Logout
          </button>
        </div>
      </div>

      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 md:hidden transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-zinc-950 border-r border-zinc-900 flex flex-col transform transition-transform duration-300 ease-in-out md:hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-zinc-900">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white text-black flex items-center justify-center rounded-lg font-bold">
              <Barcode className="w-5 h-5" />
            </div>
            <span className="font-bold text-base tracking-wider text-white">LABEL PRO</span>
          </div>
          <button 
            onClick={() => setMobileOpen(false)}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 flex flex-col justify-between p-4 overflow-y-auto">
          <nav className="space-y-1">
            {navigation.map((item) => {
              const active = location.pathname.startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-lg gap-3 transition-colors ${
                    active 
                      ? 'bg-zinc-900 text-white' 
                      : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/50'
                  }`}
                >
                  <item.icon className="w-4.5 h-4.5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2.5 text-sm font-medium text-zinc-400 hover:text-red-400 hover:bg-red-950/10 rounded-lg gap-3 transition-colors cursor-pointer"
          >
            <LogOut className="w-4.5 h-4.5" />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col md:pl-64">
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-8 border-b border-zinc-900 bg-zinc-950">
          {/* Menu button for mobile */}
          <button
            onClick={() => setMobileOpen(true)}
            className="md:hidden p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 focus:outline-none cursor-pointer"
          >
            <Menu className="w-5.5 h-5.5" />
          </button>

          <div className="hidden md:flex items-center">
            <span className="text-zinc-400 text-sm">Welcome back, <strong className="text-white font-semibold">{user?.name || 'Admin'}</strong></span>
          </div>

          {/* Right Header Operations */}
          <div className="flex items-center gap-4 ml-auto">
            {/* Notification Bell */}
            <div className="relative">
              <button 
                onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
                className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-900 relative cursor-pointer transition-colors"
              >
                <Bell className="w-4.5 h-4.5" />
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-white rounded-full" />
              </button>

              {/* Notification Dropdown */}
              {notifOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setNotifOpen(false)} />
                  <div className="absolute right-0 mt-2 w-80 bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl py-2 z-40">
                    <div className="px-4 py-2 border-b border-zinc-800 text-xs font-bold text-zinc-400 uppercase tracking-wider">
                      Recent Activity
                    </div>
                    <div className="max-h-64 overflow-y-auto text-xs">
                      <div className="px-4 py-3 hover:bg-zinc-850 border-b border-zinc-850 text-sm cursor-pointer">
                        <p className="text-white font-medium">Admin session active</p>
                        <p className="text-xs text-zinc-500 mt-0.5">Just now</p>
                      </div>
                      <div className="px-4 py-3 hover:bg-zinc-850 border-b border-zinc-850 text-sm cursor-pointer">
                        <p className="text-white font-medium">Database seeding verified</p>
                        <p className="text-xs text-zinc-500 mt-0.5">10 mins ago</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* User Profile Avatar */}
            <div className="relative">
              <button
                onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
                className="flex items-center gap-2 focus:outline-none cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg border border-zinc-800 bg-zinc-900 hover:border-zinc-505 text-white flex items-center justify-center font-bold text-xs transition-colors">
                  {user ? getInitials(user.name) : 'AD'}
                </div>
              </button>

              {/* User Dropdown */}
              {profileOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setProfileOpen(false)} />
                  <div className="absolute right-0 mt-2 w-48 bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl py-1.5 z-40 text-xs">
                    <div className="px-4 py-2 border-b border-zinc-800">
                      <p className="font-bold text-white truncate">{user?.name || 'Admin User'}</p>
                      <p className="text-xs text-zinc-400 truncate mt-0.5">{user?.email || user?.mobile || 'Admin Access'}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-400 hover:bg-zinc-800 gap-2 text-left cursor-pointer font-bold"
                    >
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-4 md:p-8 bg-zinc-950">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
