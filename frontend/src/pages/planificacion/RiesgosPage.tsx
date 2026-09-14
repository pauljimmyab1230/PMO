import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  riesgosService,
  Riesgo,
  RiesgoSummary,
  HeatmapCell,
  RiesgoUser,
} from '../../services/riesgos.service';
import {
  ArrowLeft,
  Plus,
  AlertTriangle,
  Shield,
  Eye,
  CheckCircle2,
  XCircle,
  AlertCircle,
  X,
  Save,
  Loader2,
  Edit3,
  Trash2,
  Grid3X3,
  BarChart3,
  List,
} from 'lucide-react';

const RiesgosPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [riesgos, setRiesgos] = useState<Riesgo[]>([]);
  const [summary, setSummary] = useState<RiesgoSummary | null>(null);
  const [heatmap, setHeatmap] = useState<HeatmapCell[]>([]);
  const [users, setUsers] = useState<RiesgoUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'lista' | 'heatmap' | 'resumen'>('lista');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Riesgo | null>(null);

  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    probabilidad: 3,
    impacto: 3,
    categoria: 'tecnico',
    tipo_impacto: 'tiempo',
    tipo_respuesta: 'mitigar',
    plan_respuesta: '',
    responsable_id: '',
    estado: 'identificado',
  });

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setError(null);
      const [riesgosRes, summaryRes, heatmapRes, usersRes] = await Promise.all([
        riesgosService.getByProject(parseInt(id || '0')),
        riesgosService.getSummary(parseInt(id || '0')),
        riesgosService.getHeatmap(parseInt(id || '0')),
        riesgosService.getUsers(parseInt(id || '0')),
      ]);
      setRiesgos(riesgosRes.data);
      setSummary(summaryRes.data);
      setHeatmap(heatmapRes.data.matrix);
      setUsers(usersRes.data);
    } catch (err) {
      setError('Error al cargar los riesgos');
      console.error('Error loading riesgos:', err);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingItem(null);
    setFormData({
      titulo: '',
      descripcion: '',
      probabilidad: 3,
      impacto: 3,
      categoria: 'tecnico',
      tipo_impacto: 'tiempo',
      tipo_respuesta: 'mitigar',
      plan_respuesta: '',
      responsable_id: '',
      estado: 'identificado',
    });
    setShowModal(true);
  };

  const openEditModal = (riesgo: Riesgo) => {
    setEditingItem(riesgo);
    setFormData({
      titulo: riesgo.titulo,
      descripcion: riesgo.descripcion || '',
      probabilidad: riesgo.probabilidad,
      impacto: riesgo.impacto,
      categoria: riesgo.categoria || 'tecnico',
      tipo_impacto: riesgo.tipo_impacto || 'tiempo',
      tipo_respuesta: riesgo.tipo_respuesta || 'mitigar',
      plan_respuesta: riesgo.plan_respuesta || '',
      responsable_id: riesgo.responsable_id ? String(riesgo.responsable_id) : '',
      estado: riesgo.estado,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);

      const submitData = {
        ...formData,
        probabilidad: Number(formData.probabilidad),
        impacto: Number(formData.impacto),
        responsable_id: formData.responsable_id ? Number(formData.responsable_id) : undefined,
      };

      if (editingItem) {
        await riesgosService.update(editingItem.id, submitData);
      } else {
        await riesgosService.create(parseInt(id || '0'), submitData);
      }
      setShowModal(false);
      await loadData();
    } catch (err) {
      setError('Error al guardar el riesgo');
      console.error('Error saving:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (riesgoId: number) => {
    if (confirm('Estas seguro de eliminar este riesgo?')) {
      try {
        await riesgosService.delete(riesgoId);
        await loadData();
      } catch (err) {
        setError('Error al eliminar');
      }
    }
  };

  const getNivelStyles = (nivel: number) => {
    if (nivel >= 20) return { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-600 dark:text-red-400', border: 'border-red-200 dark:border-red-800', badge: 'bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-300', label: 'Critico' };
    if (nivel >= 12) return { bg: 'bg-orange-50 dark:bg-orange-900/20', text: 'text-orange-600 dark:text-orange-400', border: 'border-orange-200 dark:border-orange-800', badge: 'bg-orange-100 dark:bg-orange-800 text-orange-700 dark:text-orange-300', label: 'Alto' };
    if (nivel >= 6) return { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-800', badge: 'bg-amber-100 dark:bg-amber-800 text-amber-700 dark:text-amber-300', label: 'Medio' };
    return { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-800', badge: 'bg-emerald-100 dark:bg-emerald-800 text-emerald-700 dark:text-emerald-300', label: 'Bajo' };
  };

  const getEstadoStyles = (estado: string) => {
    switch (estado) {
      case 'identificado': return { icon: Eye, bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-400', label: 'Identificado' };
      case 'en_seguimiento': return { icon: AlertTriangle, bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-600 dark:text-amber-400', label: 'En Seguimiento' };
      case 'materializado': return { icon: XCircle, bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-600 dark:text-red-400', label: 'Materializado' };
      case 'cerrado': return { icon: CheckCircle2, bg: 'bg-slate-100 dark:bg-slate-700', text: 'text-slate-500 dark:text-slate-400', label: 'Cerrado' };
      default: return { icon: Eye, bg: 'bg-slate-100 dark:bg-slate-700', text: 'text-slate-500 dark:text-slate-400', label: estado };
    }
  };

  const getHeatmapColor = (nivel: number) => {
    if (nivel >= 20) return 'bg-red-500 dark:bg-red-400';
    if (nivel >= 12) return 'bg-orange-400 dark:bg-orange-300';
    if (nivel >= 6) return 'bg-amber-300 dark:bg-amber-200';
    return 'bg-emerald-300 dark:bg-emerald-200';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-200 dark:border-slate-700 border-t-primary-600"></div>
          <p className="text-sm text-slate-400 dark:text-slate-500">Cargando riesgos...</p>
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
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Gestion de Riesgos</h1>
          <p className="text-xs text-slate-400 dark:text-slate-500">Proyecto #{id}</p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 bg-primary-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Nuevo Riesgo
        </button>
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
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 text-center">
            <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{summary.stats.total_riesgos}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Total</p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800 p-4 text-center">
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{summary.stats.identificados}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Identificados</p>
          </div>
          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800 p-4 text-center">
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{summary.stats.en_seguimiento}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">En Seguimiento</p>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800 p-4 text-center">
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">{summary.stats.materializados}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Materializados</p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600 p-4 text-center">
            <p className="text-2xl font-bold text-slate-600 dark:text-slate-300">{summary.stats.cerrados}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Cerrados</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-700">
        <nav className="flex gap-1 -mb-px">
          {[
            { id: 'lista' as const, label: 'Lista de Riesgos', icon: List, count: riesgos.length },
            { id: 'heatmap' as const, label: 'Matriz de Calor', icon: Grid3X3 },
            { id: 'resumen' as const, label: 'Resumen', icon: BarChart3 },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.count !== undefined && (
                <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded-full">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Lista Tab */}
      {activeTab === 'lista' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700">
                  <th className="text-left px-6 py-3 text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Codigo</th>
                  <th className="text-left px-6 py-3 text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Titulo</th>
                  <th className="text-center px-6 py-3 text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Prob.</th>
                  <th className="text-center px-6 py-3 text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Impacto</th>
                  <th className="text-center px-6 py-3 text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Nivel</th>
                  <th className="text-left px-6 py-3 text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Respuesta</th>
                  <th className="text-left px-6 py-3 text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Estado</th>
                  <th className="text-right px-6 py-3 text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {riesgos.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Shield className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">No hay riesgos registrados</p>
                    </td>
                  </tr>
                ) : (
                  riesgos.map((riesgo) => {
                    const nivel = getNivelStyles(riesgo.nivel_riesgo);
                    const estado = getEstadoStyles(riesgo.estado);
                    return (
                      <tr key={riesgo.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group">
                        <td className="px-6 py-4 text-xs font-mono text-slate-500 dark:text-slate-400">{riesgo.codigo}</td>
                        <td className="px-6 py-4 text-sm font-medium text-slate-700 dark:text-slate-200">{riesgo.titulo}</td>
                        <td className="px-6 py-4 text-center text-sm text-slate-600 dark:text-slate-300">{riesgo.probabilidad}</td>
                        <td className="px-6 py-4 text-center text-sm text-slate-600 dark:text-slate-300">{riesgo.impacto}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-bold rounded-md ${nivel.badge}`}>
                            {riesgo.nivel_riesgo} - {nivel.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300 capitalize">{riesgo.tipo_respuesta || '-'}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-md ${estado.bg} ${estado.text}`}>
                            <estado.icon className="w-3 h-3" />
                            {estado.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => openEditModal(riesgo)} className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors" title="Editar">
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDelete(riesgo.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" title="Eliminar">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Heatmap Tab */}
      {activeTab === 'heatmap' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4">Matriz de Probabilidad vs Impacto</h3>
          <div className="overflow-x-auto">
            <table className="border-collapse">
              <thead>
                <tr>
                  <th className="p-2 border border-slate-200 dark:border-slate-600"></th>
                  <th className="p-2 border border-slate-200 dark:border-slate-600 text-center text-[10px] font-medium text-slate-500 dark:text-slate-400" colSpan={5}>
                    IMPACTO
                  </th>
                </tr>
                <tr>
                  <th className="p-2 border border-slate-200 dark:border-slate-600"></th>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <th key={i} className="p-2 border border-slate-200 dark:border-slate-600 w-20 text-center text-[10px] font-medium text-slate-500 dark:text-slate-400">
                      {i}<br/>{i === 1 ? 'Muy Bajo' : i === 2 ? 'Bajo' : i === 3 ? 'Medio' : i === 4 ? 'Alto' : 'Muy Alto'}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[5, 4, 3, 2, 1].map((p) => (
                  <tr key={p}>
                    <td className="p-2 border border-slate-200 dark:border-slate-600 text-center text-[10px] font-medium text-slate-500 dark:text-slate-400">
                      {p}<br/>{p === 1 ? 'Muy Baja' : p === 2 ? 'Baja' : p === 3 ? 'Media' : p === 4 ? 'Alta' : 'Muy Alta'}
                    </td>
                    {[1, 2, 3, 4, 5].map((i) => {
                      const nivel = p * i;
                      const cellRisks = riesgos.filter((r) => r.probabilidad === p && r.impacto === i);
                      return (
                        <td key={i} className={`p-2 border border-slate-200 dark:border-slate-600 text-center ${getHeatmapColor(nivel)} min-w-[80px]`}>
                          <div className="font-bold text-sm text-slate-800 dark:text-slate-900">{nivel}</div>
                          {cellRisks.length > 0 && (
                            <div className="text-[10px] mt-1 space-y-0.5">
                              {cellRisks.map((r) => (
                                <div key={r.id} className="bg-white/70 dark:bg-black/30 rounded px-1 truncate font-medium" title={r.titulo}>
                                  {r.codigo}
                                </div>
                              ))}
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs">
            <span className="font-medium text-slate-500 dark:text-slate-400">PROBABILIDAD:</span>
            <div className="flex items-center gap-1"><div className="w-3 h-3 bg-emerald-300 rounded" /><span className="text-slate-600 dark:text-slate-400">Bajo (1-5)</span></div>
            <div className="flex items-center gap-1"><div className="w-3 h-3 bg-amber-300 rounded" /><span className="text-slate-600 dark:text-slate-400">Medio (6-11)</span></div>
            <div className="flex items-center gap-1"><div className="w-3 h-3 bg-orange-400 rounded" /><span className="text-slate-600 dark:text-slate-400">Alto (12-19)</span></div>
            <div className="flex items-center gap-1"><div className="w-3 h-3 bg-red-500 rounded" /><span className="text-slate-600 dark:text-slate-400">Critico (20-25)</span></div>
          </div>
        </div>
      )}

      {/* Resumen Tab */}
      {activeTab === 'resumen' && summary && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4">Por Estado</h3>
            <div className="space-y-2">
              {summary.byStatus.map((item) => {
                const estado = getEstadoStyles(item.estado);
                return (
                  <div key={item.estado} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50">
                    <span className={`inline-flex items-center gap-1.5 text-sm ${estado.text}`}>
                      <estado.icon className="w-4 h-4" />
                      {estado.label}
                    </span>
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{item.total}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4">Por Nivel</h3>
            <div className="space-y-2">
              {summary.byLevel.map((item) => {
                const nivel = getNivelStyles(parseInt(item.nivel) || 0);
                return (
                  <div key={item.nivel} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50">
                    <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-md ${nivel.badge}`}>
                      {item.nivel}
                    </span>
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{item.total}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {summary.byCategory.length > 0 && (
            <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4">Por Categoria</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-700">
                      <th className="text-left py-2 text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase">Categoria</th>
                      <th className="text-right py-2 text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase">Total</th>
                      <th className="text-right py-2 text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase">Promedio</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {summary.byCategory.map((item) => (
                      <tr key={item.categoria} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                        <td className="py-2 text-sm text-slate-700 dark:text-slate-200 capitalize">{item.categoria}</td>
                        <td className="py-2 text-right text-sm font-bold text-slate-700 dark:text-slate-200">{item.total}</td>
                        <td className="py-2 text-right text-sm text-slate-500 dark:text-slate-400">{item.promedio.toFixed(1)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                {editingItem ? 'Editar Riesgo' : 'Nuevo Riesgo'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Titulo *</label>
                <input type="text" value={formData.titulo} onChange={(e) => setFormData({ ...formData, titulo: e.target.value })} required
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors" />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Descripcion</label>
                <textarea value={formData.descripcion} onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors resize-none" rows={2} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Probabilidad (1-5)</label>
                  <input type="number" value={formData.probabilidad} onChange={(e) => setFormData({ ...formData, probabilidad: parseInt(e.target.value) })} min="1" max="5"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Impacto (1-5)</label>
                  <input type="number" value={formData.impacto} onChange={(e) => setFormData({ ...formData, impacto: parseInt(e.target.value) })} min="1" max="5"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors" />
                </div>
              </div>

              <div className={`p-3 rounded-xl text-center ${getNivelStyles(formData.probabilidad * formData.impacto).bg}`}>
                <span className="text-xs text-slate-500 dark:text-slate-400">Nivel de Riesgo: </span>
                <span className={`text-sm font-bold px-2 py-0.5 rounded-md ${getNivelStyles(formData.probabilidad * formData.impacto).badge}`}>
                  {formData.probabilidad * formData.impacto} - {getNivelStyles(formData.probabilidad * formData.impacto).label}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Categoria</label>
                  <select value={formData.categoria} onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors">
                    <option value="tecnico">Tecnico</option>
                    <option value="financiero">Financiero</option>
                    <option value="organizacional">Organizacional</option>
                    <option value="externo">Externo</option>
                    <option value="legal">Legal</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Tipo Respuesta</label>
                  <select value={formData.tipo_respuesta} onChange={(e) => setFormData({ ...formData, tipo_respuesta: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors">
                    <option value="mitigar">Mitigar</option>
                    <option value="transferir">Transferir</option>
                    <option value="aceptar">Aceptar</option>
                    <option value="evitar">Evitar</option>
                  </select>
                </div>
              </div>

              {editingItem && (
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Estado</label>
                  <select value={formData.estado} onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors">
                    <option value="identificado">Identificado</option>
                    <option value="en_seguimiento">En Seguimiento</option>
                    <option value="materializado">Materializado</option>
                    <option value="cerrado">Cerrado</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Responsable</label>
                <select value={formData.responsable_id} onChange={(e) => setFormData({ ...formData, responsable_id: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors">
                  <option value="">Sin asignar</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>{u.nombre}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Plan de Respuesta</label>
                <textarea value={formData.plan_respuesta} onChange={(e) => setFormData({ ...formData, plan_respuesta: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors resize-none" rows={2} />
              </div>
            </form>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
              <button type="button" onClick={() => setShowModal(false)} disabled={saving}
                className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50">
                Cancelar
              </button>
              <button type="submit" onClick={handleSubmit} disabled={saving}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 shadow-sm">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? 'Guardando...' : editingItem ? 'Guardar' : 'Crear'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RiesgosPage;
