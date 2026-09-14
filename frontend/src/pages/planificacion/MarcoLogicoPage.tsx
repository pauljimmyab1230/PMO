import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  marcoLogicoService,
  MarcoLogicoItem,
  MarcoLogicoLevel,
} from '../../services/marco-logico.service';
import {
  ArrowLeft,
  Plus,
  ChevronDown,
  ChevronRight,
  Target,
  Edit3,
  Trash2,
  FolderTree,
  AlertCircle,
  X,
  Save,
  Loader2,
} from 'lucide-react';

const MarcoLogicoPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [items, setItems] = useState<MarcoLogicoItem[]>([]);
  const [levels, setLevels] = useState<MarcoLogicoLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MarcoLogicoItem | null>(null);
  const [parentId, setParentId] = useState<number | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set());

  const [formData, setFormData] = useState({
    nivel_id: 1,
    codigo: '',
    descripcion: '',
    indicador: '',
    meta: '',
    metodo_verificacion: '',
    supuestos: '',
  });

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setError(null);
      const [itemsRes, levelsRes] = await Promise.all([
        marcoLogicoService.getByProject(parseInt(id || '0')),
        marcoLogicoService.getLevels(),
      ]);
      setItems(itemsRes.data);
      setLevels(levelsRes.data);

      const allIds = new Set<number>();
      const collectIds = (nodes: MarcoLogicoItem[]) => {
        nodes.forEach((node) => {
          allIds.add(node.id);
          if (node.children) collectIds(node.children);
        });
      };
      collectIds(itemsRes.data);
      setExpandedNodes(allIds);
    } catch (err) {
      setError('Error al cargar el marco logico');
      console.error('Error loading marco logico:', err);
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

  const openCreateModal = (parent?: MarcoLogicoItem) => {
    setEditingItem(null);
    setParentId(parent ? Number(parent.id) : null);
    setFormData({
      nivel_id: parent ? Math.min((Number(parent.nivel_numero) || 1) + 1, 4) : 1,
      codigo: '',
      descripcion: '',
      indicador: '',
      meta: '',
      metodo_verificacion: '',
      supuestos: '',
    });
    setShowModal(true);
  };

  const openEditModal = (item: MarcoLogicoItem) => {
    setEditingItem(item);
    setParentId(item.padre_id ? Number(item.padre_id) : null);
    setFormData({
      nivel_id: Number(item.nivel_id),
      codigo: item.codigo || '',
      descripcion: item.descripcion,
      indicador: item.indicador || '',
      meta: item.meta || '',
      metodo_verificacion: item.metodo_verificacion || '',
      supuestos: item.supuestos || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      if (editingItem) {
        await marcoLogicoService.update(editingItem.id, {
          ...formData,
          padre_id: editingItem.padre_id,
          orden: editingItem.orden,
        });
      } else {
        await marcoLogicoService.create(parseInt(id || '0'), {
          ...formData,
          padre_id: parentId || undefined,
          orden: 0,
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
        await marcoLogicoService.delete(itemId);
        await loadData();
      } catch (err) {
        setError('Error al eliminar el elemento');
        console.error('Error deleting item:', err);
      }
    }
  };

  const getLevelName = (nivelNumero?: number) => {
    const level = levels.find((l) => l.nivel_numero === nivelNumero);
    return level?.nombre || '';
  };

  const getLevelStyles = (nivelNumero?: number | string) => {
    const num = Number(nivelNumero);
    switch (num) {
      case 1: return { bg: 'bg-violet-50 dark:bg-violet-900/20', border: 'border-violet-200 dark:border-violet-800', badge: 'bg-violet-100 dark:bg-violet-800 text-violet-700 dark:text-violet-300', text: 'text-violet-700 dark:text-violet-300' };
      case 2: return { bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-800', badge: 'bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300', text: 'text-blue-700 dark:text-blue-300' };
      case 3: return { bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-200 dark:border-emerald-800', badge: 'bg-emerald-100 dark:bg-emerald-800 text-emerald-700 dark:text-emerald-300', text: 'text-emerald-700 dark:text-emerald-300' };
      case 4: return { bg: 'bg-slate-50 dark:bg-slate-700/50', border: 'border-slate-200 dark:border-slate-600', badge: 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300', text: 'text-slate-600 dark:text-slate-400' };
      default: return { bg: 'bg-slate-50 dark:bg-slate-700/50', border: 'border-slate-200 dark:border-slate-600', badge: 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300', text: 'text-slate-600 dark:text-slate-400' };
    }
  };

  const renderTreeNode = (item: MarcoLogicoItem, level: number = 0) => {
    const nodeId = Number(item.id);
    const isExpanded = expandedNodes.has(nodeId);
    const hasChildren = item.children && item.children.length > 0;
    const nivelNum = Number(item.nivel_numero);
    const styles = getLevelStyles(nivelNum);

    return (
      <div key={nodeId} className={`${level > 0 ? 'ml-5 border-l-2 border-slate-200 dark:border-slate-700 pl-4' : ''}`}>
        <div className={`flex items-start p-3 mb-2 rounded-xl border ${styles.border} ${styles.bg} hover:shadow-sm transition-all group`}>
          {/* Expand/Collapse */}
          <button
            onClick={() => toggleNode(nodeId)}
            className="mt-0.5 w-5 h-5 flex items-center justify-center mr-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            {hasChildren ? (
              isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )
            ) : (
              <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600" />
            )}
          </button>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-md ${styles.badge}`}>
                {getLevelName(nivelNum)}
              </span>
              {item.codigo && (
                <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
                  {item.codigo}
                </span>
              )}
            </div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
              {item.descripcion}
            </p>

            {/* Details */}
            {(item.indicador || item.meta) && (
              <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500 dark:text-slate-400">
                {item.indicador && (
                  <span className="flex items-center gap-1">
                    <span className="font-medium">Indicador:</span> {item.indicador}
                  </span>
                )}
                {item.meta && (
                  <span className="flex items-center gap-1">
                    <span className="font-medium">Meta:</span> {item.meta}
                  </span>
                )}
              </div>
            )}

            {/* Progress */}
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-500 rounded-full transition-all"
                  style={{ width: `${Number(item.avance_porcentaje) || 0}%` }}
                />
              </div>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 min-w-[32px]">
                {Number(item.avance_porcentaje) || 0}%
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 ml-3 opacity-0 group-hover:opacity-100 transition-opacity">
            {nivelNum !== 4 && (
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
          <p className="text-sm text-slate-400 dark:text-slate-500">Cargando marco logico...</p>
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
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Marco Logico</h1>
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

      {/* Legend */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
        <div className="flex items-center gap-2 mb-3">
          <FolderTree className="w-4 h-4 text-slate-400" />
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Niveles</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {levels.map((level) => {
            const styles = getLevelStyles(level.nivel_numero);
            return (
              <div key={level.id} className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${styles.bg} border ${styles.border}`}>
                <span className={`text-xs font-bold ${styles.text}`}>Nivel {level.nivel_numero}</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">{level.nombre}</span>
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
              <Target className="w-6 h-6 text-slate-400 dark:text-slate-500" />
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
              No hay elementos en el marco logico
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
                    Nivel *
                  </label>
                  <select
                    value={formData.nivel_id}
                    onChange={(e) => setFormData({ ...formData, nivel_id: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
                    disabled={!!editingItem}
                  >
                    {levels.map((level) => (
                      <option key={level.id} value={level.id}>
                        Nivel {level.nivel_numero} - {level.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                    Codigo
                  </label>
                  <input
                    type="text"
                    value={formData.codigo}
                    onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
                    placeholder="Ej: 1.1, 2.1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                  Descripcion *
                </label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors resize-none"
                  rows={2}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                    Indicador
                  </label>
                  <input
                    type="text"
                    value={formData.indicador}
                    onChange={(e) => setFormData({ ...formData, indicador: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
                    placeholder="Como se mide?"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                    Meta
                  </label>
                  <input
                    type="text"
                    value={formData.meta}
                    onChange={(e) => setFormData({ ...formData, meta: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
                    placeholder="Cuanto se quiere lograr?"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                  Metodo de Verificacion
                </label>
                <input
                  type="text"
                  value={formData.metodo_verificacion}
                  onChange={(e) => setFormData({ ...formData, metodo_verificacion: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
                  placeholder="Donde se verifica?"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                  Supuestos
                </label>
                <textarea
                  value={formData.supuestos}
                  onChange={(e) => setFormData({ ...formData, supuestos: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors resize-none"
                  rows={2}
                  placeholder="Factores externos que afectan"
                />
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

export default MarcoLogicoPage;
