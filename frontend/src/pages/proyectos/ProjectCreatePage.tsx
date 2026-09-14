import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { projectService } from '../../services/project.service';
import { userService } from '../../services/user.service';
import { User } from '../../types';
import {
  ArrowLeft,
  FolderKanban,
  Users,
  Calendar,
  DollarSign,
  Target,
  Save,
  Loader2,
  AlertCircle,
  X,
} from 'lucide-react';

const ProjectCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    tipo_id: '',
    sponsor_id: '',
    pm_id: '',
    area_id: '',
    fecha_inicio_planeada: '',
    fecha_fin_planeada: '',
    presupuesto_planeado: '',
    justificacion: '',
    objetivogeneral: '',
    alcance_general: '',
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await userService.getAll();
      setUsers(response.data);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await projectService.create({
        ...formData,
        tipo_id: formData.tipo_id ? parseInt(formData.tipo_id) : undefined,
        sponsor_id: formData.sponsor_id ? parseInt(formData.sponsor_id) : undefined,
        pm_id: formData.pm_id ? parseInt(formData.pm_id) : undefined,
        area_id: formData.area_id ? parseInt(formData.area_id) : undefined,
        presupuesto_planeado: formData.presupuesto_planeado
          ? parseFloat(formData.presupuesto_planeado)
          : undefined,
      });
      navigate(`/proyectos/${response.data.id}`);
    } catch (error: any) {
      console.error('Error creating project:', error);
      setError(error.response?.data?.message || 'Error al crear el proyecto');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors";

  return (
    <div className="p-5 max-w-4xl mx-auto space-y-4">
      {/* Header */}
      <div>
        <Link
          to="/proyectos"
          className="inline-flex items-center gap-1.5 text-sm text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors mb-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a Proyectos
        </Link>
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Nuevo Proyecto</h1>
        <p className="text-xs text-slate-400 dark:text-slate-500">Completa la informacion para crear un nuevo proyecto</p>
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

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Informacion Basica */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 bg-primary-50 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
              <FolderKanban className="w-4 h-4 text-primary-500" />
            </div>
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Informacion Basica</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="lg:col-span-2">
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Nombre del Proyecto *</label>
              <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required
                placeholder="Ej: Sistema de Gestion de Proyectos"
                className={inputClass} />
            </div>
            <div className="lg:col-span-2">
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Descripcion</label>
              <textarea name="descripcion" value={formData.descripcion} onChange={handleChange} rows={3}
                placeholder="Describe brevemente el proyecto..."
                className={`${inputClass} resize-none`} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Tipo de Proyecto</label>
              <select name="tipo_id" value={formData.tipo_id} onChange={handleChange} className={inputClass}>
                <option value="">Seleccionar...</option>
                <option value="1">Inversion</option>
                <option value="2">Mejora</option>
                <option value="3">Mantenimiento</option>
                <option value="4">Desarrollo</option>
                <option value="5">Investigacion</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Area</label>
              <select name="area_id" value={formData.area_id} onChange={handleChange} className={inputClass}>
                <option value="">Seleccionar...</option>
                <option value="1">Tecnologia e Informatica</option>
                <option value="2">Recursos Humanos</option>
                <option value="3">Finanzas</option>
                <option value="4">Operaciones</option>
                <option value="5">Gerencia General</option>
              </select>
            </div>
          </div>
        </div>

        {/* Responsables */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 bg-violet-50 dark:bg-violet-900/30 rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 text-violet-500" />
            </div>
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Responsables</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Sponsor</label>
              <select name="sponsor_id" value={formData.sponsor_id} onChange={handleChange} className={inputClass}>
                <option value="">Seleccionar...</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>{user.nombre}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Project Manager</label>
              <select name="pm_id" value={formData.pm_id} onChange={handleChange} className={inputClass}>
                <option value="">Seleccionar...</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>{user.nombre}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Fechas y Presupuesto */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 bg-amber-50 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
              <Calendar className="w-4 h-4 text-amber-500" />
            </div>
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Fechas y Presupuesto</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Fecha Inicio</label>
              <input type="date" name="fecha_inicio_planeada" value={formData.fecha_inicio_planeada} onChange={handleChange}
                className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Fecha Fin</label>
              <input type="date" name="fecha_fin_planeada" value={formData.fecha_fin_planeada} onChange={handleChange}
                className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Presupuesto ($)</label>
              <input type="number" name="presupuesto_planeado" value={formData.presupuesto_planeado} onChange={handleChange}
                step="0.01" placeholder="0.00"
                className={inputClass} />
            </div>
          </div>
        </div>

        {/* Justificacion y Objetivos */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
              <Target className="w-4 h-4 text-emerald-500" />
            </div>
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Justificacion y Objetivos</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Justificacion</label>
              <textarea name="justificacion" value={formData.justificacion} onChange={handleChange} rows={3}
                placeholder="Por que es necesario este proyecto?"
                className={`${inputClass} resize-none`} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Objetivo General</label>
              <textarea name="objetivogeneral" value={formData.objetivogeneral} onChange={handleChange} rows={2}
                placeholder="Que se quiere lograr?"
                className={`${inputClass} resize-none`} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Alcance General</label>
              <textarea name="alcance_general" value={formData.alcance_general} onChange={handleChange} rows={2}
                placeholder="Que incluye y que no incluye?"
                className={`${inputClass} resize-none`} />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <Link
            to="/proyectos"
            className="px-5 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 bg-primary-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors shadow-sm disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {loading ? 'Creando...' : 'Crear Proyecto'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProjectCreatePage;
