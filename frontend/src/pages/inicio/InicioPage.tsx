import React, { useEffect, useState } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import {
  inicioService,
  Charter,
  Stakeholder,
  Viabilidad,
} from '../../services/inicio.service';
import {
  ArrowLeft,
  Plus,
  FileText,
  Users,
  CheckCircle2,
  AlertCircle,
  X,
  Save,
  Loader2,
  Edit3,
  Trash2,
  Calendar,
  DollarSign,
  Target,
  Shield,
  TrendingUp,
  Building2,
  Mail,
  Phone,
} from 'lucide-react';

const InicioPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const [charter, setCharter] = useState<Charter | null>(null);
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>([]);
  const [viabilidad, setViabilidad] = useState<Viabilidad[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'charter' | 'stakeholders' | 'viabilidad'>(
    (searchParams.get('tab') as any) || 'charter'
  );
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [editingItem, setEditingItem] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  const [charterForm, setCharterForm] = useState({
    resumen_ejecutivo: '', necesidad_negocio: '', alcance_alto_nivel: '',
    supuestos_clave: '', restricciones: '', riesgos_principales: '',
    presupuesto_estimado: '', fecha_inicio_estimada: '', fecha_fin_estimada: '', estado: 'borrador',
  });
  const [stakeholderForm, setStakeholderForm] = useState({
    nombre: '', organisation: '', cargo: '', email: '', telefono: '',
    nivel_poder: '3', nivel_interes: '3', expectativas: '', actitud: 'neutral',
    estrategia_gestion: '', responsable_id: '',
  });
  const [viabilidadForm, setViabilidadForm] = useState({
    tipo: 'tecnica', justificacion: '', es_viable: true, condiciones: '',
  });

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setError(null);
      const [c, s, v, u] = await Promise.all([
        inicioService.getCharter(parseInt(id || '0')),
        inicioService.getStakeholders(parseInt(id || '0')),
        inicioService.getViabilidad(parseInt(id || '0')),
        inicioService.getUsers(parseInt(id || '0')),
      ]);
      if (c.data) {
        setCharter(c.data);
        setCharterForm({
          resumen_ejecutivo: c.data.resumen_ejecutivo || '',
          necesidad_negocio: c.data.necesidad_negocio || '',
          alcance_alto_nivel: c.data.alcance_alto_nivel || '',
          supuestos_clave: c.data.supuestos_clave || '',
          restricciones: c.data.restricciones || '',
          riesgos_principales: c.data.riesgos_principales || '',
          presupuesto_estimado: c.data.presupuesto_estimado ? String(c.data.presupuesto_estimado) : '',
          fecha_inicio_estimada: c.data.fecha_inicio_estimada ? c.data.fecha_inicio_estimada.split('T')[0] : '',
          fecha_fin_estimada: c.data.fecha_fin_estimada ? c.data.fecha_fin_estimada.split('T')[0] : '',
          estado: c.data.estado || 'borrador',
        });
      }
      setStakeholders(s.data);
      setViabilidad(v.data);
      setUsers(u.data);
    } catch (err) {
      setError('Error al cargar inicio');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (type: string, item?: any) => {
    setModalType(type);
    setEditingItem(item || null);
    if (type === 'stakeholder') {
      setStakeholderForm(item ? {
        nombre: item.nombre, organisation: item.organisation || '', cargo: item.cargo || '',
        email: item.email || '', telefono: item.telefono || '',
        nivel_poder: String(item.nivel_poder), nivel_interes: String(item.nivel_interes),
        expectativas: item.expectativas || '', actitud: item.actitud || 'neutral',
        estrategia_gestion: item.estrategia_gestion || '', responsable_id: item.responsable_id || '',
      } : { nombre: '', organisation: '', cargo: '', email: '', telefono: '', nivel_poder: '3', nivel_interes: '3', expectativas: '', actitud: 'neutral', estrategia_gestion: '', responsable_id: '' });
    } else if (type === 'viabilidad') {
      setViabilidadForm(item ? {
        tipo: item.tipo, justificacion: item.justificacion || '',
        es_viable: Boolean(item.es_viable), condiciones: item.condiciones || '',
      } : { tipo: 'tecnica', justificacion: '', es_viable: true, condiciones: '' });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      if (modalType === 'stakeholder') {
        const data = { ...stakeholderForm, nivel_poder: Number(stakeholderForm.nivel_poder), nivel_interes: Number(stakeholderForm.nivel_interes), responsable_id: stakeholderForm.responsable_id ? Number(stakeholderForm.responsable_id) : undefined };
        if (editingItem) await inicioService.updateStakeholder(editingItem.id, data);
        else await inicioService.createStakeholder(parseInt(id || '0'), data);
      } else if (modalType === 'viabilidad') {
        const data = { ...viabilidadForm, es_viable: viabilidadForm.es_viable };
        if (editingItem) await inicioService.updateViabilidad(editingItem.id, data);
        else await inicioService.createViabilidad(parseInt(id || '0'), data);
      }
      setShowModal(false);
      await loadData();
    } catch (err) {
      setError('Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveCharter = async () => {
    try {
      setSaving(true);
      await inicioService.saveCharter(parseInt(id || '0'), {
        ...charterForm, presupuesto_estimado: Number(charterForm.presupuesto_estimado) || undefined,
      });
      await loadData();
    } catch (err) {
      setError('Error al guardar charter');
    } finally {
      setSaving(false);
    }
  };

  const handleApproveCharter = async () => {
    if (!confirm('Aprobar el Acta de Constitucion?')) return;
    try {
      await inicioService.approveCharter(parseInt(id || '0'));
      await loadData();
    } catch (err) {
      setError('Error al aprobar');
    }
  };

  const handleDelete = async (type: string, itemId: number) => {
    if (!confirm('Eliminar este registro?')) return;
    try {
      if (type === 'stakeholder') await inicioService.deleteStakeholder(itemId);
      else if (type === 'viabilidad') await inicioService.deleteViabilidad(itemId);
      await loadData();
    } catch (err) {
      setError('Error al eliminar');
    }
  };

  const getActitudStyles = (a: string) => {
    switch (a) {
      case 'apoyador': return { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-600 dark:text-emerald-400' };
      case 'detractor': return { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-600 dark:text-red-400' };
      default: return { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-600 dark:text-amber-400' };
    }
  };

  const fmt = (n: number) => formatCurrency(n);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-200 dark:border-slate-700 border-t-primary-600"></div>
          <p className="text-sm text-slate-400 dark:text-slate-500">Cargando inicio...</p>
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
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Inicio del Proyecto</h1>
          <p className="text-xs text-slate-400 dark:text-slate-500">Acta de Constitucion y Analisis de Viabilidad</p>
        </div>
        <div className="flex items-center gap-2">
          {charter?.estado === 'aprobado' ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Aprobado
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-lg border border-amber-200 dark:border-amber-800">
              <FileText className="w-3.5 h-3.5" />
              Borrador
            </span>
          )}
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
            { id: 'charter' as const, label: 'Acta Constitucion', icon: FileText },
            { id: 'stakeholders' as const, label: 'Stakeholders', icon: Users, count: stakeholders.length },
            { id: 'viabilidad' as const, label: 'Viabilidad', icon: CheckCircle2, count: viabilidad.length },
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

      {/* CHARTER TAB */}
      {activeTab === 'charter' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Acta de Constitucion del Proyecto</h3>
            <div className="flex items-center gap-2">
              {charter?.estado !== 'aprobado' && (
                <button onClick={handleApproveCharter}
                  className="inline-flex items-center gap-2 bg-emerald-600 text-white px-3 py-2 rounded-lg text-xs font-medium hover:bg-emerald-700 transition-colors shadow-sm">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Aprobar
                </button>
              )}
              <button onClick={handleSaveCharter} disabled={saving}
                className="inline-flex items-center gap-2 bg-primary-600 text-white px-3 py-2 rounded-lg text-xs font-medium hover:bg-primary-700 transition-colors shadow-sm disabled:opacity-50">
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>

          {charter?.estado === 'aprobado' && (
            <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <p className="text-sm text-emerald-700 dark:text-emerald-300">
                Aprobado por {charter.aprobado_por_nombre} el {charter.fecha_aprobacion ? new Date(charter.fecha_aprobacion).toLocaleDateString() : ''}
              </p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Resumen Ejecutivo</label>
              <textarea value={charterForm.resumen_ejecutivo} onChange={(e) => setCharterForm({ ...charterForm, resumen_ejecutivo: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors resize-none" rows={3} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Necesidad del Negocio</label>
              <textarea value={charterForm.necesidad_negocio} onChange={(e) => setCharterForm({ ...charterForm, necesidad_negocio: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors resize-none" rows={3} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Alcance Alto Nivel</label>
              <textarea value={charterForm.alcance_alto_nivel} onChange={(e) => setCharterForm({ ...charterForm, alcance_alto_nivel: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors resize-none" rows={3} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Supuestos Clave</label>
                <textarea value={charterForm.supuestos_clave} onChange={(e) => setCharterForm({ ...charterForm, supuestos_clave: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors resize-none" rows={2} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Restricciones</label>
                <textarea value={charterForm.restricciones} onChange={(e) => setCharterForm({ ...charterForm, restricciones: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors resize-none" rows={2} />
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Presupuesto Estimado ($)</label>
                <input type="number" value={charterForm.presupuesto_estimado} onChange={(e) => setCharterForm({ ...charterForm, presupuesto_estimado: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Fecha Inicio Estimada</label>
                <input type="date" value={charterForm.fecha_inicio_estimada} onChange={(e) => setCharterForm({ ...charterForm, fecha_inicio_estimada: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Fecha Fin Estimada</label>
                <input type="date" value={charterForm.fecha_fin_estimada} onChange={(e) => setCharterForm({ ...charterForm, fecha_fin_estimada: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STAKEHOLDERS TAB */}
      {activeTab === 'stakeholders' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Stakeholders</h3>
            <button onClick={() => openModal('stakeholder')} className="inline-flex items-center gap-2 bg-primary-600 text-white px-3 py-2 rounded-lg text-xs font-medium hover:bg-primary-700 transition-colors shadow-sm">
              <Plus className="w-3.5 h-3.5" /> Nuevo
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700">
                  {['Nombre', 'Poder', 'Interes', 'Actitud', 'Estrategia', 'Acciones'].map((h) => (
                    <th key={h} className={`px-6 py-3 text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider ${h === 'Acciones' ? 'text-right' : h === 'Poder' || h === 'Interes' ? 'text-center' : 'text-left'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {stakeholders.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-12 text-center"><p className="text-sm text-slate-500 dark:text-slate-400 font-medium">No hay stakeholders</p></td></tr>
                ) : stakeholders.map((item) => {
                  const actitud = getActitudStyles(item.actitud);
                  return (
                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group">
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{item.nombre}</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500">{item.organisation || ''} {item.cargo ? `- ${item.cargo}` : ''}</p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{item.nivel_poder}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{item.nivel_interes}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex px-2 py-0.5 text-[10px] font-semibold rounded-md ${actitud.bg} ${actitud.text}`}>
                          {item.actitud}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 max-w-xs truncate">{item.estrategia_gestion || '-'}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openModal('stakeholder', item)} className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"><Edit3 className="w-4 h-4" /></button>
                          <button onClick={() => handleDelete('stakeholder', item.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"><Trash2 className="w-4 h-4" /></button>
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

      {/* VIABILIDAD TAB */}
      {activeTab === 'viabilidad' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Analisis de Viabilidad</h3>
            <button onClick={() => openModal('viabilidad')} className="inline-flex items-center gap-2 bg-primary-600 text-white px-3 py-2 rounded-lg text-xs font-medium hover:bg-primary-700 transition-colors shadow-sm">
              <Plus className="w-3.5 h-3.5" /> Nuevo
            </button>
          </div>
          <div className="p-4 space-y-3">
            {viabilidad.length === 0 ? (
              <p className="text-center py-8 text-sm text-slate-500 dark:text-slate-400 font-medium">No hay analisis de viabilidad</p>
            ) : viabilidad.map((item) => (
              <div key={item.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex px-2 py-0.5 text-[10px] font-semibold rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 capitalize">{item.tipo}</span>
                    <span className={`inline-flex px-2 py-0.5 text-[10px] font-semibold rounded-md ${item.es_viable ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'}`}>
                      {item.es_viable ? 'Viable' : 'No Viable'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openModal('viabilidad', item)} className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"><Edit3 className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete('viabilidad', item.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
                {item.justificacion && <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">{item.justificacion}</p>}
                {item.condiciones && <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Condiciones: {item.condiciones}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                {editingItem ? 'Editar' : 'Nuevo'} {modalType === 'stakeholder' ? 'Stakeholder' : 'Analisis de Viabilidad'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-140px)]">
              {modalType === 'stakeholder' && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Nombre *</label>
                    <input type="text" value={stakeholderForm.nombre} onChange={(e) => setStakeholderForm({ ...stakeholderForm, nombre: e.target.value })} required
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Organizacion</label>
                      <input type="text" value={stakeholderForm.organisation} onChange={(e) => setStakeholderForm({ ...stakeholderForm, organisation: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Cargo</label>
                      <input type="text" value={stakeholderForm.cargo} onChange={(e) => setStakeholderForm({ ...stakeholderForm, cargo: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Nivel Poder (1-5)</label>
                      <input type="number" value={stakeholderForm.nivel_poder} onChange={(e) => setStakeholderForm({ ...stakeholderForm, nivel_poder: e.target.value })} min="1" max="5"
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Nivel Interes (1-5)</label>
                      <input type="number" value={stakeholderForm.nivel_interes} onChange={(e) => setStakeholderForm({ ...stakeholderForm, nivel_interes: e.target.value })} min="1" max="5"
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Actitud</label>
                    <select value={stakeholderForm.actitud} onChange={(e) => setStakeholderForm({ ...stakeholderForm, actitud: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors">
                      <option value="apoyador">Apoyador</option>
                      <option value="neutral">Neutral</option>
                      <option value="detractor">Detractor</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Estrategia de Gestion</label>
                    <textarea value={stakeholderForm.estrategia_gestion} onChange={(e) => setStakeholderForm({ ...stakeholderForm, estrategia_gestion: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors resize-none" rows={2} />
                  </div>
                </>
              )}
              {modalType === 'viabilidad' && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Tipo *</label>
                    <select value={viabilidadForm.tipo} onChange={(e) => setViabilidadForm({ ...viabilidadForm, tipo: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors">
                      <option value="tecnica">Tecnica</option>
                      <option value="economica">Economica</option>
                      <option value="operativa">Operativa</option>
                      <option value="legal">Legal</option>
                      <option value="ambiental">Ambiental</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Justificacion</label>
                    <textarea value={viabilidadForm.justificacion} onChange={(e) => setViabilidadForm({ ...viabilidadForm, justificacion: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors resize-none" rows={3} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Es viable?</label>
                    <select value={viabilidadForm.es_viable ? '1' : '0'} onChange={(e) => setViabilidadForm({ ...viabilidadForm, es_viable: e.target.value === '1' })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors">
                      <option value="1">Si, es viable</option>
                      <option value="0">No, no es viable</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Condiciones</label>
                    <textarea value={viabilidadForm.condiciones} onChange={(e) => setViabilidadForm({ ...viabilidadForm, condiciones: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors resize-none" rows={2} />
                  </div>
                </>
              )}
            </form>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
              <button type="button" onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors">
                Cancelar
              </button>
              <button type="submit" onClick={handleSubmit} disabled={saving}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors shadow-sm disabled:opacity-50">
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

export default InicioPage;
