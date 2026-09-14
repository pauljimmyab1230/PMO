import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  cronogramaService,
  GanttActivity,
  GanttData,
  CronogramaStats,
} from '../../services/cronograma.service';
import {
  ArrowLeft,
  Calendar,
  Clock,
  TrendingUp,
  AlertCircle,
  X,
  Diamond,
  CheckCircle2,
  Circle,
  Pause,
  XCircle,
} from 'lucide-react';

const CronogramaPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [ganttData, setGanttData] = useState<GanttData | null>(null);
  const [stats, setStats] = useState<CronogramaStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'days' | 'weeks' | 'months'>('months');

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setError(null);
      const [ganttRes, statsRes] = await Promise.all([
        cronogramaService.getGanttData(parseInt(id || '0')),
        cronogramaService.getStats(parseInt(id || '0')),
      ]);
      setGanttData(ganttRes.data);
      setStats(statsRes.data);
    } catch (err) {
      setError('Error al cargar el cronograma');
      console.error('Error loading cronograma:', err);
    } finally {
      setLoading(false);
    }
  };

  const getTimeHeaders = () => {
    if (!ganttData?.projectStart || !ganttData?.projectEnd) return [];

    const start = new Date(ganttData.projectStart);
    const end = new Date(ganttData.projectEnd);
    const headers: { date: Date; label: string }[] = [];

    if (viewMode === 'months') {
      const current = new Date(start);
      while (current <= end) {
        headers.push({
          date: new Date(current),
          label: current.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' }),
        });
        current.setMonth(current.getMonth() + 1);
      }
    } else if (viewMode === 'weeks') {
      const current = new Date(start);
      // Ir al lunes de la semana
      current.setDate(current.getDate() - current.getDay() + 1);
      while (current <= end) {
        headers.push({
          date: new Date(current),
          label: `Sem ${Math.ceil(current.getDate() / 7)}`,
        });
        current.setDate(current.getDate() + 7);
      }
    } else { // days
      const current = new Date(start);
      while (current <= end) {
        headers.push({
          date: new Date(current),
          label: current.getDate().toString(),
        });
        current.setDate(current.getDate() + 1);
      }
    }

    return headers;
  };

  const getDatePosition = (dateStr: string) => {
    if (!ganttData?.projectStart || !ganttData?.projectEnd) return 0;

    const start = new Date(ganttData.projectStart);
    const end = new Date(ganttData.projectEnd);
    const date = new Date(dateStr);

    const totalDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    const dayOffset = (date.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);

    return (dayOffset / totalDays) * 100;
  };

  const getBarWidth = (startStr: string, endStr: string) => {
    if (!ganttData?.projectStart || !ganttData?.projectEnd) return 0;

    const projectStart = new Date(ganttData.projectStart);
    const projectEnd = new Date(ganttData.projectEnd);
    const start = new Date(startStr);
    const end = new Date(endStr);

    const totalDays = (projectEnd.getTime() - projectStart.getTime()) / (1000 * 60 * 60 * 24);
    const barDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);

    return Math.max(1, (barDays / totalDays) * 100);
  };

  const getBarStyles = (activity: GanttActivity) => {
    if (activity.es_hito) return 'bg-violet-500 dark:bg-violet-400';
    switch (activity.estado) {
      case 'completado': return 'bg-emerald-500 dark:bg-emerald-400';
      case 'en_progreso': return 'bg-amber-500 dark:bg-amber-400';
      case 'pendiente': return 'bg-slate-300 dark:bg-slate-600';
      case 'cancelado': return 'bg-red-500 dark:bg-red-400';
      default: return 'bg-slate-300 dark:bg-slate-600';
    }
  };

  const getLevelStyles = (nivel: number) => {
    switch (nivel) {
      case 1: return 'bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300';
      case 2: return 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300';
      case 3: return 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300';
      case 4: return 'bg-slate-50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-400';
      default: return 'bg-slate-50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-400';
    }
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'completado': return CheckCircle2;
      case 'en_progreso': return Clock;
      case 'pendiente': return Circle;
      case 'cancelado': return XCircle;
      default: return Circle;
    }
  };

  const getTodayPosition = () => {
    if (!ganttData?.projectStart || !ganttData?.projectEnd) return -1;

    const start = new Date(ganttData.projectStart);
    const end = new Date(ganttData.projectEnd);
    const today = new Date();

    if (today < start || today > end) return -1;

    const totalDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    const dayOffset = (today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);

    return (dayOffset / totalDays) * 100;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-200 dark:border-slate-700 border-t-primary-600"></div>
          <p className="text-sm text-slate-400 dark:text-slate-500">Cargando cronograma...</p>
        </div>
      </div>
    );
  }

  const timeHeaders = getTimeHeaders();
  const todayPosition = getTodayPosition();

  return (
    <div className="p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            to={`/proyectos/${id}`}
            className="inline-flex items-center gap-1.5 text-sm text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al proyecto
          </Link>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Cronograma</h1>
          <p className="text-xs text-slate-400 dark:text-slate-500">Diagrama de Gantt - Proyecto #{id}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-1">
            {(['days', 'weeks', 'months'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  viewMode === mode
                    ? 'bg-primary-600 text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                {mode === 'days' ? 'Dias' : mode === 'weeks' ? 'Semanas' : 'Meses'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <Calendar className="w-4 h-4 text-blue-500" />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Total Actividades</p>
            </div>
            <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{stats.total_actividades}</p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-primary-50 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-primary-500" />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Avance General</p>
            </div>
            <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">{stats.avance_promedio.toFixed(1)}%</p>
            <div className="mt-2 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-500 rounded-full transition-all"
                style={{ width: `${stats.avance_promedio}%` }}
              />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-amber-50 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
                <Clock className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Dias Restantes</p>
            </div>
            <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{stats.diasRestantes}</p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500">{stats.porcentajeTiempo}% del tiempo</p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Estado</p>
            <div className="flex flex-wrap gap-1.5">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-md">
                <CheckCircle2 className="w-3 h-3" />
                {stats.completadas}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-md">
                <Clock className="w-3 h-3" />
                {stats.en_progreso}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-md">
                <Circle className="w-3 h-3" />
                {stats.pendientes}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
        <div className="flex flex-wrap gap-3 text-xs">
          {[
            { color: 'bg-violet-500', label: 'Hito' },
            { color: 'bg-emerald-500', label: 'Completado' },
            { color: 'bg-amber-500', label: 'En Progreso' },
            { color: 'bg-slate-300', label: 'Pendiente' },
            { color: 'bg-red-500', label: 'Hoy', isLine: true },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-1.5">
              {item.isLine ? (
                <div className="w-0.5 h-3 bg-red-500 rounded-full" />
              ) : (
                <div className={`w-3 h-3 ${item.color} rounded-sm`} />
              )}
              <span className="text-slate-600 dark:text-slate-400">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Gantt Chart */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        {ganttData && ganttData.activities.length > 0 ? (
          <div className="flex">
            {/* Activity Names */}
            <div className="w-72 flex-shrink-0 border-r border-slate-200 dark:border-slate-700">
              <div className="h-10 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 flex items-center px-4">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Actividad
                </span>
              </div>
              {ganttData.activities.map((activity) => (
                <div
                  key={activity.id}
                  className={`h-10 border-b border-slate-100 dark:border-slate-700/50 flex items-center px-4 text-sm ${getLevelStyles(activity.nivel)}`}
                  style={{ paddingLeft: `${(activity.nivel - 1) * 16 + 16}px` }}
                >
                  <span className="font-mono text-[10px] font-bold mr-2 opacity-70">{activity.codigo}</span>
                  <span className="truncate">{activity.nombre}</span>
                </div>
              ))}
            </div>

            {/* Timeline */}
            <div className="flex-1 overflow-x-auto">
              {/* Time Headers */}
              <div className="h-10 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 flex">
                {timeHeaders.map((header, idx) => (
                  <div
                    key={idx}
                    className="flex-1 border-r border-slate-200 dark:border-slate-700 flex items-center justify-center text-[10px] font-medium text-slate-500 dark:text-slate-400"
                    style={{ minWidth: viewMode === 'days' ? '24px' : viewMode === 'weeks' ? '40px' : '80px' }}
                  >
                    {header.label}
                  </div>
                ))}
              </div>

              {/* Bars */}
              <div className="relative">
                {/* Today Line */}
                {todayPosition >= 0 && (
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
                    style={{ left: `${todayPosition}%` }}
                  />
                )}

                {ganttData.activities.map((activity) => {
                  const left = getDatePosition(activity.fecha_inicio);
                  const width = getBarWidth(activity.fecha_inicio, activity.fecha_fin);
                  const EstadoIcon = getEstadoIcon(activity.estado);

                  return (
                    <div
                      key={activity.id}
                      className="h-10 border-b border-slate-100 dark:border-slate-700/50 flex items-center"
                    >
                      <div
                        className={`absolute h-5 rounded-md ${getBarStyles(activity)} flex items-center justify-center text-white text-[10px] font-medium shadow-sm cursor-pointer hover:opacity-80 transition-opacity`}
                        style={{
                          left: `${left}%`,
                          width: `${width}%`,
                          minWidth: '20px',
                        }}
                        title={`${activity.nombre}: ${activity.avance}%`}
                      >
                        {width > 5 && <span>{activity.avance}%</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-3">
              <Calendar className="w-6 h-6 text-slate-400 dark:text-slate-500" />
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
              No hay actividades con fechas definidas
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              Define fechas de inicio y fin en el modulo WBS
            </p>
          </div>
        )}
      </div>

      {/* Milestones */}
      {ganttData && ganttData.milestones.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center gap-2 mb-4">
            <Diamond className="w-4 h-4 text-violet-500" />
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Hitos del Proyecto</h3>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {ganttData.milestones.map((milestone) => (
              <div
                key={milestone.id}
                className="p-3 bg-violet-50 dark:bg-violet-900/20 rounded-xl border border-violet-200 dark:border-violet-800"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Diamond className="w-3 h-3 text-violet-500 dark:text-violet-400" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">
                    {milestone.nombre}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {new Date(milestone.fecha).toLocaleDateString('es-ES')}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CronogramaPage;
