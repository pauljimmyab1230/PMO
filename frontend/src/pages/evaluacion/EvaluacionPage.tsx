import React, { useEffect, useState } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import {
  evaluacionService,
  Evaluacion,
  Encuesta,
  ResumenEvaluacion,
} from '../../services/evaluacion.service';
import {
  ArrowLeft,
  Plus,
  BarChart3,
  Target,
  ClipboardCheck,
  AlertCircle,
  X,
  Save,
  Loader2,
  Trash2,
  Star,
  TrendingUp,
  Users,
  DollarSign,
  CheckCircle2,
} from 'lucide-react';
import { formatCurrency } from '../../utils/format';

const EvaluacionPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const [resumen, setResumen] = useState<ResumenEvaluacion | null>(null);
  const [evaluacion, setEvaluacion] = useState<Evaluacion | null>(null);
  const [encuestas, setEncuestas] = useState<Encuesta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'resumen' | 'evaluacion' | 'encuestas'>(
    (searchParams.get('tab') as any) || 'resumen'
  );
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [evalForm, setEvalForm] = useState({
    alcance_cumplido: '80', tiempo_cumplido: '75', costo_cumplido: '85', calidad_cumplida: '90',
    impacto_esperado: '', impacto_real: '',
    beneficiarios_alcanzados: '', beneficiarios_esperados: '',
    satisfaccion_sponsor: '4', satisfaccion_equipo: '4', satisfaccion_beneficiarios: '4',
    calificacion: 'bueno', lecciones_clave: '', recomendaciones: '',
  });

  const [encuestaForm, setEncuestaForm] = useState({
    pregunta: '', tipo_respuesta: 'escala', respuesta_promedio: '', total_respuestas: '',
  });

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setError(null);
      const [r, e, enc] = await Promise.all([
        evaluacionService.getResumen(parseInt(id || '0')),
        evaluacionService.getEvaluacion(parseInt(id || '0')),
        evaluacionService.getEncuestas(parseInt(id || '0')),
      ]);
      setResumen(r.data);
      setEncuestas(enc.data);
      if (e.data) {
        setEvaluacion(e.data);
        setEvalForm({
          alcance_cumplido: String(e.data.alcance_cumplido || 80),
          tiempo_cumplido: String(e.data.tiempo_cumplido || 75),
          costo_cumplido: String(e.data.costo_cumplido || 85),
          calidad_cumplida: String(e.data.calidad_cumplida || 90),
          impacto_esperado: e.data.impacto_esperado || '',
          impacto_real: e.data.impacto_real || '',
          beneficiarios_alcanzados: String(e.data.beneficiarios_alcanzados || ''),
          beneficiarios_esperados: String(e.data.beneficiarios_esperados || ''),
          satisfaccion_sponsor: String(e.data.satisfaccion_sponsor || 4),
          satisfaccion_equipo: String(e.data.satisfaccion_equipo || 4),
          satisfaccion_beneficiarios: String(e.data.satisfaccion_beneficiarios || 4),
          calificacion: e.data.calificacion || 'bueno',
          lecciones_clave: e.data.lecciones_clave || '',
          recomendaciones: e.data.recomendaciones || '',
        });
      }
    } catch (err) {
      setError('Error al cargar evaluacion');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEvaluacion = async () => {
    try {
      setSaving(true);
      await evaluacionService.saveEvaluacion(parseInt(id || '0'), {
        ...evalForm,
        alcance_cumplido: Number(evalForm.alcance_cumplido),
        tiempo_cumplido: Number(evalForm.tiempo_cumplido),
        costo_cumplido: Number(evalForm.costo_cumplido),
        calidad_cumplida: Number(evalForm.calidad_cumplida),
        beneficiarios_alcanzados: Number(evalForm.beneficiarios_alcanzados) || undefined,
        beneficiarios_esperados: Number(evalForm.beneficiarios_esperados) || undefined,
        satisfaccion_sponsor: Number(evalForm.satisfaccion_sponsor),
        satisfaccion_equipo: Number(evalForm.satisfaccion_equipo),
        satisfaccion_beneficiarios: Number(evalForm.satisfaccion_beneficiarios),
      });
      await loadData();
    } catch {
      setError('Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitEncuesta = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await evaluacionService.createEncuesta(parseInt(id || '0'), {
        ...encuestaForm,
        respuesta_promedio: Number(encuestaForm.respuesta_promedio) || 0,
        total_respuestas: Number(encuestaForm.total_respuestas) || 0,
      });
      setShowModal(false);
      await loadData();
    } catch {
      setError('Error al guardar');
    }
  };

  const handleDeleteEncuesta = async (itemId: number) => {
    if (!confirm('Eliminar esta encuesta?')) return;
    try {
      await evaluacionService.deleteEncuesta(itemId);
      await loadData();
    } catch {
      setError('Error al eliminar');
    }
  };

  const getCalificacionStyles = (c: string) => {
    switch (c) {
      case 'excelente': return { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-800' };
      case 'bueno': return { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-800' };
      case 'aceptable': return { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-800' };
      case 'deficiente': return { bg: 'bg-orange-50 dark:bg-orange-900/20', text: 'text-orange-600 dark:text-orange-400', border: 'border-orange-200 dark:border-orange-800' };
      case 'fallido': return { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-600 dark:text-red-400', border: 'border-red-200 dark:border-red-800' };
      default: return { bg: 'bg-slate-100 dark:bg-slate-700', text: 'text-slate-500 dark:text-slate-400', border: 'border-slate-200 dark:border-slate-600' };
    }
  };

  const StarRating = ({ value, onChange }: { value: number; onChange: (v: number) => void }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button key={star} type="button" onClick={() => onChange(star)}
          className={`p-0.5 transition-colors ${star <= value ? 'text-amber-400 hover:text-amber-500' : 'text-slate-300 dark:text-slate-600 hover:text-slate-400'}`}>
          <Star className="w-6 h-6" fill={star <= value ? 'currentColor' : 'none'} />
        </button>
      ))}
    </div>
  );

  const fmt = (n: number) => formatCurrency(n);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-200 dark:border-slate-700 border-t-primary-600"></div>
          <p className="text-sm text-slate-400 dark:text-slate-500">Cargando evaluacion...</p>
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
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Evaluacion del Proyecto</h1>
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
            { id: 'resumen' as const, label: 'Resumen', icon: BarChart3 },
            { id: 'evaluacion' as const, label: 'Evaluacion', icon: ClipboardCheck },
            { id: 'encuestas' as const, label: 'Encuestas', icon: Users, count: encuestas.length },
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

      {/* RESUMEN TAB */}
      {activeTab === 'resumen' && resumen && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4">Resultados del Proyecto</h3>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600">
                <div className="w-10 h-10 bg-primary-50 dark:bg-primary-900/30 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <Target className="w-5 h-5 text-primary-500" />
                </div>
                <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{resumen.marcoLogico?.cumplidos || 0}/{resumen.marcoLogico?.total || 0}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Indicadores cumplidos</p>
              </div>
              <div className="text-center p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600">
                <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                </div>
                <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{resumen.wbs?.completadas || 0}/{resumen.wbs?.total || 0}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Actividades completadas</p>
              </div>
              <div className="text-center p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600">
                <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <TrendingUp className="w-5 h-5 text-blue-500" />
                </div>
                <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{resumen.entregables?.aprobados || 0}/{resumen.entregables?.total || 0}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Entregables aprobados</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
              <div className="flex items-center gap-2 mb-4">
                <DollarSign className="w-4 h-4 text-slate-400" />
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Presupuesto</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between"><span className="text-sm text-slate-500 dark:text-slate-400">Planeado:</span><span className="text-sm font-bold text-slate-700 dark:text-slate-200">{fmt(resumen.presupuesto?.total || 0)}</span></div>
                <div className="flex justify-between"><span className="text-sm text-slate-500 dark:text-slate-400">Ejecutado:</span><span className="text-sm font-bold text-slate-700 dark:text-slate-200">{fmt(resumen.presupuesto?.real || 0)}</span></div>
                <div className="flex justify-between pt-2 border-t border-slate-100 dark:border-slate-700">
                  <span className="text-sm text-slate-500 dark:text-slate-400">Variacion:</span>
                  <span className={`text-sm font-bold ${(resumen.presupuesto?.total || 0) - (resumen.presupuesto?.real || 0) >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                    {fmt((resumen.presupuesto?.total || 0) - (resumen.presupuesto?.real || 0))}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="w-4 h-4 text-slate-400" />
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Lecciones Aprendidas</h3>
              </div>
              <div className="text-center py-4">
                <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">{resumen.lecciones?.total || 0}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">lecciones documentadas</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EVALUACION TAB */}
      {activeTab === 'evaluacion' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 space-y-6">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Evaluacion de Medios y Fines</h3>

          {/* Medios */}
          <div>
            <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Evaluacion de Medios (Resultados)</h4>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                ['alcance_cumplido', 'Alcance'],
                ['tiempo_cumplido', 'Tiempo'],
                ['costo_cumplido', 'Costo'],
                ['calidad_cumplida', 'Calidad'],
              ].map(([key, label]) => (
                <div key={key} className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600">
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">{label}</label>
                  <div className="flex items-center gap-2">
                    <input type="range" min="0" max="100" value={(evalForm as any)[key]}
                      onChange={(e) => setEvalForm({ ...evalForm, [key]: e.target.value })}
                      className="flex-1 h-2 bg-slate-200 dark:bg-slate-600 rounded-full appearance-none cursor-pointer accent-primary-500" />
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200 min-w-[36px] text-right">{(evalForm as any)[key]}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Fines */}
          <div>
            <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Evaluacion de Fines (Impacto)</h4>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Impacto Esperado</label>
                <textarea value={evalForm.impacto_esperado} onChange={(e) => setEvalForm({ ...evalForm, impacto_esperado: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors resize-none" rows={3} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Impacto Real</label>
                <textarea value={evalForm.impacto_real} onChange={(e) => setEvalForm({ ...evalForm, impacto_real: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors resize-none" rows={3} />
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Beneficiarios Esperados</label>
                <input type="number" value={evalForm.beneficiarios_esperados} onChange={(e) => setEvalForm({ ...evalForm, beneficiarios_esperados: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Beneficiarios Alcanzados</label>
                <input type="number" value={evalForm.beneficiarios_alcanzados} onChange={(e) => setEvalForm({ ...evalForm, beneficiarios_alcanzados: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors" />
              </div>
            </div>
          </div>

          {/* Satisfaccion */}
          <div>
            <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Satisfaccion</h4>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">Sponsor</p>
                <StarRating value={Number(evalForm.satisfaccion_sponsor)} onChange={(v) => setEvalForm({ ...evalForm, satisfaccion_sponsor: String(v) })} />
              </div>
              <div className="text-center p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">Equipo</p>
                <StarRating value={Number(evalForm.satisfaccion_equipo)} onChange={(v) => setEvalForm({ ...evalForm, satisfaccion_equipo: String(v) })} />
              </div>
              <div className="text-center p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">Beneficiarios</p>
                <StarRating value={Number(evalForm.satisfaccion_beneficiarios)} onChange={(v) => setEvalForm({ ...evalForm, satisfaccion_beneficiarios: String(v) })} />
              </div>
            </div>
          </div>

          {/* Calificacion */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Calificacion Final</label>
            <div className="flex flex-wrap gap-2">
              {['excelente', 'bueno', 'aceptable', 'deficiente', 'fallido'].map((c) => {
                const styles = getCalificacionStyles(c);
                return (
                  <button key={c} type="button" onClick={() => setEvalForm({ ...evalForm, calificacion: c })}
                    className={`px-4 py-2 rounded-xl border text-sm font-medium capitalize transition-all ${
                      evalForm.calificacion === c
                        ? `${styles.bg} ${styles.text} ${styles.border}`
                        : 'border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}>
                    {c}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Lecciones y Recomendaciones */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Lecciones Clave</label>
              <textarea value={evalForm.lecciones_clave} onChange={(e) => setEvalForm({ ...evalForm, lecciones_clave: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors resize-none" rows={3} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Recomendaciones</label>
              <textarea value={evalForm.recomendaciones} onChange={(e) => setEvalForm({ ...evalForm, recomendaciones: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors resize-none" rows={3} />
            </div>
          </div>

          <button onClick={handleSaveEvaluacion} disabled={saving}
            className="inline-flex items-center gap-2 bg-primary-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors shadow-sm disabled:opacity-50">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Guardando...' : 'Guardar Evaluacion'}
          </button>
        </div>
      )}

      {/* ENCUESTAS TAB */}
      {activeTab === 'encuestas' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Encuestas a Beneficiarios</h3>
            <button onClick={() => setShowModal(true)} className="inline-flex items-center gap-2 bg-primary-600 text-white px-3 py-2 rounded-lg text-xs font-medium hover:bg-primary-700 transition-colors shadow-sm">
              <Plus className="w-3.5 h-3.5" /> Nueva Encuesta
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700">
                  {['Pregunta', 'Tipo', 'Promedio', 'Respuestas', 'Acciones'].map((h) => (
                    <th key={h} className={`px-6 py-3 text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider ${h === 'Acciones' ? 'text-right' : 'text-left'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {encuestas.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-12 text-center"><p className="text-sm text-slate-500 dark:text-slate-400 font-medium">No hay encuestas</p></td></tr>
                ) : encuestas.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group">
                    <td className="px-6 py-4 text-sm font-medium text-slate-700 dark:text-slate-200">{item.pregunta}</td>
                    <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 capitalize">{item.tipo_respuesta}</td>
                    <td className="px-6 py-4 text-center text-sm font-bold text-slate-700 dark:text-slate-200">{Number(item.respuesta_promedio).toFixed(1)}</td>
                    <td className="px-6 py-4 text-center text-sm text-slate-500 dark:text-slate-400">{item.total_respuestas}</td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleDeleteEncuesta(item.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors opacity-0 group-hover:opacity-100">
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

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Nueva Encuesta</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmitEncuesta} className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Pregunta *</label>
                <textarea value={encuestaForm.pregunta} onChange={(e) => setEncuestaForm({ ...encuestaForm, pregunta: e.target.value })} required
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors resize-none" rows={2} />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Tipo</label>
                  <select value={encuestaForm.tipo_respuesta} onChange={(e) => setEncuestaForm({ ...encuestaForm, tipo_respuesta: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors">
                    <option value="escala">Escala 1-5</option>
                    <option value="si_no">Si/No</option>
                    <option value="abierta">Abierta</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Promedio</label>
                  <input type="number" value={encuestaForm.respuesta_promedio} onChange={(e) => setEncuestaForm({ ...encuestaForm, respuesta_promedio: e.target.value })} step="0.1" min="0" max="5"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5"># Respuestas</label>
                  <input type="number" value={encuestaForm.total_respuestas} onChange={(e) => setEncuestaForm({ ...encuestaForm, total_respuestas: e.target.value })} min="0"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors" />
                </div>
              </div>
            </form>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
              <button type="button" onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors">
                Cancelar
              </button>
              <button type="submit" onClick={handleSubmitEncuesta}
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

const BookOpen: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
);

export default EvaluacionPage;
