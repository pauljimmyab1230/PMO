import React, { useEffect, useState } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import {
  cierreService,
  CierreProyecto,
  Leccion,
  Transferencia,
  CierreFinanciero,
} from '../../services/cierre.service';
import {
  ArrowLeft,
  Plus,
  CheckCircle2,
  BookOpen,
  ArrowRightLeft,
  DollarSign,
  AlertCircle,
  X,
  Save,
  Loader2,
  Trash2,
  Check,
  Square,
  CheckSquare,
  Calendar,
  User,
  Building2,
  TrendingUp,
  Edit3,
} from 'lucide-react';
import { formatCurrency } from '../../utils/format';

const CierrePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const [cierre, setCierre] = useState<CierreProyecto | null>(null);
  const [lecciones, setLecciones] = useState<Leccion[]>([]);
  const [transferencias, setTransferencias] = useState<Transferencia[]>([]);
  const [cierreFinanciero, setCierreFinanciero] = useState<CierreFinanciero | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [areas, setAreas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'checklist' | 'lecciones' | 'transferencias' | 'financiero'>(
    (searchParams.get('tab') as any) || 'checklist'
  );
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');

  const [checklistForm, setChecklistForm] = useState({
    alcance_completado: false, documentacion_entregada: false, contratos_cerrados: false,
    activos_transferidos: false, lecciones_registradas: false, motivo_cierre: 'exitoso', observaciones: '',
  });
  const [leccionForm, setLeccionForm] = useState({ categoria: 'que_fue_bien', titulo: '', descripcion: '', recomendacion: '' });
  const [editingLeccion, setEditingLeccion] = useState<any>(null);
  const [transferForm, setTransferForm] = useState({ activo: '', descripcion: '', area_destino: '', responsable: '' });
  const [financieroForm, setFinancieroForm] = useState({
    presupuesto_total: '', gasto_total: '', ahorro_generado: '', sobrecosto: '',
    contratos_cerrados: '', pagos_pendientes: '', balance_final: '',
  });

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setError(null);
      const [c, l, t, f, u, a] = await Promise.all([
        cierreService.getCierre(parseInt(id || '0')),
        cierreService.getLecciones(parseInt(id || '0')),
        cierreService.getTransferencias(parseInt(id || '0')),
        cierreService.getCierreFinanciero(parseInt(id || '0')),
        cierreService.getUsers(parseInt(id || '0')),
        cierreService.getAreas(parseInt(id || '0')),
      ]);
      if (c.data) {
        setCierre(c.data);
        setChecklistForm({
          alcance_completado: Boolean(c.data.alcance_completado),
          documentacion_entregada: Boolean(c.data.documentacion_entregada),
          contratos_cerrados: Boolean(c.data.contratos_cerrados),
          activos_transferidos: Boolean(c.data.activos_transferidos),
          lecciones_registradas: Boolean(c.data.lecciones_registradas),
          motivo_cierre: c.data.motivo_cierre || 'exitoso',
          observaciones: c.data.observaciones || '',
        });
      }
      setLecciones(l.data);
      setTransferencias(t.data);
      if (f.data) {
        setCierreFinanciero(f.data);
        setFinancieroForm({
          presupuesto_total: String(f.data.presupuesto_total || ''),
          gasto_total: String(f.data.gasto_total || ''),
          ahorro_generado: String(f.data.ahorro_generado || ''),
          sobrecosto: String(f.data.sobrecosto || ''),
          contratos_cerrados: String(f.data.contratos_cerrados || ''),
          pagos_pendientes: String(f.data.pagos_pendientes || ''),
          balance_final: f.data.balance_final || '',
        });
      }
      setUsers(u.data);
      setAreas(a.data);
    } catch (err) {
      setError('Error al cargar cierre');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveChecklist = async () => {
    try {
      await cierreService.saveCierre(parseInt(id || '0'), checklistForm);
      await loadData();
    } catch {
      setError('Error al guardar');
    }
  };

  const openModal = (type: string) => {
    setModalType(type);
    setEditingLeccion(null);
    setLeccionForm({ categoria: 'que_fue_bien', titulo: '', descripcion: '', recomendacion: '' });
    setTransferForm({ activo: '', descripcion: '', area_destino: '', responsable: '' });
    setShowModal(true);
  };

  const openEditLeccionModal = (leccion: any) => {
    setModalType('leccion');
    setEditingLeccion(leccion);
    setLeccionForm({
      categoria: leccion.categoria,
      titulo: leccion.titulo,
      descripcion: leccion.descripcion,
      recomendacion: leccion.recomendacion || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (modalType === 'leccion') {
        if (editingLeccion) {
          await cierreService.updateLeccion(editingLeccion.id, leccionForm as any);
        } else {
          await cierreService.createLeccion(parseInt(id || '0'), leccionForm as any);
        }
      } else if (modalType === 'transferencia') {
        await cierreService.createTransferencia(parseInt(id || '0'), {
          ...transferForm,
          area_destino: transferForm.area_destino ? Number(transferForm.area_destino) : undefined,
          responsable: transferForm.responsable ? Number(transferForm.responsable) : undefined,
        });
      }
      setShowModal(false);
      await loadData();
    } catch {
      setError('Error al guardar');
    }
  };

  const handleDelete = async (type: string, itemId: number) => {
    if (!confirm('Eliminar este registro?')) return;
    try {
      if (type === 'leccion') await cierreService.deleteLeccion(itemId);
      else if (type === 'transferencia') await cierreService.deleteTransferencia(itemId);
      await loadData();
    } catch {
      setError('Error al eliminar');
    }
  };

  const handleTransferStatus = async (itemId: number, estado: string) => {
    try {
      await cierreService.updateTransferenciaStatus(itemId, estado);
      await loadData();
    } catch {
      setError('Error al actualizar');
    }
  };

  const handleSaveFinanciero = async () => {
    try {
      await cierreService.saveCierreFinanciero(parseInt(id || '0'), financieroForm as any);
      await loadData();
    } catch {
      setError('Error al guardar');
    }
  };

  const fmt = (n: number) => formatCurrency(n);

  const getLeccionStyles = (cat: string) => {
    switch (cat) {
      case 'que_fue_bien': return { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-600 dark:text-emerald-400', icon: Check, label: 'Que salio bien' };
      case 'que_fue_malo': return { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-600 dark:text-red-400', icon: X, label: 'Que salio mal' };
      case 'mejora_sugerida': return { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-400', icon: TrendingUp, label: 'Mejora sugerida' };
      default: return { bg: 'bg-slate-100 dark:bg-slate-700', text: 'text-slate-500 dark:text-slate-400', icon: Check, label: cat };
    }
  };

  const getTransferenciaStyles = (estado: string) => {
    switch (estado) {
      case 'pendiente': return { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-600 dark:text-amber-400' };
      case 'transferido': return { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-400' };
      case 'verificado': return { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-600 dark:text-emerald-400' };
      default: return { bg: 'bg-slate-100 dark:bg-slate-700', text: 'text-slate-500 dark:text-slate-400' };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-200 dark:border-slate-700 border-t-primary-600"></div>
          <p className="text-sm text-slate-400 dark:text-slate-500">Cargando cierre...</p>
        </div>
      </div>
    );
  }

  const completedItems = [
    checklistForm.alcance_completado,
    checklistForm.documentacion_entregada,
    checklistForm.contratos_cerrados,
    checklistForm.activos_transferidos,
    checklistForm.lecciones_registradas,
  ].filter(Boolean).length;

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
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Cierre del Proyecto</h1>
          <p className="text-xs text-slate-400 dark:text-slate-500">Proyecto #{id}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right">
            <p className="text-xs text-slate-400 dark:text-slate-500">Progreso</p>
            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{completedItems}/5</p>
          </div>
          <div className="w-16 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${(completedItems / 5) * 100}%` }} />
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

      {/* Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-700">
        <nav className="flex gap-1 -mb-px overflow-x-auto">
          {[
            { id: 'checklist' as const, label: 'Checklist', icon: CheckCircle2 },
            { id: 'lecciones' as const, label: 'Lecciones', icon: BookOpen, count: lecciones.length },
            { id: 'transferencias' as const, label: 'Transferencias', icon: ArrowRightLeft, count: transferencias.length },
            { id: 'financiero' as const, label: 'Cierre Financiero', icon: DollarSign },
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
              {tab.count !== undefined && (
                <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded-full">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* CHECKLIST TAB */}
      {activeTab === 'checklist' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 space-y-5">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Checklist de Cierre</h3>
          <div className="space-y-2">
            {[
              ['alcance_completado', 'Alcance completado al 100%'],
              ['documentacion_entregada', 'Toda la documentacion entregada'],
              ['contratos_cerrados', 'Todos los contratos cerrados'],
              ['activos_transferidos', 'Activos transferidos a operaciones'],
              ['lecciones_registradas', 'Lecciones aprendidas documentadas'],
            ].map(([key, label]) => (
              <label
                key={key}
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                  (checklistForm as any)[key]
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'
                    : 'bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${
                  (checklistForm as any)[key]
                    ? 'bg-emerald-500 text-white'
                    : 'bg-white dark:bg-slate-600 border-2 border-slate-300 dark:border-slate-500'
                }`}>
                  {(checklistForm as any)[key] && <Check className="w-3 h-3" />}
                </div>
                <input
                  type="checkbox"
                  checked={(checklistForm as any)[key]}
                  onChange={(e) => setChecklistForm({ ...checklistForm, [key]: e.target.checked })}
                  className="sr-only"
                />
                <span className="text-sm text-slate-700 dark:text-slate-200">{label}</span>
              </label>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Motivo de Cierre</label>
              <select value={checklistForm.motivo_cierre} onChange={(e) => setChecklistForm({ ...checklistForm, motivo_cierre: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors">
                <option value="exitoso">Exitoso</option>
                <option value="parcial">Parcial</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Observaciones</label>
              <textarea value={checklistForm.observaciones} onChange={(e) => setChecklistForm({ ...checklistForm, observaciones: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors resize-none" rows={2} />
            </div>
          </div>
          <button onClick={handleSaveChecklist}
            className="inline-flex items-center gap-2 bg-primary-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors shadow-sm">
            <Save className="w-4 h-4" />
            Guardar Checklist
          </button>
        </div>
      )}

      {/* LECCIONES TAB */}
      {activeTab === 'lecciones' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Lecciones Aprendidas</h3>
            <button onClick={() => openModal('leccion')} className="inline-flex items-center gap-2 bg-primary-600 text-white px-3 py-2 rounded-lg text-xs font-medium hover:bg-primary-700 transition-colors shadow-sm">
              <Plus className="w-3.5 h-3.5" /> Nueva Leccion
            </button>
          </div>
          <div className="p-4 space-y-3">
            {lecciones.length === 0 ? (
              <p className="text-center py-8 text-sm text-slate-500 dark:text-slate-400 font-medium">No hay lecciones registradas</p>
            ) : lecciones.map((item) => {
              const cat = getLeccionStyles(item.categoria);
              return (
                <div key={item.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-md ${cat.bg} ${cat.text}`}>
                        <cat.icon className="w-3 h-3" />
                        {cat.label}
                      </span>
                      {item.fecha_registro && (
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(item.fecha_registro).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEditLeccionModal(item)} className="p-1 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete('leccion', item.id)} className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{item.titulo}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{item.descripcion}</p>
                  {item.recomendacion && (
                    <p className="text-xs text-primary-600 dark:text-primary-400 mt-2 flex items-center gap-1">
                      <ArrowRightLeft className="w-3 h-3" /> {item.recomendacion}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TRANSFERENCIAS TAB */}
      {activeTab === 'transferencias' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Transferencia de Activos</h3>
            <button onClick={() => openModal('transferencia')} className="inline-flex items-center gap-2 bg-primary-600 text-white px-3 py-2 rounded-lg text-xs font-medium hover:bg-primary-700 transition-colors shadow-sm">
              <Plus className="w-3.5 h-3.5" /> Nuevo Activo
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700">
                  {['Activo', 'Area Destino', 'Estado', 'Acciones'].map((h) => (
                    <th key={h} className={`px-6 py-3 text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider ${h === 'Acciones' ? 'text-right' : 'text-left'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {transferencias.length === 0 ? (
                  <tr><td colSpan={4} className="px-6 py-12 text-center"><p className="text-sm text-slate-500 dark:text-slate-400 font-medium">No hay activos</p></td></tr>
                ) : transferencias.map((item) => {
                  const estado = getTransferenciaStyles(item.estado);
                  return (
                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group">
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{item.activo}</p>
                        {item.descripcion && <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{item.descripcion}</p>}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-1"><Building2 className="w-3 h-3" />{item.area_destino_nombre || '-'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <select value={item.estado} onChange={(e) => handleTransferStatus(item.id, e.target.value)}
                          className={`text-[10px] font-semibold rounded-md px-2 py-1 border-0 focus:ring-2 focus:ring-primary-500 cursor-pointer ${estado.bg} ${estado.text}`}>
                          <option value="pendiente">Pendiente</option>
                          <option value="transferido">Transferido</option>
                          <option value="verificado">Verificado</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => handleDelete('transferencia', item.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors opacity-0 group-hover:opacity-100">
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

      {/* FINANCIERO TAB */}
      {activeTab === 'financiero' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 space-y-5">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Cierre Financiero</h3>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Presupuesto Total</label>
              <input type="number" value={financieroForm.presupuesto_total} onChange={(e) => setFinancieroForm({ ...financieroForm, presupuesto_total: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Gasto Total</label>
              <input type="number" value={financieroForm.gasto_total} onChange={(e) => setFinancieroForm({ ...financieroForm, gasto_total: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Ahorro Generado</label>
              <input type="number" value={financieroForm.ahorro_generado} onChange={(e) => setFinancieroForm({ ...financieroForm, ahorro_generado: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors" />
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Sobrecosto</label>
              <input type="number" value={financieroForm.sobrecosto} onChange={(e) => setFinancieroForm({ ...financieroForm, sobrecosto: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Contratos Cerrados</label>
              <input type="number" value={financieroForm.contratos_cerrados} onChange={(e) => setFinancieroForm({ ...financieroForm, contratos_cerrados: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Pagos Pendientes</label>
              <input type="number" value={financieroForm.pagos_pendientes} onChange={(e) => setFinancieroForm({ ...financieroForm, pagos_pendientes: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Balance Final</label>
            <textarea value={financieroForm.balance_final} onChange={(e) => setFinancieroForm({ ...financieroForm, balance_final: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors resize-none" rows={3} />
          </div>
          {cierreFinanciero && (
            <div className={`p-4 rounded-xl ${Number(financieroForm.presupuesto_total || 0) - Number(financieroForm.gasto_total || 0) >= 0 ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800' : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'}`}>
              <p className="text-xs text-slate-500 dark:text-slate-400">Saldo</p>
              <p className={`text-lg font-bold ${Number(financieroForm.presupuesto_total || 0) - Number(financieroForm.gasto_total || 0) >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                {fmt(Number(financieroForm.presupuesto_total || 0) - Number(financieroForm.gasto_total || 0))}
              </p>
            </div>
          )}
          <button onClick={handleSaveFinanciero}
            className="inline-flex items-center gap-2 bg-primary-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors shadow-sm">
            <Save className="w-4 h-4" />
            Guardar Cierre Financiero
          </button>
        </div>
      )}

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                {modalType === 'leccion' ? (editingLeccion ? 'Editar Leccion' : 'Nueva Leccion') : 'Nuevo Activo'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-140px)]">
              {modalType === 'leccion' && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Categoria</label>
                    <select value={leccionForm.categoria} onChange={(e) => setLeccionForm({ ...leccionForm, categoria: e.target.value as any })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors">
                      <option value="que_fue_bien">Que salio bien</option>
                      <option value="que_fue_malo">Que salio mal</option>
                      <option value="mejora_sugerida">Mejora sugerida</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Titulo *</label>
                    <input type="text" value={leccionForm.titulo} onChange={(e) => setLeccionForm({ ...leccionForm, titulo: e.target.value })} required
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Descripcion *</label>
                    <textarea value={leccionForm.descripcion} onChange={(e) => setLeccionForm({ ...leccionForm, descripcion: e.target.value })} required
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors resize-none" rows={3} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Recomendacion</label>
                    <textarea value={leccionForm.recomendacion} onChange={(e) => setLeccionForm({ ...leccionForm, recomendacion: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors resize-none" rows={2} />
                  </div>
                </>
              )}
              {modalType === 'transferencia' && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Activo *</label>
                    <input type="text" value={transferForm.activo} onChange={(e) => setTransferForm({ ...transferForm, activo: e.target.value })} required
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Descripcion</label>
                    <textarea value={transferForm.descripcion} onChange={(e) => setTransferForm({ ...transferForm, descripcion: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors resize-none" rows={2} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Area Destino</label>
                      <select value={transferForm.area_destino} onChange={(e) => setTransferForm({ ...transferForm, area_destino: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors">
                        <option value="">Seleccionar...</option>
                        {areas.map((a: any) => <option key={a.id} value={a.id}>{a.nombre}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Responsable</label>
                      <select value={transferForm.responsable} onChange={(e) => setTransferForm({ ...transferForm, responsable: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors">
                        <option value="">Seleccionar...</option>
                        {users.map((u: any) => <option key={u.id} value={u.id}>{u.nombre}</option>)}
                      </select>
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

export default CierrePage;
