import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  portafolioService,
  PortafolioDashboard,
  PortafolioProject,
} from '../../services/portafolio.service';
import {
  Plus,
  Search,
  Briefcase,
  DollarSign,
  AlertTriangle,
  AlertCircle,
  Clock,
  Building2,
  TrendingUp,
  FolderKanban,
  ArrowRight,
  Calendar,
  BarChart3,
  User,
} from 'lucide-react';
import { formatCurrency } from '../../utils/format';

const PortafolioPage: React.FC = () => {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState<PortafolioDashboard | null>(null);
  const [projects, setProjects] = useState<PortafolioProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setError(null);
      const [d, p] = await Promise.all([
        portafolioService.getDashboard(),
        portafolioService.getProjects(),
      ]);
      setDashboard(d.data);
      setProjects(p.data);
    } catch (err) {
      setError('Error al cargar portafolio');
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter(
    (p) =>
      p.nombre.toLowerCase().includes(filter.toLowerCase()) ||
      p.codigo.toLowerCase().includes(filter.toLowerCase()) ||
      (p.pm_nombre && p.pm_nombre.toLowerCase().includes(filter.toLowerCase()))
  );

  const fmt = (n: number) => formatCurrency(n);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-200 dark:border-slate-700 border-t-primary-600"></div>
          <p className="text-sm text-slate-400 dark:text-slate-500">Cargando portafolio...</p>
        </div>
      </div>
    );
  }

  const budgetPercent = dashboard
    ? dashboard.presupuesto.total_planeado > 0
      ? Math.round(
          (dashboard.presupuesto.total_gastado / dashboard.presupuesto.total_planeado) *
            100
        )
      : 0
    : 0;

  return (
    <div className="p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            Portafolio de Proyectos
          </h1>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-0.5">
            Vista consolidada de todos los proyectos
          </p>
        </div>
        <button
          onClick={() => navigate('/proyectos/nuevo')}
          className="inline-flex items-center gap-2 bg-primary-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Nuevo Proyecto
        </button>
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
      {dashboard && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard
            icon={Briefcase}
            label="Total Proyectos"
            value={dashboard.total}
            color="blue"
          />
          {dashboard.byStatus.slice(0, 5).map((s, i) => (
            <StatCard
              key={i}
              icon={FolderKanban}
              label={s.estado}
              value={s.total}
              color="slate"
            />
          ))}
        </div>
      )}

      {/* Budget & Alerts */}
      {dashboard && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Presupuesto */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-blue-500 dark:text-blue-400" />
              </div>
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                Presupuesto
              </h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400">Total planeado</span>
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  {fmt(dashboard.presupuesto.total_planeado)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400">Gastado</span>
                <span className="text-sm font-semibold text-primary-600 dark:text-primary-400">
                  {fmt(dashboard.presupuesto.total_gastado)}
                </span>
              </div>
              <div className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-500 rounded-full transition-all"
                  style={{ width: `${Math.min(budgetPercent, 100)}%` }}
                />
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500 text-right">
                {budgetPercent}% utilizado
              </p>
            </div>
          </div>

          {/* Issues & Riesgos */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-amber-50 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-amber-500 dark:text-amber-400" />
              </div>
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                Alertas
              </h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <span className="text-sm text-slate-700 dark:text-slate-200">Issues abiertos</span>
                </div>
                <span className="text-lg font-bold text-red-600 dark:text-red-400">
                  {dashboard.issues.total_abiertos}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-500" />
                  <span className="text-sm text-slate-700 dark:text-slate-200">Riesgos criticos</span>
                </div>
                <span className="text-lg font-bold text-orange-600 dark:text-orange-400">
                  {dashboard.riesgos.criticos}
                </span>
              </div>
            </div>
          </div>

          {/* Proximos a vencer */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-amber-50 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
                <Clock className="w-4 h-4 text-amber-500 dark:text-amber-400" />
              </div>
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                Por vencer (30 dias)
              </h3>
            </div>
            {dashboard.proximosVencer.length === 0 ? (
              <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-4">
                No hay proyectos proximos a vencer
              </p>
            ) : (
              <div className="space-y-2">
                {dashboard.proximosVencer.slice(0, 3).map((p: any) => (
                  <div
                    key={p.id}
                    onClick={() => navigate(`/proyectos/${p.id}`)}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
                        {p.codigo}
                      </p>
                      <p className="text-sm text-slate-700 dark:text-slate-200 truncate">
                        {p.nombre}
                      </p>
                    </div>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded ${
                        p.dias_restantes <= 7
                          ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                          : 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                      }`}
                    >
                      {p.dias_restantes}d
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Proyectos por Area */}
      {dashboard && dashboard.byArea.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-violet-50 dark:bg-violet-900/30 rounded-lg flex items-center justify-center">
              <Building2 className="w-4 h-4 text-violet-500 dark:text-violet-400" />
            </div>
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Proyectos por Area
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {dashboard.byArea.map((a, i) => (
              <div
                key={i}
                className="inline-flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-700 rounded-lg"
              >
                <span className="text-sm text-slate-700 dark:text-slate-200">{a.area}</span>
                <span className="text-xs font-bold bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 px-2 py-0.5 rounded-full">
                  {a.total}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-slate-400" />
              <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                Detalle de Proyectos
              </h2>
            </div>
            <span className="text-xs text-slate-400 dark:text-slate-500">
              {filteredProjects.length} proyecto{filteredProjects.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, codigo o PM..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-700">
                <th className="text-left px-6 py-3 text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Codigo
                </th>
                <th className="text-left px-6 py-3 text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Proyecto
                </th>
                <th className="text-left px-6 py-3 text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="text-left px-6 py-3 text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  PM
                </th>
                <th className="text-left px-6 py-3 text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Avance
                </th>
                <th className="text-left px-6 py-3 text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Presupuesto
                </th>
                <th className="text-center px-6 py-3 text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Issues
                </th>
                <th className="text-center px-6 py-3 text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Riesgos
                </th>
                <th className="text-right px-6 py-3 text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center">
                    <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-3">
                      <FolderKanban className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                      No se encontraron proyectos
                    </p>
                  </td>
                </tr>
              ) : (
                filteredProjects.map((p) => (
                  <tr
                    key={p.id}
                    onClick={() => navigate(`/proyectos/${p.id}`)}
                    className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer group"
                  >
                    <td className="px-6 py-4">
                      <span className="text-xs font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
                        {p.codigo}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-primary-50 dark:bg-primary-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FolderKanban className="w-4 h-4 text-primary-500 dark:text-primary-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                            {p.nombre}
                          </p>
                          <p className="text-xs text-slate-400 dark:text-slate-500">
                            {p.tipo_nombre || 'Sin tipo'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-md ring-1 ring-inset"
                        style={{
                          backgroundColor: `${p.estado_color}15`,
                          color: p.estado_color,
                          boxShadow: `inset 0 0 0 1px ${p.estado_color}30`,
                        }}
                      >
                        {p.estado_nombre}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center">
                          <User className="w-3 h-3 text-slate-500 dark:text-slate-400" />
                        </div>
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                          {p.pm_nombre || 'Sin asignar'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary-500 rounded-full"
                            style={{ width: `${Number(p.avance_wbs) || 0}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                          {(Number(p.avance_wbs) || 0).toFixed(0)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                        {p.presupuesto_planeado ? fmt(p.presupuesto_planeado) : '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {p.issues_abiertos > 0 ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-bold rounded-full">
                          {p.issues_abiertos}
                        </span>
                      ) : (
                        <span className="text-slate-300 dark:text-slate-600">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {p.riesgos_criticos > 0 ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-xs font-bold rounded-full">
                          {p.riesgos_criticos}
                        </span>
                      ) : (
                        <span className="text-slate-300 dark:text-slate-600">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="inline-flex items-center gap-1 text-sm font-medium text-primary-600 dark:text-primary-400 group-hover:text-primary-700 dark:group-hover:text-primary-300 transition-colors">
                        Ver
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

interface StatCardProps {
  icon: React.FC<{ className?: string }>;
  label: string;
  value: number;
  color: 'blue' | 'emerald' | 'violet' | 'amber' | 'red' | 'slate';
}

const colorMap = {
  blue: { bg: 'bg-blue-50 dark:bg-blue-900/30', icon: 'text-blue-500 dark:text-blue-400', ring: 'ring-blue-100 dark:ring-blue-800' },
  emerald: { bg: 'bg-emerald-50 dark:bg-emerald-900/30', icon: 'text-emerald-500 dark:text-emerald-400', ring: 'ring-emerald-100 dark:ring-emerald-800' },
  violet: { bg: 'bg-violet-50 dark:bg-violet-900/30', icon: 'text-violet-500 dark:text-violet-400', ring: 'ring-violet-100 dark:ring-violet-800' },
  amber: { bg: 'bg-amber-50 dark:bg-amber-900/30', icon: 'text-amber-500 dark:text-amber-400', ring: 'ring-amber-100 dark:ring-amber-800' },
  red: { bg: 'bg-red-50 dark:bg-red-900/30', icon: 'text-red-500 dark:text-red-400', ring: 'ring-red-100 dark:ring-red-800' },
  slate: { bg: 'bg-slate-50 dark:bg-slate-700', icon: 'text-slate-500 dark:text-slate-400', ring: 'ring-slate-200 dark:ring-slate-600' },
};

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, label, value, color }) => {
  const c = colorMap[color];
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 ${c.bg} rounded-xl flex items-center justify-center ring-1 ${c.ring}`}>
          <Icon className={`w-5 h-5 ${c.icon}`} />
        </div>
        <div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">{label}</p>
          <p className="text-xl font-bold text-slate-800 dark:text-slate-100">{value}</p>
        </div>
      </div>
    </div>
  );
};

export default PortafolioPage;
