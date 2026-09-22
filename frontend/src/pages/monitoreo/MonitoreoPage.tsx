import React, { useEffect, useState } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import {
  monitoreoService,
  MonitoreoDashboard,
  ValorGanado,
  Indicador,
  Cambio,
} from '../../services/monitoreo.service';
import {
  ArrowLeft,
  Plus,
  TrendingUp,
  Clock,
  DollarSign,
  AlertTriangle,
  Activity,
  BarChart3,
  Gauge,
  Target,
  AlertCircle,
  X,
  Save,
  Loader2,
  Trash2,
  Check,
  Circle,
} from 'lucide-react';
import { formatCurrency } from '../../utils/format';

const MonitoreoPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const [dashboard, setDashboard] = useState<MonitoreoDashboard | null>(null);
  const [valorGanado, setValorGanado] = useState<ValorGanado[]>([]);
  const [indicadores, setIndicadores] = useState<Indicador[]>([]);
  const [cambios, setCambios] = useState<Cambio[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'valor-ganado' | 'indicadores' | 'cambios'>(
    (searchParams.get('tab') as any) || 'dashboard'
  );
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');

  const [vgForm, setVgForm] = useState({ periodo: '', pv: '', ev: '', ac: '', bac: '' });
  const [indForm, setIndForm] = useState({ nombre: '', formula: '', meta: '', unidad: '', frecuencia_medicion: 'mensual', responsable_id: '' });
  const [cambioForm, setCambioForm] = useState({ titulo: '', descripcion: '', justificacion: '', impacto_alcance: '', impacto_tiempo: '', impacto_costo: '', impacto_calidad: '' });

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setError(null);
      const [d, vg, ind, cam, u] = await Promise.all([
        monitoreoService.getDashboard(parseInt(id || '0')),
        monitoreoService.getValorGanado(parseInt(id || '0')),
        monitoreoService.getIndicadores(parseInt(id || '0')),
        monitoreoService.getCambios(parseInt(id || '0')),
        monitoreoService.getUsers(parseInt(id || '0')),
      ]);
      setDashboard(d.data);
      setValorGanado(vg.data);
      setIndicadores(ind.data);
      setCambios(cam.data);
      setUsers(u.data);
    } catch (err) {
      setError('Error al cargar monitoreo');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (type: string) => {
    setModalType(type);
    setVgForm({ periodo: '', pv: '', ev: '', ac: '', bac: '' });
    setIndForm({ nombre: '', formula: '', meta: '', unidad: '', frecuencia_medicion: 'mensual', responsable_id: '' });
    setCambioForm({ titulo: '', descripcion: '', justificacion: '', impacto_alcance: '', impacto_tiempo: '', impacto_costo: '', impacto_calidad: '' });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (modalType === 'valor-ganado') {
        await monitoreoService.createValorGanado(parseInt(id || '0'), {
          ...vgForm, pv: Number(vgForm.pv), ev: Number(vgForm.ev), ac: Number(vgForm.ac), bac: Number(vgForm.bac),
        });
      } else if (modalType === 'indicador') {
        await monitoreoService.createIndicador(parseInt(id || '0'), {
          ...indForm, meta: Number(indForm.meta), responsable_id: indForm.responsable_id ? Number(indForm.responsable_id) : undefined,
        });
      } else if (modalType === 'cambio') {
        await monitoreoService.createCambio(parseInt(id || '0'), {
          ...cambioForm, impacto_costo: Number(cambioForm.impacto_costo) || 0,
        });
      }
      setShowModal(false);
      await loadData();
    } catch (err) {
      setError('Error al guardar');
    }
  };

  const handleDelete = async (type: string, itemId: number) => {
    if (!confirm('Eliminar este registro?')) return;
    try {
      if (type === 'valor-ganado') await monitoreoService.deleteValorGanado(itemId);
      else if (type === 'indicador') await monitoreoService.deleteIndicador(itemId);
      else if (type === 'cambio') await monitoreoService.deleteCambio(itemId);
      await loadData();
    } catch {
      setError('Error al eliminar');
    }
  };

  const handleCambioStatus = async (cambioId: number, estado: string) => {
    const motivo = estado === 'rechazado' ? prompt('Motivo de rechazo:') : '';
    if (estado === 'rechazado' && !motivo) return;
    try {
      await monitoreoService.updateCambioStatus(cambioId, estado, motivo || undefined);
      await loadData();
    } catch {
      setError('Error al cambiar estado');
    }
  };

  const fmt = (n: number) => formatCurrency(n);

  const getCambioStyles = (estado: string) => {
    switch (estado) {
      case 'solicitado': return { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-400' };
      case 'evaluado': return { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-600 dark:text-amber-400' };
      case 'aprobado': return { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-600 dark:text-emerald-400' };
      case 'rechazado': return { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-600 dark:text-red-400' };
      case 'implementado': return { bg: 'bg-violet-50 dark:bg-violet-900/20', text: 'text-violet-600 dark:text-violet-400' };
      default: return { bg: 'bg-slate-100 dark:bg-slate-700', text: 'text-slate-500 dark:text-slate-400' };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-200 dark:border-slate-700 border-t-primary-600"></div>
          <p className="text-sm text-slate-400 dark:text-slate-500">Cargando monitoreo...</p>
        </div>
      </div>
    );
  }

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
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Monitoreo y Control</h1>
          <p className="text-xs text-slate-400 dark:text-slate-500">Proyecto #{id}</p>
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

      {/* Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-700">
        <nav className="flex gap-1 -mb-px overflow-x-auto">
          {[
            { id: 'dashboard' as const, label: 'Dashboard', icon: BarChart3 },
            { id: 'valor-ganado' as const, label: 'Valor Ganado', icon: TrendingUp },
            { id: 'indicadores' as const, label: 'Indicadores', icon: Gauge },
            { id: 'cambios' as const, label: 'Control Cambios', icon: Activity },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* DASHBOARD TAB */}
      {activeTab === 'dashboard' && dashboard && (
        <div className="space-y-4">
          {/* Progress Bars */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4">Avance del Proyecto</h3>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Avance Fisico (WBS)</span>
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{Number(dashboard.wbs?.avance_promedio || 0).toFixed(1)}%</span>
                </div>
                <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-primary-500 rounded-full transition-all" style={{ width: `${dashboard.wbs?.avance_promedio || 0}%` }} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Avance Tiempo</span>
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{Number(dashboard.tiempo?.porcentajeTiempo || 0).toFixed(1)}%</span>
                </div>
                <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: `${dashboard.tiempo?.porcentajeTiempo || 0}%` }} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Avance Presupuesto</span>
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                    {dashboard.presupuesto?.total ? Number(dashboard.presupuesto.real / dashboard.presupuesto.total * 100).toFixed(1) : '0'}%
                  </span>
                </div>
                <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${dashboard.presupuesto?.total ? (dashboard.presupuesto.real / dashboard.presupuesto.total * 100) : 0}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-amber-50 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
                  <Clock className="w-4 h-4 text-amber-500" />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Dias Restantes</p>
              </div>
              <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{dashboard.tiempo?.diasRestantes || 0}</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                  <Check className="w-4 h-4 text-emerald-500" />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">WBS Completado</p>
              </div>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{dashboard.wbs?.completadas || 0}/{dashboard.wbs?.total || 0}</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-blue-500" />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Presupuesto</p>
              </div>
              <p className="text-lg font-bold text-slate-800 dark:text-slate-100">{fmt(dashboard.presupuesto?.real || 0)}</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500">de {fmt(dashboard.presupuesto?.total || 0)}</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-red-50 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Issues / Riesgos</p>
              </div>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{dashboard.issues?.criticos || 0} / {dashboard.riesgos?.criticos || 0}</p>
            </div>
          </div>

          {/* Ultimo Valor Ganado */}
          {valorGanado.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4">Ultimo Valor Ganado</h3>
              {(() => {
                const last = valorGanado[valorGanado.length - 1];
                return (
                  <div className="grid grid-cols-3 lg:grid-cols-6 gap-4">
                    <div className="text-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase">PV</p>
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{fmt(last.pv)}</p>
                    </div>
                    <div className="text-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase">EV</p>
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{fmt(last.ev)}</p>
                    </div>
                    <div className="text-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase">AC</p>
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{fmt(last.ac)}</p>
                    </div>
                    <div className="text-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase">SPI</p>
                      <p className={`text-sm font-bold ${(last.spi || 0) >= 1 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>{(last.spi || 0).toFixed(2)}</p>
                    </div>
                    <div className="text-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase">CPI</p>
                      <p className={`text-sm font-bold ${(last.cpi || 0) >= 1 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>{(last.cpi || 0).toFixed(2)}</p>
                    </div>
                    <div className="text-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase">EAC</p>
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{fmt(last.eac || 0)}</p>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      )}

      {/* VALOR GANADO TAB */}
      {activeTab === 'valor-ganado' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Valor Ganado (Curva S)</h3>
            <button onClick={() => openModal('valor-ganado')} className="inline-flex items-center gap-2 bg-primary-600 text-white px-3 py-2 rounded-lg text-xs font-medium hover:bg-primary-700 transition-colors shadow-sm">
              <Plus className="w-3.5 h-3.5" /> Nuevo Periodo
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700">
                  {['Periodo', 'PV', 'EV', 'AC', 'SPI', 'CPI', 'EAC', 'Acciones'].map((h) => (
                    <th key={h} className={`px-6 py-3 text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider ${h === 'Acciones' ? 'text-right' : 'text-center'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {valorGanado.length === 0 ? (
                  <tr><td colSpan={8} className="px-6 py-12 text-center"><p className="text-sm text-slate-500 dark:text-slate-400 font-medium">No hay datos</p></td></tr>
                ) : valorGanado.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group">
                    <td className="px-6 py-4 text-center text-sm font-medium text-slate-700 dark:text-slate-200">{item.periodo}</td>
                    <td className="px-6 py-4 text-center text-sm text-slate-600 dark:text-slate-300">{fmt(item.pv)}</td>
                    <td className="px-6 py-4 text-center text-sm text-slate-600 dark:text-slate-300">{fmt(item.ev)}</td>
                    <td className="px-6 py-4 text-center text-sm text-slate-600 dark:text-slate-300">{fmt(item.ac)}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`text-sm font-bold ${(item.spi || 0) >= 1 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                        {(item.spi || 0).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`text-sm font-bold ${(item.cpi || 0) >= 1 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                        {(item.cpi || 0).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-slate-600 dark:text-slate-300">{fmt(item.eac || 0)}</td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleDelete('valor-ganado', item.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors opacity-0 group-hover:opacity-100">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* INDICADORES TAB */}
      {activeTab === 'indicadores' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Indicadores KPI</h3>
            <button onClick={() => openModal('indicador')} className="inline-flex items-center gap-2 bg-primary-600 text-white px-3 py-2 rounded-lg text-xs font-medium hover:bg-primary-700 transition-colors shadow-sm">
              <Plus className="w-3.5 h-3.5" /> Nuevo Indicador
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700">
                  {['Nombre', 'Formula', 'Meta', 'Unidad', 'Frecuencia', 'Acciones'].map((h) => (
                    <th key={h} className={`px-6 py-3 text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider ${h === 'Acciones' ? 'text-right' : 'text-left'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {indicadores.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-12 text-center"><p className="text-sm text-slate-500 dark:text-slate-400 font-medium">No hay indicadores</p></td></tr>
                ) : indicadores.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group">
                    <td className="px-6 py-4 text-sm font-medium text-slate-700 dark:text-slate-200">{item.nombre}</td>
                    <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">{item.formula || '-'}</td>
                    <td className="px-6 py-4 text-center text-sm text-slate-600 dark:text-slate-300">{item.meta || '-'}</td>
                    <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">{item.unidad || '-'}</td>
                    <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 capitalize">{item.frecuencia_medicion || '-'}</td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleDelete('indicador', item.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors opacity-0 group-hover:opacity-100">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CAMBIOS TAB */}
      {activeTab === 'cambios' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Control de Cambios</h3>
            <button onClick={() => openModal('cambio')} className="inline-flex items-center gap-2 bg-primary-600 text-white px-3 py-2 rounded-lg text-xs font-medium hover:bg-primary-700 transition-colors shadow-sm">
              <Plus className="w-3.5 h-3.5" /> Nueva Solicitud
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700">
                  {['Codigo', 'Titulo', 'Costo', 'Estado', 'Solicitado por', 'Acciones'].map((h) => (
                    <th key={h} className={`px-6 py-3 text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider ${h === 'Acciones' ? 'text-right' : 'text-left'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {cambios.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-12 text-center"><p className="text-sm text-slate-500 dark:text-slate-400 font-medium">No hay solicitudes</p></td></tr>
                ) : cambios.map((item) => {
                  const estado = getCambioStyles(item.estado);
                  return (
                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group">
                      <td className="px-6 py-4 text-xs font-mono text-slate-500 dark:text-slate-400">{item.codigo}</td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-700 dark:text-slate-200">{item.titulo}</td>
                      <td className="px-6 py-4 text-center text-sm text-slate-600 dark:text-slate-300">{fmt(item.impacto_costo || 0)}</td>
                      <td className="px-6 py-4">
                        <select
                          value={item.estado}
                          onChange={(e) => handleCambioStatus(item.id, e.target.value)}
                          className={`text-[10px] font-semibold rounded-md px-2 py-1 border-0 focus:ring-2 focus:ring-primary-500 cursor-pointer ${estado.bg} ${estado.text}`}
                        >
                          <option value="solicitado">Solicitado</option>
                          <option value="evaluado">Evaluado</option>
                          <option value="aprobado">Aprobado</option>
                          <option value="rechazado">Rechazado</option>
                          <option value="implementado">Implementado</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">{item.solicitado_por_nombre || '-'}</td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => handleDelete('cambio', item.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors opacity-0 group-hover:opacity-100">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                {modalType === 'valor-ganado' ? 'Nuevo Periodo Valor Ganado' : modalType === 'indicador' ? 'Nuevo Indicador' : 'Nueva Solicitud de Cambio'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-140px)]">
              {modalType === 'valor-ganado' && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Periodo *</label>
                    <input type="text" value={vgForm.periodo} onChange={(e) => setVgForm({ ...vgForm, periodo: e.target.value })} placeholder="Ej: 2026-Sem1" required
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">PV (Planificado) *</label>
                      <input type="number" value={vgForm.pv} onChange={(e) => setVgForm({ ...vgForm, pv: e.target.value })} required
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">EV (Ganado) *</label>
                      <input type="number" value={vgForm.ev} onChange={(e) => setVgForm({ ...vgForm, ev: e.target.value })} required
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">AC (Actual) *</label>
                      <input type="number" value={vgForm.ac} onChange={(e) => setVgForm({ ...vgForm, ac: e.target.value })} required
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">BAC (Presupuesto Total)</label>
                      <input type="number" value={vgForm.bac} onChange={(e) => setVgForm({ ...vgForm, bac: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors" />
                    </div>
                  </div>
                </>
              )}
              {modalType === 'indicador' && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Nombre *</label>
                    <input type="text" value={indForm.nombre} onChange={(e) => setIndForm({ ...indForm, nombre: e.target.value })} required
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Formula</label>
                    <input type="text" value={indForm.formula} onChange={(e) => setIndForm({ ...indForm, formula: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors" />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Meta</label>
                      <input type="number" value={indForm.meta} onChange={(e) => setIndForm({ ...indForm, meta: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Unidad</label>
                      <input type="text" value={indForm.unidad} onChange={(e) => setIndForm({ ...indForm, unidad: e.target.value })} placeholder="%, horas"
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Frecuencia</label>
                      <select value={indForm.frecuencia_medicion} onChange={(e) => setIndForm({ ...indForm, frecuencia_medicion: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors">
                        <option value="diaria">Diaria</option>
                        <option value="semanal">Semanal</option>
                        <option value="mensual">Mensual</option>
                        <option value="trimestral">Trimestral</option>
                      </select>
                    </div>
                  </div>
                </>
              )}
              {modalType === 'cambio' && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Titulo *</label>
                    <input type="text" value={cambioForm.titulo} onChange={(e) => setCambioForm({ ...cambioForm, titulo: e.target.value })} required
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Descripcion</label>
                    <textarea value={cambioForm.descripcion} onChange={(e) => setCambioForm({ ...cambioForm, descripcion: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors resize-none" rows={2} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Justificacion</label>
                    <textarea value={cambioForm.justificacion} onChange={(e) => setCambioForm({ ...cambioForm, justificacion: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors resize-none" rows={2} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Impacto Alcance</label>
                      <input type="text" value={cambioForm.impacto_alcance} onChange={(e) => setCambioForm({ ...cambioForm, impacto_alcance: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Impacto Tiempo</label>
                      <input type="text" value={cambioForm.impacto_tiempo} onChange={(e) => setCambioForm({ ...cambioForm, impacto_tiempo: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Impacto Costo ($)</label>
                      <input type="number" value={cambioForm.impacto_costo} onChange={(e) => setCambioForm({ ...cambioForm, impacto_costo: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Impacto Calidad</label>
                      <input type="text" value={cambioForm.impacto_calidad} onChange={(e) => setCambioForm({ ...cambioForm, impacto_calidad: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors" />
                    </div>
                  </div>
                </>
              )}
            </form>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
              <button type="button" onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors">
                Cancelar
              </button>
              <button type="submit" onClick={handleSubmit}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors shadow-sm">
                <Save className="w-4 h-4" />
                Crear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MonitoreoPage;
