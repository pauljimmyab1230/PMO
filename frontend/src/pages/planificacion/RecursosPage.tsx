import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  recursosService,
  Recurso,
  RecursoUser,
  RecursoRole,
  RecursoSummary,
  WBSActivity,
} from '../../services/recursos.service';
import { formatCurrency } from '../../utils/format';
import {
  ArrowLeft,
  Plus,
  Users,
  UserCheck,
  Clock,
  Percent,
  AlertCircle,
  X,
  Save,
  Loader2,
  Edit3,
  Trash2,
  Calendar,
  Briefcase,
} from 'lucide-react';

const RecursosPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [recursos, setRecursos] = useState<Recurso[]>([]);
  const [summary, setSummary] = useState<RecursoSummary | null>(null);
  const [users, setUsers] = useState<RecursoUser[]>([]);
  const [roles, setRoles] = useState<RecursoRole[]>([]);
  const [activities, setActivities] = useState<WBSActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Recurso | null>(null);

  const [formData, setFormData] = useState({
    usuario_id: '',
    rol_id: '',
    wbs_id: '',
    porcentaje: '100',
    fecha_inicio: '',
    fecha_fin: '',
    horas_planeadas: '',
  });

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setError(null);
      const [r, s, u, ro, w] = await Promise.all([
        recursosService.getByProject(parseInt(id || '0')),
        recursosService.getSummary(parseInt(id || '0')),
        recursosService.getUsers(parseInt(id || '0')),
        recursosService.getRoles(parseInt(id || '0')),
        recursosService.getWBSActivities(parseInt(id || '0')),
      ]);
      setRecursos(r.data);
      setSummary(s.data);
      setUsers(u.data);
      setRoles(ro.data);
      setActivities(w.data);
    } catch (err) {
      setError('Error al cargar recursos');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingItem(null);
    setFormData({ usuario_id: '', rol_id: '', wbs_id: '', porcentaje: '100', fecha_inicio: '', fecha_fin: '', horas_planeadas: '' });
    setShowModal(true);
  };

  const openEditModal = (item: Recurso) => {
    setEditingItem(item);
    setFormData({
      usuario_id: String(item.usuario_id),
      rol_id: item.rol_id ? String(item.rol_id) : '',
      wbs_id: item.wbs_id ? String(item.wbs_id) : '',
      porcentaje: String(item.porcentaje),
      fecha_inicio: item.fecha_inicio ? item.fecha_inicio.split('T')[0] : '',
      fecha_fin: item.fecha_fin ? item.fecha_fin.split('T')[0] : '',
      horas_planeadas: String(item.horas_planeadas),
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      const data = {
        usuario_id: Number(formData.usuario_id),
        rol_id: formData.rol_id ? Number(formData.rol_id) : undefined,
        wbs_id: formData.wbs_id ? Number(formData.wbs_id) : undefined,
        porcentaje: Number(formData.porcentaje),
        fecha_inicio: formData.fecha_inicio || undefined,
        fecha_fin: formData.fecha_fin || undefined,
        horas_planeadas: Number(formData.horas_planeadas) || 0,
      };
      if (editingItem) {
        await recursosService.update(editingItem.id, data);
      } else {
        await recursosService.create(parseInt(id || '0'), data);
      }
      setShowModal(false);
      await loadData();
    } catch (err) {
      setError('Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (itemId: number) => {
    if (confirm('Eliminar esta asignacion?')) {
      try {
        await recursosService.delete(itemId);
        await loadData();
      } catch (err) {
        setError('Error al eliminar');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-200 dark:border-slate-700 border-t-primary-600"></div>
          <p className="text-sm text-slate-400 dark:text-slate-500">Cargando recursos...</p>
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
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Recursos</h1>
          <p className="text-xs text-slate-400 dark:text-slate-500">Proyecto #{id}</p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 bg-primary-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Asignar Recurso
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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <Users className="w-4 h-4 text-blue-500" />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Personas</p>
            </div>
            <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{summary.stats.total_personas || 0}</p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-primary-50 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                <UserCheck className="w-4 h-4 text-primary-500" />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Asignaciones</p>
            </div>
            <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{summary.stats.total_asignaciones || 0}</p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-amber-50 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
                <Clock className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Horas Planeadas</p>
            </div>
            <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{summary.stats.total_horas || 0}h</p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-violet-50 dark:bg-violet-900/30 rounded-lg flex items-center justify-center">
                <Percent className="w-4 h-4 text-violet-500" />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Dedicacion Prom.</p>
            </div>
            <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{Number(summary.stats.promedio_dedicacion || 0).toFixed(0)}%</p>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-700">
                <th className="text-left px-6 py-3 text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Persona</th>
                <th className="text-left px-6 py-3 text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Rol</th>
                <th className="text-left px-6 py-3 text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Actividad WBS</th>
                <th className="text-center px-6 py-3 text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Dedicacion</th>
                <th className="text-right px-6 py-3 text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Horas</th>
                <th className="text-left px-6 py-3 text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Periodo</th>
                <th className="text-right px-6 py-3 text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {recursos.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Users className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">No hay recursos asignados</p>
                  </td>
                </tr>
              ) : (
                recursos.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center text-primary-700 dark:text-primary-300 font-semibold text-sm">
                          {r.usuario_nombre?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{r.usuario_nombre}</p>
                          <p className="text-xs text-slate-400 dark:text-slate-500">{r.usuario_email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{r.rol_nombre || '-'}</span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400">
                      {r.wbs_codigo ? (
                        <span className="font-mono">{r.wbs_codigo} - {r.wbs_nombre}</span>
                      ) : (
                        <span className="text-slate-400">General</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-16 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary-500 rounded-full transition-all"
                            style={{ width: `${r.porcentaje}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 min-w-[32px]">{r.porcentaje}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium text-slate-700 dark:text-slate-200">{r.horas_planeadas}h</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                        <Calendar className="w-3 h-3" />
                        {r.fecha_inicio ? new Date(r.fecha_inicio).toLocaleDateString() : '-'}
                        <span className="text-slate-300 dark:text-slate-600">-</span>
                        {r.fecha_fin ? new Date(r.fecha_fin).toLocaleDateString() : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEditModal(r)} className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors" title="Editar">
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(r.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" title="Eliminar">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary by Role */}
      {summary && summary.byRole.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Briefcase className="w-4 h-4 text-slate-400" />
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Resumen por Rol</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {summary.byRole.map((r, i) => (
              <div key={i} className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600">
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">{r.rol}</h4>
                <div className="space-y-1 text-xs text-slate-500 dark:text-slate-400">
                  <p><span className="font-medium">{r.personas}</span> personas</p>
                  <p><span className="font-medium">{r.total_horas}h</span> totales</p>
                  <p className="text-primary-600 dark:text-primary-400 font-semibold">{formatCurrency(r.costo_total || 0)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                {editingItem ? 'Editar Asignacion' : 'Asignar Recurso'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Persona *</label>
                <select value={formData.usuario_id} onChange={(e) => setFormData({ ...formData, usuario_id: e.target.value })} required
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors">
                  <option value="">Seleccionar...</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>{u.nombre}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Rol</label>
                  <select value={formData.rol_id} onChange={(e) => setFormData({ ...formData, rol_id: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors">
                    <option value="">Sin rol</option>
                    {roles.map((r) => (
                      <option key={r.id} value={r.id}>{r.nombre}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Actividad WBS</label>
                  <select value={formData.wbs_id} onChange={(e) => setFormData({ ...formData, wbs_id: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors">
                    <option value="">General</option>
                    {activities.map((a) => (
                      <option key={a.id} value={a.id}>{a.codigo} - {a.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Dedicacion (%)</label>
                  <input type="number" value={formData.porcentaje} onChange={(e) => setFormData({ ...formData, porcentaje: e.target.value })} min="1" max="100"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Horas Planeadas</label>
                  <input type="number" value={formData.horas_planeadas} onChange={(e) => setFormData({ ...formData, horas_planeadas: e.target.value })} min="0"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Fecha Inicio</label>
                  <input type="date" value={formData.fecha_inicio} onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Fecha Fin</label>
                  <input type="date" value={formData.fecha_fin} onChange={(e) => setFormData({ ...formData, fecha_fin: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors" />
                </div>
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
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecursosPage;
