import React, { useState, createContext, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext';
import {
  LayoutDashboard,
  FolderKanban,
  Briefcase,
  BarChart3,
  Users,
  Building2,
  FileText,
  Search,
  Settings,
  HelpCircle,
  LogOut,
  PanelLeftClose,
  PanelLeft,
  Layers,
} from 'lucide-react';

interface SidebarContextType {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  toggle: () => void;
}

const SidebarContext = createContext<SidebarContextType>({
  collapsed: false,
  setCollapsed: () => {},
  toggle: () => {},
});

export const useSidebar = () => useContext(SidebarContext);

const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  const toggle = () => setCollapsed((p) => !p);

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/proyectos', label: 'Proyectos', icon: FolderKanban },
    { path: '/portafolio', label: 'Portafolio', icon: Briefcase },
    { path: '/reportes', label: 'Reportes', icon: BarChart3 },
  ];

  const adminItems = [
    { path: '/config', label: 'Configuracion', icon: Settings },
  ];

  const bottomItems = [
    { path: '#', label: 'Ayuda', icon: HelpCircle },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed, toggle }}>
      <aside
        className={`
          relative flex flex-col h-screen bg-white dark:bg-slate-900
          border-r border-slate-200 dark:border-slate-700
          transition-all duration-200 ease-in-out z-40 overflow-hidden
          ${collapsed ? 'w-[72px]' : 'w-[260px]'}
        `}
      >
        {/* Header */}
        <div className={`flex items-center h-16 px-4 border-b border-slate-100 dark:border-slate-800 ${collapsed ? 'justify-center' : 'justify-between'}`}>
          {!collapsed && (
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex-shrink-0 w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <Layers className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">PMO System</h1>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">Gestion de Proyectos</p>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="w-9 h-9 bg-primary-600 rounded-lg flex items-center justify-center">
              <Layers className="w-5 h-5 text-white" />
            </div>
          )}
          <button
            onClick={toggle}
            className={`
              p-1.5 rounded-lg text-slate-400 dark:text-slate-500
              hover:text-slate-600 dark:hover:text-slate-300
              hover:bg-slate-100 dark:hover:bg-slate-800
              transition-colors duration-150
              ${collapsed ? 'absolute -right-3 top-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm' : ''}
            `}
            title={collapsed ? 'Expandir menu' : 'Colapsar menu'}
          >
            {collapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
          </button>
        </div>

        {/* Search */}
        {!collapsed && (
          <div className="px-3 pt-3 pb-1">
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
              <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 flex-shrink-0" />
              <span className="text-sm text-slate-400 dark:text-slate-500">Buscar...</span>
              <kbd className="ml-auto text-[10px] text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded px-1.5 py-0.5 font-mono">
                /
              </kbd>
            </div>
          </div>
        )}

        {/* Main Nav */}
        <nav className={`flex-1 px-3 py-3 no-scrollbar ${collapsed ? 'overflow-hidden' : 'overflow-y-auto'}`}>
          {/* Menu Section */}
          <div className="mb-1">
            {!collapsed && (
              <p className="px-3 mb-1.5 text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Menu
              </p>
            )}
            <div className="space-y-0.5">
              {menuItems.map((item) => (
                <SidebarLink
                  key={item.path}
                  item={item}
                  active={isActive(item.path)}
                  collapsed={collapsed}
                />
              ))}
            </div>
          </div>

          {/* Admin Section */}
          {user?.rol === 'admin' && (
            <div className="mt-4 mb-1">
              {!collapsed && (
                <p className="px-3 mb-1.5 text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Administracion
                </p>
              )}
              <div className="space-y-0.5">
                {adminItems.map((item) => (
                  <SidebarLink
                    key={item.path}
                    item={item}
                    active={isActive(item.path)}
                    collapsed={collapsed}
                  />
                ))}
              </div>
            </div>
          )}
        </nav>

        {/* Bottom Section */}
        <div className="border-t border-slate-100 dark:border-slate-800 px-3 py-3 space-y-0.5">
          {bottomItems.map((item) => (
            <SidebarLink
              key={item.label}
              item={item}
              active={false}
              collapsed={collapsed}
            />
          ))}
        </div>

        {/* User Profile */}
        <div className={`border-t border-slate-100 dark:border-slate-800 p-3 ${collapsed ? 'flex justify-center' : ''}`}>
          {collapsed ? (
            <div className="relative group">
              <div className="w-9 h-9 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center text-primary-700 dark:text-primary-300 font-semibold text-sm cursor-pointer">
                {user?.nombre?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-slate-800 dark:bg-slate-700 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                {user?.nombre}
                <span className="block text-slate-400 capitalize text-[11px]">{user?.rol}</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer group">
              <div className="w-9 h-9 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center text-primary-700 dark:text-primary-300 font-semibold text-sm flex-shrink-0">
                {user?.nombre?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{user?.nombre}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 capitalize">{user?.rol}</p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  logout();
                }}
                className="p-1.5 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-all"
                title="Cerrar sesion"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </aside>
    </SidebarContext.Provider>
  );
};

interface SidebarLinkProps {
  item: { path: string; label: string; icon: React.FC<{ className?: string }> };
  active: boolean;
  collapsed: boolean;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({ item, active, collapsed }) => {
  const Icon = item.icon;

  if (collapsed) {
    return (
      <div className="relative group flex justify-center">
        <Link
          to={item.path}
          className={`
            flex items-center justify-center w-10 h-10 rounded-lg transition-colors duration-150
            ${active
              ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
              : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200'
            }
          `}
        >
          <Icon className="w-5 h-5" />
        </Link>
        <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-slate-800 dark:bg-slate-700 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
          {item.label}
        </div>
      </div>
    );
  }

  return (
    <Link
      to={item.path}
      className={`
        flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150
        ${active
          ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200'
        }
      `}
    >
      <Icon className={`w-5 h-5 flex-shrink-0 ${active ? 'text-primary-500 dark:text-primary-400' : 'text-slate-400 dark:text-slate-500'}`} />
      <span className="truncate">{item.label}</span>
    </Link>
  );
};

export default Sidebar;
