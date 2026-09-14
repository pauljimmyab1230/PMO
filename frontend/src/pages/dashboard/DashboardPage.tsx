import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { projectService } from '../../services/project.service';
import { Project } from '../../types';
import {
  FolderKanban,
  Zap,
  CheckCircle2,
  DollarSign,
  Plus,
  ArrowRight,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { formatCurrency } from '../../utils/format';

const DashboardPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setError(null);
      const response = await projectService.getAll();
      setProjects(response.data);
    } catch (err) {
      setError('Error al cargar los proyectos');
      console.error('Error loading projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    total: projects.length,
    activos: projects.filter((p) => p.estado_nombre === 'Activo').length,
    completados: projects.filter((p) => p.estado_nombre === 'Cerrado').length,
    presupuestoTotal: projects.reduce((sum, p) => sum + (parseFloat(String(p.presupuesto_planeado)) || 0), 0),
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-200 dark:border-slate-700 border-t-primary-600"></div>
          <p className="text-sm text-slate-400 dark:text-slate-500">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Dashboard</h1>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Vista general de tus proyectos</p>
        </div>
        <Link
          to="/proyectos/nuevo"
          className="inline-flex items-center gap-2 bg-primary-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Nuevo Proyecto
        </Link>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">{error}</span>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-red-400 hover:text-red-600 transition-colors"
          >
            &times;
          </button>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={FolderKanban}
          label="Total Proyectos"
          value={stats.total}
          color="blue"
        />
        <StatCard
          icon={Zap}
          label="Activos"
          value={stats.activos}
          color="emerald"
        />
        <StatCard
          icon={CheckCircle2}
          label="Completados"
          value={stats.completados}
          color="violet"
        />
        <StatCard
          icon={DollarSign}
          label="Presupuesto Total"
          value={formatCurrency(stats.presupuestoTotal)}
          color="amber"
        />
      </div>

      {/* Recent Projects */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400 dark:text-slate-500" />
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Proyectos Recientes</h2>
          </div>
          <Link
            to="/proyectos"
            className="inline-flex items-center gap-1 text-xs font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
          >
            Ver todos
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {projects.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-3">
              <FolderKanban className="w-6 h-6 text-slate-400 dark:text-slate-500" />
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">No hay proyectos registrados</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Crea tu primer proyecto para comenzar</p>
            <Link
              to="/proyectos/nuevo"
              className="inline-flex items-center gap-1.5 mt-4 text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
            >
              <Plus className="w-4 h-4" />
              Crear proyecto
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {projects.slice(0, 5).map((project) => (
              <Link
                key={project.id}
                to={`/proyectos/${project.id}`}
                className="flex items-center justify-between px-6 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 bg-primary-50 dark:bg-primary-900/30 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-primary-100 dark:group-hover:bg-primary-900/50 transition-colors">
                    <FolderKanban className="w-4 h-4 text-primary-500 dark:text-primary-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      {project.nombre}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{project.codigo}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0 ml-4">
                  {project.presupuesto_planeado ? (
                    <span className="text-sm text-slate-500 dark:text-slate-400 hidden sm:block">
                      {formatCurrency(project.presupuesto_planeado)}
                    </span>
                  ) : null}
                  <StatusBadge status={project.estado_nombre} />
                  <ArrowRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-primary-400 transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

interface StatCardProps {
  icon: React.FC<{ className?: string }>;
  label: string;
  value: number | string;
  color: 'blue' | 'emerald' | 'violet' | 'amber';
}

const colorMap = {
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-900/30',
    icon: 'text-blue-500 dark:text-blue-400',
    ring: 'ring-blue-100 dark:ring-blue-800',
  },
  emerald: {
    bg: 'bg-emerald-50 dark:bg-emerald-900/30',
    icon: 'text-emerald-500 dark:text-emerald-400',
    ring: 'ring-emerald-100 dark:ring-emerald-800',
  },
  violet: {
    bg: 'bg-violet-50 dark:bg-violet-900/30',
    icon: 'text-violet-500 dark:text-violet-400',
    ring: 'ring-violet-100 dark:ring-violet-800',
  },
  amber: {
    bg: 'bg-amber-50 dark:bg-amber-900/30',
    icon: 'text-amber-500 dark:text-amber-400',
    ring: 'ring-amber-100 dark:ring-amber-800',
  },
};

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, label, value, color }) => {
  const c = colorMap[color];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 hover:shadow-sm dark:hover:shadow-slate-900/20 transition-all">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 ${c.bg} rounded-xl flex items-center justify-center ring-1 ${c.ring}`}>
          <Icon className={`w-5 h-5 ${c.icon}`} />
        </div>
        <div>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">{label}</p>
          <p className="text-xl font-bold text-slate-800 dark:text-slate-100">{value}</p>
        </div>
      </div>
    </div>
  );
};

const StatusBadge: React.FC<{ status?: string }> = ({ status }) => {
  const styles: Record<string, string> = {
    Activo: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 ring-emerald-100 dark:ring-emerald-800',
    Cerrado: 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 ring-slate-200 dark:ring-slate-600',
    'En Revision': 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 ring-amber-100 dark:ring-amber-800',
    Borrador: 'bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 ring-slate-100 dark:ring-slate-700',
  };

  const s = styles[status || ''] || 'bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 ring-slate-100 dark:ring-slate-700';

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-md ring-1 ring-inset ${s}`}
    >
      {status || 'Sin estado'}
    </span>
  );
};

export default DashboardPage;
