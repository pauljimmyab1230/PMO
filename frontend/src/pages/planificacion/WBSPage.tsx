import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { wbsService, WBSItem, WBSUser, WBSSummary } from '../../services/wbs.service';
import {
  ArrowLeft,
  Plus,
  ChevronDown,
  ChevronRight,
  FolderTree,
  Edit3,
  Trash2,
  Calendar,
  DollarSign,
  User,
  Clock,
  Target,
  AlertCircle,
  X,
  Save,
  Loader2,
  Flag,
  CheckCircle2,
  Circle,
  Pause,
  XCircle,
} from 'lucide-react';
import { formatCurrency } from '../../utils/format';

const WBSPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [items, setItems] = useState<WBSItem[]>([]);
  const [users, setUsers] = useState<WBSUser[]>([]);
  const [summary, setSummary] = useState<WBSSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<WBSItem | null>(null);
  const [parentId, setParentId] = useState<number | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set());

  const [formData, setFormData] = useState({
    codigo: '',
    nombre: '',
    descripcion: '',
    nivel: 1,
    responsable_id: '',
    fecha_inicio: '',
    fecha_fin: '',
    costo_estimado: '',
    es_hito: false,
  });

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setError(null);
      const [itemsRes, usersRes, summaryRes] = await Promise.all([
        wbsService.getByProject(parseInt(id || '0')),
        wbsService.getUsers(),
        wbsService.getSummary(parseInt(id || '0')),
      ]);
      setItems(itemsRes.data);
      setUsers(usersRes.data);
      setSummary(summaryRes.data);

      const allIds = new Set<number>();
      const collectIds = (nodes: WBSItem[]) => {
        nodes.forEach((node) => {
          allIds.add(node.id);
          if (node.children) collectIds(node.children);
        });
      };
      collectIds(itemsRes.data);
      setExpandedNodes(allIds);
    } catch (err) {
      setError('Error al cargar el WBS');
      console.error('Error loading WBS:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleNode = (nodeId: number) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const openCreateModal = (parent?: WBSItem) => {
    setEditingItem(null);
    setParentId(parent ? Number(parent.id) : null);
    setFormData({
      codigo: '',
      nombre: '',
      descripcion: '',
      nivel: parent ? Math.min((parent.nivel || 1) + 1, 4) : 1,
      responsable_id: '',
      fecha_inicio: '',
      fecha_fin: '',
      costo_estimado: '',
      es_hito: false,
    });
    setShowModal(true);
  };

  const openEditModal = (item: WBSItem) => {
    setEditingItem(item);
    setParentId(item.padre_id ? Number(item.padre_id) : null);
    setFormData({
      codigo: item.codigo || '',
      nombre: item.nombre,
      descripcion: item.descripcion || '',
      nivel: Number(item.nivel),
      responsable_id: item.responsable_id ? String(item.responsable_id) : '',
      fecha_inicio: item.fecha_inicio ? item.fecha_inicio.split('T')[0] : '',
      fecha_fin: item.fecha_fin ? item.fecha_fin.split('T')[0] : '',
      costo_estimado: item.costo_estimado ? String(item.costo_estimado) : '',
      es_hito: item.es_hito,
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
        nivel: Number(formData.nivel),
        responsable_id: formData.responsable_id ? Number(formData.responsable_id) : undefined,
        costo_estimado: formData.costo_estimado ? parseFloat(formData.costo_estimado) : 0,
      };

      if (editingItem) {
        await wbsService.update(editingItem.id, submitData);
      } else {
        await wbsService.create(parseInt(id || '0'), {
          ...submitData,
          padre_id: parentId || undefined,
        });
      }
      setShowModal(false);
      await loadData();
    } catch (err) {
      setError('Error al guardar el elemento');
      console.error('Error saving item:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (itemId: number) => {
    if (confirm('Estas seguro de eliminar este elemento?')) {
      try {
        setError(null);
        await wbsService.delete(itemId);
        await loadData();
      } catch (err: any) {
        setError(err.response?.data?.message || 'Error al eliminar el elemento');
        console.error('Error deleting item:', err);
      }
    }
  };

  const getLevelStyles = (nivel: number) => {
    switch (nivel) {
      case 1: return { bg: 'bg-violet-50 dark:bg-violet-900/20', border: 'border-violet-200 dark:border-violet-800', badge: 'bg-violet-100 dark:bg-violet-800 text-violet-700 dark:text-violet-300', bar: 'bg-violet-500' };
      case 2: return { bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-800', badge: 'bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300', bar: 'bg-blue-500' };
      case 3: return { bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-200 dark:border-emerald-800', badge: 'bg-emerald-100 dark:bg-emerald-800 text-emerald-700 dark:text-emerald-300', bar: 'bg-emerald-500' };
      case 4: return { bg: 'bg-slate-50 dark:bg-slate-700/50', border: 'border-slate-200 dark:border-slate-600', badge: 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300', bar: 'bg-slate-500' };
      default: return { bg: 'bg-slate-50 dark:bg-slate-700/50', border: 'border-slate-200 dark:border-slate-600', badge: 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300', bar: 'bg-slate-500' };
    }
  };

  const getEstadoStyles = (estado: string) => {
    switch (estado) {
      case 'completado': return { icon: CheckCircle2, bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-600 dark:text-emerald-400', label: 'Completado' };
      case 'en_progreso': return { icon: Clock, bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-600 dark:text-amber-400', label: 'En progreso' };
      case 'pendiente': return { icon: Circle, bg: 'bg-slate-100 dark:bg-slate-700', text: 'text-slate-500 dark:text-slate-400', label: 'Pendiente' };
      case 'cancelado': return { icon: XCircle, bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-600 dark:text-red-400', label: 'Cancelado' };
      default: return { icon: Circle, bg: 'bg-slate-100 dark:bg-slate-700', text: 'text-slate-500 dark:text-slate-400', label: estado };
    }
  };

  const renderTreeNode = (item: WBSItem, level: number = 0) => {
    const nodeId = Number(item.id);
    const isExpanded = expandedNodes.has(nodeId);
    const hasChildren = item.children && item.children.length > 0;
    const styles = getLevelStyles(item.nivel);
    const estado = getEstadoStyles(item.estado);

    return (
      <div key={nodeId} className={`${level > 0 ? 'ml-5 border-l-2 border-slate-200 dark:border-slate-700 pl-4' : ''}`}>
        <div className={`p-3 mb-2 rounded-xl border ${styles.border} ${styles.bg} hover:shadow-sm transition-all group`}>
          <div className="flex items-start">
            {/* Expand/Collapse */}
            <button
              onClick={() => toggleNode(nodeId)}
              className="mt-0.5 w-5 h-5 flex items-center justify-center mr-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              {hasChildren ? (
                isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
              ) : (
                <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600" />
              )}
            </button>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-md ${styles.badge}`}>
                  Nivel {item.nivel}
                </span>
                {item.codigo && (
                  <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
                    {item.codigo}
                  </span>
                )}
                {item.es_hito && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-semibold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded">
                    <Flag className="w-2.5 h-2.5" />
                    Hito
                  </span>
                )}
              </div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                {item.nombre}
              </p>

              {/* Meta info */}
              <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500 dark:text-slate-400">
                {item.responsable_nombre && (
                  <span className="inline-flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {item.responsable_nombre}
                  </span>
                )}
                {item.fecha_inicio && item.fecha_fin && (
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(item.fecha_inicio).toLocaleDateString()} - {new Date(item.fecha_fin).toLocaleDateString()}
                  </span>
                )}
                {item.duracion_dias && (
                  <span className="inline-flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {item.duracion_dias} dias
                  </span>
                )}
                {item.costo_estimado > 0 && (
                  <span className="inline-flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />
                    ${formatCurrency(item.costo_estimado)}
                  </span>
                )}
              </div>

              {/* Progress & Status */}
              <div className="mt-2 flex items-center gap-3">
                <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${styles.bar}`}
                    style={{ width: `${Number(item.avance) || 0}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 min-w-[32px]">
                  {Number(item.avance) || 0}%
                </span>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-md ${estado.bg} ${estado.text}`}>
                  <estado.icon className="w-3 h-3" />
                  {estado.label}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 ml-3 opacity-0 group-hover:opacity-100 transition-opacity">
              {item.nivel < 4 && (
                <button
                  onClick={() => openCreateModal(item)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                  title="Agregar hijo"
                >
                  <Plus className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => openEditModal(item)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                title="Editar"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              {!hasChildren && (
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  title="Eliminar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Children */}
        {isExpanded && hasChildren && (
          <div>{item.children!.map((child) => renderTreeNode(child, level + 1))}</div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-200 dark:border-slate-700 border-t-primary-600"></div>
          <p className="text-sm text-slate-400 dark:text-slate-500">Cargando WBS...</p>
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
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">
            Estructura de Desglose (WBS)
          </h1>
          <p className="text-xs text-slate-400 dark:text-slate-500">Proyecto #{id}</p>
        </div>
        <button
          onClick={() => openCreateModal()}
          className="inline-flex items-center gap-2 bg-primary-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Nuevo Elemento
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

      {/* Summary Cards */}
      {summary.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {summary.map((s) => {
            const styles = getLevelStyles(s.nivel);
            return (
              <div key={s.nivel} className={`p-4 rounded-xl border ${styles.border} ${styles.bg}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-md ${styles.badge}`}>
                    Nivel {s.nivel}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-slate-500 dark:text-slate-400">Total</p>
                    <p className="text-lg font-bold text-slate-700 dark:text-slate-200">{s.total}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 dark:text-slate-400">Avance</p>
                    <p className="text-lg font-bold text-slate-700 dark:text-slate-200">{s.avance_promedio.toFixed(0)}%</p>
                  </div>
                  <div>
                    <p className="text-slate-500 dark:text-slate-400">Completados</p>
                    <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">{s.completados}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 dark:text-slate-400">En progreso</p>
                    <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">{s.en_progreso}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Legend */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
        <div className="flex items-center gap-2 mb-3">
          <FolderTree className="w-4 h-4 text-slate-400" />
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Niveles del WBS</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { nivel: 1, label: 'Proyecto', color: 'violet' },
            { nivel: 2, label: 'Entregables', color: 'blue' },
            { nivel: 3, label: 'Paquetes de Trabajo', color: 'emerald' },
            { nivel: 4, label: 'Actividades', color: 'slate' },
          ].map((l) => {
            const styles = getLevelStyles(l.nivel);
            return (
              <div key={l.nivel} className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${styles.bg} border ${styles.border}`}>
                <span className={`text-xs font-bold ${styles.badge.split(' ').pop()}`}>Nivel {l.nivel}</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">{l.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tree */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
        {items.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-3">
              <FolderTree className="w-6 h-6 text-slate-400 dark:text-slate-500" />
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
              No hay elementos en el WBS
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              Comienza agregando el primer elemento
            </p>
            <button
              onClick={() => openCreateModal()}
              className="inline-flex items-center gap-1.5 mt-4 text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
            >
              <Plus className="w-4 h-4" />
              Crear primer elemento
            </button>
          </div>
        ) : (
          <div className="space-y-1">{items.map((item) => renderTreeNode(item))}</div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                {editingItem ? 'Editar Elemento' : 'Nuevo Elemento'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                    Codigo *
                  </label>
                  <input
                    type="text"
                    value={formData.codigo}
                    onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
                    placeholder="Ej: 1.1, 2.1"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                    Nivel *
                  </label>
                  <select
                    value={formData.nivel}
                    onChange={(e) => setFormData({ ...formData, nivel: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
                    disabled={!!editingItem}
                  >
                    <option value={1}>Nivel 1 - Proyecto</option>
                    <option value={2}>Nivel 2 - Entregable</option>
                    <option value={3}>Nivel 3 - Paquete de Trabajo</option>
                    <option value={4}>Nivel 4 - Actividad</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                  Descripcion
                </label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors resize-none"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                    Responsable
                  </label>
                  <select
                    value={formData.responsable_id}
                    onChange={(e) => setFormData({ ...formData, responsable_id: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
                  >
                    <option value="">Sin asignar</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>{user.nombre}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                    Costo Estimado ($)
                  </label>
                  <input
                    type="number"
                    value={formData.costo_estimado}
                    onChange={(e) => setFormData({ ...formData, costo_estimado: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                    Fecha Inicio
                  </label>
                  <input
                    type="date"
                    value={formData.fecha_inicio}
                    onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                    Fecha Fin
                  </label>
                  <input
                    type="date"
                    value={formData.fecha_fin}
                    onChange={(e) => setFormData({ ...formData, fecha_fin: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                <input
                  type="checkbox"
                  id="es_hito"
                  checked={formData.es_hito}
                  onChange={(e) => setFormData({ ...formData, es_hito: e.target.checked })}
                  className="w-4 h-4 text-primary-600 rounded border-slate-300 dark:border-slate-600 focus:ring-primary-500"
                />
                <label htmlFor="es_hito" className="text-sm text-slate-700 dark:text-slate-200">
                  Marcar como Hito
                </label>
              </div>
            </form>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                disabled={saving}
                className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={saving}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 shadow-sm"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {saving ? 'Guardando...' : editingItem ? 'Guardar Cambios' : 'Crear Elemento'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WBSPage;
