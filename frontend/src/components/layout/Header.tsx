import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useTheme } from '../../store/ThemeContext';
import { useAuth } from '../../store/AuthContext';
import {
  Bell,
  Sun,
  Moon,
  ChevronRight,
  Home,
} from 'lucide-react';

const routeLabels: Record<string, string> = {
  dashboard: 'Dashboard',
  proyectos: 'Proyectos',
  portafolio: 'Portafolio',
  reportes: 'Reportes',
  nuevo: 'Nuevo Proyecto',
  config: 'Configuracion',
  usuarios: 'Usuarios',
  areas: 'Areas',
  catalogos: 'Catalogos',
  planificacion: 'Planificacion',
  'marco-logico': 'Marco Logico',
  wbs: 'WBS',
  cronograma: 'Cronograma',
  presupuesto: 'Presupuesto',
  riesgos: 'Riesgos',
  recursos: 'Recursos',
};

const Header: React.FC = () => {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();

  const pathSegments = location.pathname.split('/').filter(Boolean);

  const breadcrumbs = pathSegments.map((segment, index) => {
    const path = '/' + pathSegments.slice(0, index + 1).join('/');
    const label = routeLabels[segment] || segment;
    const isLast = index === pathSegments.length - 1;
    return { path, label, isLast };
  });

  return (
    <header className="h-14 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-6 transition-colors">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm">
        <Link
          to="/dashboard"
          className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
        >
          <Home className="w-4 h-4" />
        </Link>
        {breadcrumbs.map((crumb) => (
          <React.Fragment key={crumb.path}>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />
            {crumb.isLast ? (
              <span className="font-medium text-slate-700 dark:text-slate-200">
                {crumb.label}
              </span>
            ) : (
              <Link
                to={crumb.path}
                className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                {crumb.label}
              </Link>
            )}
          </React.Fragment>
        ))}
      </nav>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <button className="relative p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          title={theme === 'light' ? 'Modo oscuro' : 'Modo claro'}
        >
          {theme === 'light' ? (
            <Moon className="w-5 h-5" />
          ) : (
            <Sun className="w-5 h-5" />
          )}
        </button>

        {/* User Avatar */}
        <div className="ml-2 pl-3 border-l border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center text-primary-700 dark:text-primary-300 font-semibold text-sm">
              {user?.nombre?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200 leading-tight">{user?.nombre}</p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 capitalize">{user?.rol}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
