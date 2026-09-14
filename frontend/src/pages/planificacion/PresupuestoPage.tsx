import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  presupuestoService,
  PresupuestoItem,
  PresupuestoSummary,
  RealCost,
  WBSActivity,
} from '../../services/presupuesto.service';
import {
  ArrowLeft,
  Plus,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Wallet,
  AlertCircle,
  X,
  Save,
  Loader2,
  Edit3,
  Trash2,
  Receipt,
  FileText,
} from 'lucide-react';
import { formatCurrency } from '../../utils/format';

const PresupuestoPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [items, setItems] = useState<PresupuestoItem[]>([]);
  const [summary, setSummary] = useState<PresupuestoSummary | null>(null);
  const [realCosts, setRealCosts] = useState<RealCost[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [wbsActivities, setWbsActivities] = useState<WBSActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'presupuesto' | 'gastos'>('presupuesto');
  const [showModal, setShowModal] = useState(false);
  const [showCostModal, setShowCostModal] = useState(false);
  const [editingItem, setEditingItem] = useState<PresupuestoItem | null>(null);

  const [formData, setFormData] = useState({
    categoria_id: '',
    wbs_id: '',
    descripcion: '',
    cantidad: '',
    unidad: 'unidad',
    costo_unitario: '',
    monto_aprobado: '',
  });

  const [costData, setCostData] = useState({
    presupuesto_id: '',
    fecha: new Date().toISOString().split('T')[0],
    monto: '',
    descripcion: '',
    comprobante: '',
  });

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setError(null);
      const [itemsRes, summaryRes, realCostsRes, categoriesRes, wbsRes] = await Promise.all([
        presupuestoService.getByProject(parseInt(id || '0')),
        presupuestoService.getSummary(parseInt(id || '0')),
        presupuestoService.getRealCosts(parseInt(id || '0')),
        presupuestoService.getCategories(parseInt(id || '0')),
        presupuestoService.getWBSActivities(parseInt(id || '0')),
      ]);
      setItems(itemsRes.data);
      setSummary(summaryRes.data);
      setRealCosts(realCostsRes.data);
      setCategories(categoriesRes.data);
      setWbsActivities(wbsRes.data);
    } catch (err) {
      setError('Error al cargar el presupuesto');
      console.error('Error loading presupuesto:', err);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingItem(null);
    setFormData({
      categoria_id: '',
      wbs_id: '',
      descripcion: '',
      cantidad: '',
      unidad: 'unidad',
      costo_unitario: '',
      monto_aprobado: '',
    });
    setShowModal(true);
  };

  const openEditModal = (item: PresupuestoItem) => {
    setEditingItem(item);
    setFormData({
      categoria_id: String(item.categoria_id),
      wbs_id: item.wbs_id ? String(item.wbs_id) : '',
      descripcion: item.descripcion,
      cantidad: String(item.cantidad),
      unidad: item.unidad || 'unidad',
      costo_unitario: String(item.costo_unitario),
      monto_aprobado: String(item.monto_aprobado),
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);

      const submitData = {
        categoria_id: Number(formData.categoria_id),
        wbs_id: formData.wbs_id ? Number(formData.wbs_id) : undefined,
        descripcion: formData.descripcion,
        cantidad: Number(formData.cantidad) || 0,
        unidad: formData.unidad,
        costo_unitario: Number(formData.costo_unitario) || 0,
        monto_aprobado: Number(formData.monto_aprobado) || 0,
      };

      if (editingItem) {
        await presupuestoService.update(editingItem.id, submitData);
      } else {
        await presupuestoService.create(parseInt(id || '0'), submitData);
      }
      setShowModal(false);
      await loadData();
    } catch (err) {
      setError('Error al guardar el elemento');
      console.error('Error saving:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (itemId: number) => {
    if (confirm('Estas seguro de eliminar este elemento?')) {
      try {
        await presupuestoService.delete(itemId);
        await loadData();
      } catch (err) {
        setError('Error al eliminar');
      }
    }
  };

  const handleAddCost = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await presupuestoService.addRealCost(parseInt(id || '0'), {
        presupuesto_id: costData.presupuesto_id ? Number(costData.presupuesto_id) : undefined,
        fecha: costData.fecha,
        monto: Number(costData.monto),
        descripcion: costData.descripcion,
        comprobante: costData.comprobante,
      });
      setShowCostModal(false);
      await loadData();
    } catch (err) {
      setError('Error al registrar gasto');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCost = async (costId: number) => {
    if (confirm('Estas seguro de eliminar este gasto?')) {
      try {
        await presupuestoService.deleteRealCost(costId);
        await loadData();
      } catch (err) {
        setError('Error al eliminar gasto');
      }
    }
  };

  const fmt = (amount: number) => formatCurrency(amount);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-200 dark:border-slate-700 border-t-primary-600"></div>
          <p className="text-sm text-slate-400 dark:text-slate-500">Cargando presupuesto...</p>
        </div>
      </div>
    );
  }

  const balance = (summary?.projectBudget || 0) - (summary?.realCosts.total_real || 0);

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
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Presupuesto</h1>
          <p className="text-xs text-slate-400 dark:text-slate-500">Proyecto #{id}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setShowCostModal(true); setCostData({ ...costData, presupuesto_id: '' }); }}
            className="inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Registrar Gasto
          </button>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 bg-primary-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Nuevo Item
          </button>
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

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <Wallet className="w-4 h-4 text-blue-500" />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Presupuesto Aprobado</p>
            </div>
            <p className="text-xl font-bold text-slate-800 dark:text-slate-100">{fmt(summary.projectBudget)}</p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-primary-50 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-primary-500" />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Total Estimado</p>
            </div>
            <p className="text-xl font-bold text-primary-600 dark:text-primary-400">{fmt(summary.totals.total_estimado)}</p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-amber-50 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
                <TrendingDown className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Gasto Real</p>
            </div>
            <p className="text-xl font-bold text-amber-600 dark:text-amber-400">{fmt(summary.realCosts.total_real)}</p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${balance >= 0 ? 'bg-emerald-50 dark:bg-emerald-900/30' : 'bg-red-50 dark:bg-red-900/30'}`}>
                <TrendingUp className={`w-4 h-4 ${balance >= 0 ? 'text-emerald-500' : 'text-red-500'}`} />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Saldo</p>
            </div>
            <p className={`text-xl font-bold ${balance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
              {fmt(balance)}
            </p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-700">
        <nav className="flex gap-1 -mb-px">
          {[
            { id: 'presupuesto' as const, label: 'Presupuesto', count: items.length },
            { id: 'gastos' as const, label: 'Gastos Reales', count: realCosts.length },
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
              {tab.id === 'presupuesto' ? <FileText className="w-4 h-4" /> : <Receipt className="w-4 h-4" />}
              {tab.label}
              <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded-full">
                {tab.count}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Presupuesto Tab */}
      {activeTab === 'presupuesto' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700">
                  <th className="text-left px-6 py-3 text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Categoria</th>
                  <th className="text-left px-6 py-3 text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Descripcion</th>
                  <th className="text-left px-6 py-3 text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">WBS</th>
                  <th className="text-right px-6 py-3 text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Cant.</th>
                  <th className="text-right px-6 py-3 text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Costo Unit.</th>
                  <th className="text-right px-6 py-3 text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total</th>
                  <th className="text-right px-6 py-3 text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-3">
                        <DollarSign className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">No hay items en el presupuesto</p>
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group">
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-0.5 text-[10px] font-semibold rounded-md ${
                          item.categoria_tipo === 'capex'
                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 ring-1 ring-inset ring-blue-200 dark:ring-blue-800'
                            : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 ring-1 ring-inset ring-emerald-200 dark:ring-emerald-800'
                        }`}>
                          {item.categoria_nombre}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-200">{item.descripcion}</td>
                      <td className="px-6 py-4 text-xs font-mono text-slate-500 dark:text-slate-400">{item.wbs_codigo || '-'}</td>
                      <td className="px-6 py-4 text-sm text-right text-slate-600 dark:text-slate-300">{item.cantidad}</td>
                      <td className="px-6 py-4 text-sm text-right text-slate-600 dark:text-slate-300">{fmt(item.costo_unitario)}</td>
                      <td className="px-6 py-4 text-sm text-right font-semibold text-slate-700 dark:text-slate-200">{fmt(item.costo_total)}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openEditModal(item)} className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors" title="Editar">
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" title="Eliminar">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              {items.length > 0 && (
                <tfoot className="border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                  <tr>
                    <td colSpan={5} className="px-6 py-3 text-right text-sm font-semibold text-slate-600 dark:text-slate-400">Total:</td>
                    <td className="px-6 py-3 text-right text-sm font-bold text-slate-800 dark:text-slate-100">{fmt(summary?.totals.total_estimado || 0)}</td>
                    <td></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      )}

      {/* Gastos Tab */}
      {activeTab === 'gastos' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700">
                  <th className="text-left px-6 py-3 text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Fecha</th>
                  <th className="text-left px-6 py-3 text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Descripcion</th>
                  <th className="text-left px-6 py-3 text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Categoria</th>
                  <th className="text-left px-6 py-3 text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Comprobante</th>
                  <th className="text-right px-6 py-3 text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Monto</th>
                  <th className="text-right px-6 py-3 text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {realCosts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Receipt className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">No hay gastos registrados</p>
                    </td>
                  </tr>
                ) : (
                  realCosts.map((cost) => (
                    <tr key={cost.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group">
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                        {new Date(cost.fecha).toLocaleDateString('es-ES')}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-200">{cost.descripcion}</td>
                      <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400">{cost.categoria_nombre || '-'}</td>
                      <td className="px-6 py-4 text-xs font-mono text-slate-500 dark:text-slate-400">{cost.comprobante || '-'}</td>
                      <td className="px-6 py-4 text-sm text-right font-semibold text-red-600 dark:text-red-400">-{fmt(cost.monto)}</td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => handleDeleteCost(cost.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors opacity-0 group-hover:opacity-100 transition-opacity" title="Eliminar">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              {realCosts.length > 0 && (
                <tfoot className="border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                  <tr>
                    <td colSpan={4} className="px-6 py-3 text-right text-sm font-semibold text-slate-600 dark:text-slate-400">Total Gastos:</td>
                    <td className="px-6 py-3 text-right text-sm font-bold text-red-600 dark:text-red-400">{fmt(summary?.realCosts.total_real || 0)}</td>
                    <td></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      )}

      {/* Modal Presupuesto */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                {editingItem ? 'Editar Item' : 'Nuevo Item de Presupuesto'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Categoria *</label>
                <select value={formData.categoria_id} onChange={(e) => setFormData({ ...formData, categoria_id: e.target.value })} required
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors">
                  <option value="">Seleccionar...</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.nombre} ({cat.tipo})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Descripcion *</label>
                <input type="text" value={formData.descripcion} onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })} required
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors" />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Actividad WBS</label>
                <select value={formData.wbs_id} onChange={(e) => setFormData({ ...formData, wbs_id: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors">
                  <option value="">Sin vincular</option>
                  {wbsActivities.map((act) => (
                    <option key={act.id} value={act.id}>{act.codigo} - {act.nombre}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Cantidad</label>
                  <input type="number" value={formData.cantidad} onChange={(e) => setFormData({ ...formData, cantidad: e.target.value })} min="0"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Unidad</label>
                  <select value={formData.unidad} onChange={(e) => setFormData({ ...formData, unidad: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors">
                    <option value="unidad">Unidad</option>
                    <option value="hora">Hora</option>
                    <option value="dia">Dia</option>
                    <option value="mes">Mes</option>
                    <option value="kg">Kg</option>
                    <option value="m">Metro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Costo Unit.</label>
                  <input type="number" value={formData.costo_unitario} onChange={(e) => setFormData({ ...formData, costo_unitario: e.target.value })} min="0" step="0.01"
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
                {saving ? 'Guardando...' : editingItem ? 'Guardar' : 'Crear'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Gasto Real */}
      {showCostModal && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Registrar Gasto Real</h2>
              <button onClick={() => setShowCostModal(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddCost} className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Item de Presupuesto</label>
                <select value={costData.presupuesto_id} onChange={(e) => setCostData({ ...costData, presupuesto_id: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors">
                  <option value="">Gasto general</option>
                  {items.map((item) => (
                    <option key={item.id} value={item.id}>{item.descripcion}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Fecha *</label>
                  <input type="date" value={costData.fecha} onChange={(e) => setCostData({ ...costData, fecha: e.target.value })} required
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Monto *</label>
                  <input type="number" value={costData.monto} onChange={(e) => setCostData({ ...costData, monto: e.target.value })} min="0.01" step="0.01" required
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Descripcion *</label>
                <input type="text" value={costData.descripcion} onChange={(e) => setCostData({ ...costData, descripcion: e.target.value })} required
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors" />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">No. Comprobante</label>
                <input type="text" value={costData.comprobante} onChange={(e) => setCostData({ ...costData, comprobante: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors" />
              </div>
            </form>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
              <button type="button" onClick={() => setShowCostModal(false)} disabled={saving}
                className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50">
                Cancelar
              </button>
              <button type="submit" onClick={handleAddCost} disabled={saving}
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 shadow-sm">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? 'Registrando...' : 'Registrar Gasto'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PresupuestoPage;
