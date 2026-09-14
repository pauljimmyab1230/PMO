import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ejecucionService,
  EjecucionSummary,
  Issue,
  Entregable,
  BitacoraEntry,
  Actividad,
} from '../../services/ejecucion.service';
import {
  ArrowLeft,
  Plus,
  AlertTriangle,
  Package,
  Clock,
  BookOpen,
  Timer,
  AlertCircle,
  X,
  Save,
  Loader2,
  Edit3,
  Trash2,
  Check,
  Circle,
  ChevronRight,
  Calendar,
  User,
} from 'lucide-react';

const EjecucionPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [summary, setSummary] = useState<EjecucionSummary | null>(null);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [entregables, setEntregables] = useState<Entregable[]>([]);
  const [bitacora, setBitacora] = useState<BitacoraEntry[]>([]);
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'issues' | 'entregables' | 'bitacora' | 'actividades'>('issues');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [editingItem, setEditingItem] = useState<any>(null);

  const [issueForm, setIssueForm] = useState({ titulo: '', descripcion: '', prioridad: 'media', responsable_id: '', wbs_id: '' });
  const [entregableForm, setEntregableForm] = useState({ nombre: '', descripcion: '', wbs_id: '', fecha_entrega_planeada: '' });
  const [bitacoraForm, setBitacoraForm] = useState({ tipo: 'evento', descripcion: '', visible_sponsor: false });
  const [actividadForm, setActividadForm] = useState({ wbs_id: '', fecha: new Date().toISOString().split('T')[0], actividad_realizada: '', avance_porcentaje: '0', horas_trabajadas: '0' });
  const [statusModal, setStatusModal] = useState<{ show: boolean; type: string; item: any }>({ show: false, type: '', item: null });
  const [newStatus, setNewStatus] = useState('');
  const [statusObservaciones, setStatusObservaciones] = useState('');

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setError(null);
      const [s, i, e, b, a, u, w] = await Promise.all([
        ejecucionService.getSummary(parseInt(id || '0')),
        ejecucionService.getIssues(parseInt(id || '0')),
        ejecucionService.getEntregables(parseInt(id || '0')),
        ejecucionService.getBitacora(parseInt(id || '0')),
        ejecucionService.getActividades(parseInt(id || '0')),
        ejecucionService.getUsers(parseInt(id || '0')),
        ejecucionService.getWBSActivities(parseInt(id || '0')),
      ]);
      setSummary(s.data);
      setIssues(i.data);
      setEntregables(e.data);
      setBitacora(b.data);
      setActividades(a.data);
      setUsers(u.data);
      setActivities(w.data);
    } catch (err) {
      setError('Error al cargar ejecucion');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = (type: string) => {
    setModalType(type);
    setEditingItem(null);
    setIssueForm({ titulo: '', descripcion: '', prioridad: 'media', responsable_id: '', wbs_id: '' });
    setEntregableForm({ nombre: '', descripcion: '', wbs_id: '', fecha_entrega_planeada: '' });
    setBitacoraForm({ tipo: 'evento', descripcion: '', visible_sponsor: false });
    setActividadForm({ wbs_id: '', fecha: new Date().toISOString().split('T')[0], actividad_realizada: '', avance_porcentaje: '0', horas_trabajadas: '0' });
    setShowModal(true);
  };

  const openEditModal = (type: string, item: any) => {
    setModalType(type);
    setEditingItem(item);
    if (type === 'issue') {
      setIssueForm({ titulo: item.titulo, descripcion: item.descripcion || '', prioridad: item.prioridad, responsable_id: item.responsable_id || '', wbs_id: item.wbs_id || '' });
    } else if (type === 'entregable') {
      setEntregableForm({ nombre: item.nombre, descripcion: item.descripcion || '', wbs_id: item.wbs_id || '', fecha_entrega_planeada: item.fecha_entrega_planeada ? item.fecha_entrega_planeada.split('T')[0] : '' });
    }
    setShowModal(true);
  };

  const openStatusModal = (type: string, item: any) => {
    setStatusModal({ show: true, type, item });
    setNewStatus(item.estado);
    setStatusObservaciones('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      if (modalType === 'issue') {
        const data = { ...issueForm, prioridad: issueForm.prioridad as any, responsable_id: issueForm.responsable_id ? Number(issueForm.responsable_id) : undefined, wbs_id: issueForm.wbs_id ? Number(issueForm.wbs_id) : undefined };
        if (editingItem) await ejecucionService.updateIssue(editingItem.id, data);
        else await ejecucionService.createIssue(parseInt(id || '0'), data);
      } else if (modalType === 'entregable') {
        const data = { ...entregableForm, wbs_id: entregableForm.wbs_id ? Number(entregableForm.wbs_id) : undefined };
        if (editingItem) await ejecucionService.updateEntregable(editingItem.id, data);
        else await ejecucionService.createEntregable(parseInt(id || '0'), data);
      } else if (modalType === 'bitacora') {
        await ejecucionService.createBitacora(parseInt(id || '0'), { ...bitacoraForm, tipo: bitacoraForm.tipo as any });
      } else if (modalType === 'actividad') {
        await ejecucionService.createActividad(parseInt(id || '0'), { ...actividadForm, wbs_id: actividadForm.wbs_id ? Number(actividadForm.wbs_id) : undefined, avance_porcentaje: Number(actividadForm.avance_porcentaje), horas_trabajadas: Number(actividadForm.horas_trabajadas) });
      }
      setShowModal(false);
      await loadData();
    } catch (err) {
      setError('Error al guardar');
    }
  };

  const handleStatusChange = async () => {
    try {
      if (statusModal.type === 'issue') await ejecucionService.updateIssueStatus(statusModal.item.id, newStatus);
      else if (statusModal.type === 'entregable') await ejecucionService.updateEntregableStatus(statusModal.item.id, newStatus, statusObservaciones);
      setStatusModal({ show: false, type: '', item: null });
      await loadData();
    } catch (err) {
      setError('Error al cambiar estado');
    }
  };

  const handleDelete = async (type: string, itemId: number) => {
    if (!confirm('Eliminar este registro?')) return;
    try {
      if (type === 'issue') await ejecucionService.deleteIssue(itemId);
      else if (type === 'entregable') await ejecucionService.deleteEntregable(itemId);
      else if (type === 'bitacora') await ejecucionService.deleteBitacora(itemId);
      else if (type === 'actividad') await ejecucionService.deleteActividad(itemId);
      await loadData();
    } catch {
      setError('Error al eliminar');
    }
  };

  const getPrioridadStyles = (p: string) => {
    switch (p) {
      case 'critica': return { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-600 dark:text-red-400', border: 'border-red-200 dark:border-red-800' };
      case 'alta': return { bg: 'bg-orange-50 dark:bg-orange-900/20', text: 'text-orange-600 dark:text-orange-400', border: 'border-orange-200 dark:border-orange-800' };
      case 'media': return { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-800' };
      case 'baja': return { bg: 'bg-slate-50 dark:bg-slate-700', text: 'text-slate-500 dark:text-slate-400', border: 'border-slate-200 dark:border-slate-600' };
      default: return { bg: 'bg-slate-50 dark:bg-slate-700', text: 'text-slate-500 dark:text-slate-400', border: 'border-slate-200 dark:border-slate-600' };
    }
  };

  const getEstadoIssueStyles = (e: string) => {
    switch (e) {
      case 'abierto': return { icon: Circle, bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-600 dark:text-red-400' };
      case 'en_proceso': return { icon: Clock, bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-600 dark:text-amber-400' };
      case 'resuelto': return { icon: Check, bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-600 dark:text-emerald-400' };
      case 'cerrado': return { icon: Check, bg: 'bg-slate-100 dark:bg-slate-700', text: 'text-slate-500 dark:text-slate-400' };
      default: return { icon: Circle, bg: 'bg-slate-100 dark:bg-slate-700', text: 'text-slate-500 dark:text-slate-400' };
    }
  };

  const getEstadoEntregableStyles = (e: string) => {
    switch (e) {
      case 'pendiente': return { icon: Circle, bg: 'bg-slate-100 dark:bg-slate-700', text: 'text-slate-500 dark:text-slate-400' };
      case 'en_progreso': return { icon: Clock, bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-600 dark:text-amber-400' };
      case 'entregado': return { icon: Package, bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-400' };
      case 'aprobado': return { icon: Check, bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-600 dark:text-emerald-400' };
      case 'rechazado': return { icon: X, bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-600 dark:text-red-400' };
      default: return { icon: Circle, bg: 'bg-slate-100 dark:bg-slate-700', text: 'text-slate-500 dark:text-slate-400' };
    }
  };

  const getTipoBitacoraStyles = (t: string) => {
    switch (t) {
      case 'evento': return { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-400' };
      case 'decision': return { bg: 'bg-violet-50 dark:bg-violet-900/20', text: 'text-violet-600 dark:text-violet-400' };
      case 'acuerdo': return { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-600 dark:text-emerald-400' };
      case 'problema': return { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-600 dark:text-red-400' };
      case 'avance': return { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-600 dark:text-amber-400' };
      default: return { bg: 'bg-slate-100 dark:bg-slate-700', text: 'text-slate-500 dark:text-slate-400' };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-200 dark:border-slate-700 border-t-primary-600"></div>
          <p className="text-sm text-slate-400 dark:text-slate-500">Cargando ejecucion...</p>
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
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Ejecucion del Proyecto</h1>
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

      {/* Summary */}
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-red-50 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-red-500" />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Issues Abiertos</p>
            </div>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">{summary.issues?.abiertos || 0}</p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                <Package className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Entregables Aprobados</p>
            </div>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{summary.entregables?.aprobados || 0}</p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-amber-50 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
                <Clock className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Actividades</p>
            </div>
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{actividades.length}</p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-blue-500" />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Bitacora</p>
            </div>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{bitacora.length}</p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-violet-50 dark:bg-violet-900/30 rounded-lg flex items-center justify-center">
                <Timer className="w-4 h-4 text-violet-500" />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Horas Registradas</p>
            </div>
            <p className="text-2xl font-bold text-violet-600 dark:text-violet-400">
              {actividades.reduce((sum, a) => sum + (Number(a.horas_trabajadas) || 0), 0)}h
            </p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-700">
        <nav className="flex gap-1 -mb-px overflow-x-auto">
          {[
            { id: 'issues' as const, label: 'Issues', icon: AlertTriangle, count: issues.length },
            { id: 'entregables' as const, label: 'Entregables', icon: Package, count: entregables.length },
            { id: 'actividades' as const, label: 'Actividades', icon: Clock, count: actividades.length },
            { id: 'bitacora' as const, label: 'Bitacora', icon: BookOpen, count: bitacora.length },
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
              <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded-full">
                {tab.count}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* ISSUES TAB */}
      {activeTab === 'issues' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Issues / Problemas</h3>
            <button onClick={() => openCreateModal('issue')} className="inline-flex items-center gap-2 bg-primary-600 text-white px-3 py-2 rounded-lg text-xs font-medium hover:bg-primary-700 transition-colors shadow-sm">
              <Plus className="w-3.5 h-3.5" /> Nuevo
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700">
                  <th className="text-left px-6 py-3 text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Titulo</th>
                  <th className="text-center px-6 py-3 text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Prioridad</th>
                  <th className="text-center px-6 py-3 text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Estado</th>
                  <th className="text-left px-6 py-3 text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Responsable</th>
                  <th className="text-right px-6 py-3 text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {issues.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-12 text-center"><p className="text-sm text-slate-500 dark:text-slate-400 font-medium">No hay issues</p></td></tr>
                ) : issues.map((item) => {
                  const prioridad = getPrioridadStyles(item.prioridad);
                  const estado = getEstadoIssueStyles(item.estado);
                  return (
                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group">
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{item.titulo}</p>
                        {item.solucion && <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">✓ {item.solucion}</p>}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex px-2 py-0.5 text-[10px] font-semibold rounded-md ${prioridad.bg} ${prioridad.text} border ${prioridad.border}`}>
                          {item.prioridad}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button onClick={() => openStatusModal('issue', item)} className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-md cursor-pointer ${estado.bg} ${estado.text}`}>
                          <estado.icon className="w-3 h-3" />
                          {item.estado}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">{item.responsable_nombre || '-'}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openEditModal('issue', item)} className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"><Edit3 className="w-4 h-4" /></button>
                          <button onClick={() => handleDelete('issue', item.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ENTREGABLES TAB */}
      {activeTab === 'entregables' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Entregables</h3>
            <button onClick={() => openCreateModal('entregable')} className="inline-flex items-center gap-2 bg-primary-600 text-white px-3 py-2 rounded-lg text-xs font-medium hover:bg-primary-700 transition-colors shadow-sm">
              <Plus className="w-3.5 h-3.5" /> Nuevo
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700">
                  <th className="text-left px-6 py-3 text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Nombre</th>
                  <th className="text-center px-6 py-3 text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Estado</th>
                  <th className="text-left px-6 py-3 text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Fecha Planeada</th>
                  <th className="text-left px-6 py-3 text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Aprobado por</th>
                  <th className="text-right px-6 py-3 text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {entregables.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-12 text-center"><p className="text-sm text-slate-500 dark:text-slate-400 font-medium">No hay entregables</p></td></tr>
                ) : entregables.map((item) => {
                  const estado = getEstadoEntregableStyles(item.estado);
                  return (
                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group">
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{item.nombre}</p>
                        {item.observaciones && <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{item.observaciones}</p>}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button onClick={() => openStatusModal('entregable', item)} className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-md cursor-pointer ${estado.bg} ${estado.text}`}>
                          <estado.icon className="w-3 h-3" />
                          {item.estado}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-1"><Calendar className="w-3 h-3" />{item.fecha_entrega_planeada ? new Date(item.fecha_entrega_planeada).toLocaleDateString() : '-'}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">{item.aprobado_por_nombre || '-'}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openEditModal('entregable', item)} className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"><Edit3 className="w-4 h-4" /></button>
                          <button onClick={() => handleDelete('entregable', item.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ACTIVIDADES TAB */}
      {activeTab === 'actividades' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Registro de Actividades</h3>
            <button onClick={() => openCreateModal('actividad')} className="inline-flex items-center gap-2 bg-primary-600 text-white px-3 py-2 rounded-lg text-xs font-medium hover:bg-primary-700 transition-colors shadow-sm">
              <Plus className="w-3.5 h-3.5" /> Registrar Avance
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700">
                  <th className="text-left px-6 py-3 text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Fecha</th>
                  <th className="text-left px-6 py-3 text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Actividad</th>
                  <th className="text-left px-6 py-3 text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">WBS</th>
                  <th className="text-center px-6 py-3 text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Avance</th>
                  <th className="text-right px-6 py-3 text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Horas</th>
                  <th className="text-right px-6 py-3 text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {actividades.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-12 text-center"><p className="text-sm text-slate-500 dark:text-slate-400 font-medium">No hay registros</p></td></tr>
                ) : actividades.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group">
                    <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(item.fecha).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-200">{item.actividad_realizada}</td>
                    <td className="px-6 py-4 text-xs font-mono text-slate-500 dark:text-slate-400">{item.wbs_codigo || '-'}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-16 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div className="h-full bg-primary-500 rounded-full" style={{ width: `${Number(item.avance_porcentaje)}%` }} />
                        </div>
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{Number(item.avance_porcentaje)}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium text-slate-700 dark:text-slate-200">{item.horas_trabajadas}h</td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleDelete('actividad', item.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors opacity-0 group-hover:opacity-100 transition-opacity">
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

      {/* BITACORA TAB */}
      {activeTab === 'bitacora' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Bitacora</h3>
            <button onClick={() => openCreateModal('bitacora')} className="inline-flex items-center gap-2 bg-primary-600 text-white px-3 py-2 rounded-lg text-xs font-medium hover:bg-primary-700 transition-colors shadow-sm">
              <Plus className="w-3.5 h-3.5" /> Nueva Entrada
            </button>
          </div>
          <div className="p-4 space-y-3">
            {bitacora.length === 0 ? (
              <p className="text-center py-8 text-sm text-slate-500 dark:text-slate-400 font-medium">No hay entradas</p>
            ) : bitacora.map((item) => {
              const tipo = getTipoBitacoraStyles(item.tipo);
              return (
                <div key={item.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex px-2 py-0.5 text-[10px] font-semibold rounded-md ${tipo.bg} ${tipo.text}`}>{item.tipo}</span>
                      <span className="text-xs text-slate-400 dark:text-slate-500">{new Date(item.fecha).toLocaleString()}</span>
                      {item.visible_sponsor && (
                        <span className="inline-flex px-1.5 py-0.5 text-[10px] font-semibold rounded-md bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400">Sponsor</span>
                      )}
                    </div>
                    <button onClick={() => handleDelete('bitacora', item.id)} className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors opacity-0 group-hover:opacity-100">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-200">{item.descripcion}</p>
                  {item.autor_nombre && (
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 flex items-center gap-1">
                      <User className="w-3 h-3" /> {item.autor_nombre}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CREATE/EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                {editingItem ? 'Editar' : 'Nuevo'} {modalType === 'issue' ? 'Issue' : modalType === 'entregable' ? 'Entregable' : modalType === 'bitacora' ? 'Entrada Bitacora' : 'Actividad'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-140px)]">
              {modalType === 'issue' && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Titulo *</label>
                    <input type="text" value={issueForm.titulo} onChange={(e) => setIssueForm({ ...issueForm, titulo: e.target.value })} required
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Descripcion</label>
                    <textarea value={issueForm.descripcion} onChange={(e) => setIssueForm({ ...issueForm, descripcion: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors resize-none" rows={2} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Prioridad</label>
                      <select value={issueForm.prioridad} onChange={(e) => setIssueForm({ ...issueForm, prioridad: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors">
                        <option value="baja">Baja</option>
                        <option value="media">Media</option>
                        <option value="alta">Alta</option>
                        <option value="critica">Critica</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Responsable</label>
                      <select value={issueForm.responsable_id} onChange={(e) => setIssueForm({ ...issueForm, responsable_id: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors">
                        <option value="">Sin asignar</option>
                        {users.map((u: any) => <option key={u.id} value={u.id}>{u.nombre}</option>)}
                      </select>
                    </div>
                  </div>
                </>
              )}
              {modalType === 'entregable' && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Nombre *</label>
                    <input type="text" value={entregableForm.nombre} onChange={(e) => setEntregableForm({ ...entregableForm, nombre: e.target.value })} required
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Descripcion</label>
                    <textarea value={entregableForm.descripcion} onChange={(e) => setEntregableForm({ ...entregableForm, descripcion: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors resize-none" rows={2} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Actividad WBS</label>
                      <select value={entregableForm.wbs_id} onChange={(e) => setEntregableForm({ ...entregableForm, wbs_id: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors">
                        <option value="">Sin vincular</option>
                        {activities.map((a: any) => <option key={a.id} value={a.id}>{a.codigo}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Fecha Planeada</label>
                      <input type="date" value={entregableForm.fecha_entrega_planeada} onChange={(e) => setEntregableForm({ ...entregableForm, fecha_entrega_planeada: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors" />
                    </div>
                  </div>
                </>
              )}
              {modalType === 'bitacora' && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Tipo</label>
                    <select value={bitacoraForm.tipo} onChange={(e) => setBitacoraForm({ ...bitacoraForm, tipo: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors">
                      <option value="evento">Evento</option>
                      <option value="decision">Decision</option>
                      <option value="acuerdo">Acuerdo</option>
                      <option value="problema">Problema</option>
                      <option value="avance">Avance</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Descripcion *</label>
                    <textarea value={bitacoraForm.descripcion} onChange={(e) => setBitacoraForm({ ...bitacoraForm, descripcion: e.target.value })} required
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors resize-none" rows={3} />
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <input type="checkbox" checked={bitacoraForm.visible_sponsor} onChange={(e) => setBitacoraForm({ ...bitacoraForm, visible_sponsor: e.target.checked })}
                      className="w-4 h-4 text-primary-600 rounded border-slate-300 dark:border-slate-600 focus:ring-primary-500" />
                    <label className="text-sm text-slate-700 dark:text-slate-200">Visible para Sponsor</label>
                  </div>
                </>
              )}
              {modalType === 'actividad' && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Actividad WBS</label>
                    <select value={actividadForm.wbs_id} onChange={(e) => setActividadForm({ ...actividadForm, wbs_id: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors">
                      <option value="">Sin vincular</option>
                      {activities.map((a: any) => <option key={a.id} value={a.id}>{a.codigo} - {a.nombre}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Fecha *</label>
                    <input type="date" value={actividadForm.fecha} onChange={(e) => setActividadForm({ ...actividadForm, fecha: e.target.value })} required
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Actividad Realizada *</label>
                    <textarea value={actividadForm.actividad_realizada} onChange={(e) => setActividadForm({ ...actividadForm, actividad_realizada: e.target.value })} required
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors resize-none" rows={2} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Avance (%)</label>
                      <input type="number" value={actividadForm.avance_porcentaje} onChange={(e) => setActividadForm({ ...actividadForm, avance_porcentaje: e.target.value })} min="0" max="100"
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Horas Trabajadas</label>
                      <input type="number" value={actividadForm.horas_trabajadas} onChange={(e) => setActividadForm({ ...actividadForm, horas_trabajadas: e.target.value })} min="0" step="0.5"
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
                {editingItem ? 'Guardar' : 'Crear'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STATUS MODAL */}
      {statusModal.show && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Cambiar Estado</h2>
              <button onClick={() => setStatusModal({ show: false, type: '', item: null })} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Nuevo Estado</label>
                <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors">
                  {statusModal.type === 'issue' ? (
                    <>
                      <option value="abierto">Abierto</option>
                      <option value="en_proceso">En Proceso</option>
                      <option value="resuelto">Resuelto</option>
                      <option value="cerrado">Cerrado</option>
                    </>
                  ) : (
                    <>
                      <option value="pendiente">Pendiente</option>
                      <option value="en_progreso">En Progreso</option>
                      <option value="entregado">Entregado</option>
                      <option value="aprobado">Aprobado</option>
                      <option value="rechazado">Rechazado</option>
                    </>
                  )}
                </select>
              </div>
              {statusModal.type === 'entregable' && (
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Observaciones</label>
                  <textarea value={statusObservaciones} onChange={(e) => setStatusObservaciones(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors resize-none" rows={2} />
                </div>
              )}
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
              <button onClick={() => setStatusModal({ show: false, type: '', item: null })}
                className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors">
                Cancelar
              </button>
              <button onClick={handleStatusChange}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors shadow-sm">
                <Save className="w-4 h-4" />
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EjecucionPage;
