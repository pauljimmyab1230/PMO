import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { projectService } from '../../services/project.service';
import { Project, ProjectDashboard } from '../../types';
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  FolderKanban,
  Target,
  BarChart3,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Zap,
  Users,
  FileText,
  Clock,
  TrendingUp,
  ChevronRight,
} from 'lucide-react';

const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [dashboard, setDashboard] = useState<ProjectDashboard | null>(null);
  const [activeTab, setActiveTab] = useState('resumen');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadProject(parseInt(id));
    }
  }, [id]);

  const loadProject = async (projectId: number) => {
    try {
      const [projectRes, dashboardRes] = await Promise.all([
        projectService.getById(projectId),
        projectService.getDashboard(projectId),
      ]);
      setProject(projectRes.data);
      setDashboard(dashboardRes.data);
    } catch (error) {
      console.error('Error loading project:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-200 dark:border-slate-700 border-t-primary-600"></div>
          <p className="text-sm text-slate-400 dark:text-slate-500">Cargando proyecto...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-5">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 px-6 py-16 text-center">
          <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-3">
            <FolderKanban className="w-6 h-6 text-slate-400 dark:text-slate-500" />
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            Proyecto no encontrado
          </p>
          <Link
            to="/proyectos"
            className="inline-flex items-center gap-1.5 mt-4 text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a la lista
          </Link>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'resumen', label: 'Resumen', icon: BarChart3 },
    { id: 'inicio', label: 'Inicio', icon: Target },
    { id: 'planificacion', label: 'Planificacion', icon: FileText },
    { id: 'ejecucion', label: 'Ejecucion', icon: Zap },
    { id: 'monitoreo', label: 'Monitoreo', icon: TrendingUp },
    { id: 'cierre', label: 'Cierre', icon: CheckCircle2 },
    { id: 'evaluacion', label: 'Evaluacion', icon: AlertCircle },
  ];

  const planificacionModules = [
    { id: 'marco-logico', label: 'Marco Logico', desc: 'Objetivos, indicadores y supuestos', icon: Target, color: 'blue' },
    { id: 'wbs', label: 'WBS', desc: 'Estructura de desglose del trabajo', icon: FolderKanban, color: 'emerald' },
    { id: 'cronograma', label: 'Cronograma', desc: 'Diagrama de Gantt', icon: Calendar, color: 'violet' },
    { id: 'presupuesto', label: 'Presupuesto', desc: 'Costos por actividad', icon: DollarSign, color: 'amber' },
    { id: 'riesgos', label: 'Riesgos', desc: 'Gestion de riesgos', icon: AlertTriangle, color: 'red' },
    { id: 'recursos', label: 'Recursos', desc: 'Asignacion de personal', icon: Users, color: 'slate' },
  ];

  return (
    <div className="p-5 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link
            to="/proyectos"
            className="inline-flex items-center gap-1.5 text-sm text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a Proyectos
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-primary-50 dark:bg-primary-900/30 rounded-xl flex items-center justify-center">
              <FolderKanban className="w-6 h-6 text-primary-500 dark:text-primary-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                {project.nombre}
              </h1>
              <p className="text-sm text-slate-400 dark:text-slate-500 font-mono">
                {project.codigo}
              </p>
            </div>
          </div>
        </div>
        <StatusBadge status={project.estado_nombre} />
      </div>

      {/* Botón Editar */}
      <div className="flex justify-end">
        <button
          onClick={() => navigate(`/proyectos/${id}/editar`)}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          Editar Proyecto
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-700">
        <nav className="flex gap-1 -mb-px overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap
                  ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                      : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        {activeTab === 'resumen' && dashboard && (
          <div className="p-6 space-y-6">
            {/* Project Info Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Info General */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-50 dark:bg-blue-900/30 rounded flex items-center justify-center">
                    <FileText className="w-3.5 h-3.5 text-blue-500" />
                  </div>
                  Informacion General
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <InfoItem label="Descripcion" value={project.descripcion || '-'} />
                  <InfoItem label="Tipo" value={project.tipo_nombre || '-'} />
                  <InfoItem label="Area" value={project.area_nombre || '-'} />
                  <InfoItem label="Sponsor" value={project.sponsor_nombre || '-'} />
                  <InfoItem label="PM" value={project.pm_nombre || '-'} />
                </div>
              </div>

              {/* Fechas y Presupuesto */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                  <div className="w-6 h-6 bg-violet-50 dark:bg-violet-900/30 rounded flex items-center justify-center">
                    <Calendar className="w-3.5 h-3.5 text-violet-500" />
                  </div>
                  Fechas y Presupuesto
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <InfoItem
                    label="Inicio"
                    value={
                      project.fecha_inicio_planeada
                        ? new Date(project.fecha_inicio_planeada).toLocaleDateString()
                        : '-'
                    }
                  />
                  <InfoItem
                    label="Fin"
                    value={
                      project.fecha_fin_planeada
                        ? new Date(project.fecha_fin_planeada).toLocaleDateString()
                        : '-'
                    }
                  />
                  <InfoItem
                    label="Presupuesto"
                    value={
                      project.presupuesto_planeado
                        ? `$${project.presupuesto_planeado.toLocaleString()}`
                        : '-'
                    }
                  />
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                icon={TrendingUp}
                label="Avance Fisico"
                value={`${dashboard.wbs.avance_promedio?.toFixed(1) || 0}%`}
                color="blue"
              />
              <StatCard
                icon={CheckCircle2}
                label="Actividades"
                value={`${dashboard.wbs.completadas}/${dashboard.wbs.total_actividades}`}
                color="emerald"
              />
              <StatCard
                icon={AlertTriangle}
                label="Riesgos Criticos"
                value={dashboard.risks.criticos}
                color="red"
              />
              <StatCard
                icon={AlertCircle}
                label="Issues Abiertos"
                value={dashboard.issues.abiertos}
                color="amber"
              />
            </div>
          </div>
        )}

        {activeTab === 'inicio' && (
          <div className="p-6">
            <div className="text-center py-12">
              <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-3">
                <Target className="w-6 h-6 text-slate-400 dark:text-slate-500" />
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                Modulo de Inicio
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                Acta de Constitucion, Stakeholders, Analisis de Viabilidad
              </p>
              <button
                onClick={() => navigate(`/proyectos/${id}/inicio`)}
                className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Abrir Modulo de Inicio
              </button>
            </div>
          </div>
        )}

        {activeTab === 'planificacion' && (
          <div className="p-6">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4">
              Modulos de Planificacion
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {planificacionModules.map((mod) => {
                const Icon = mod.icon;
                return (
                  <button
                    key={mod.id}
                    onClick={() => navigate(`/proyectos/${id}/planificacion/${mod.id}`)}
                    className="p-5 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600 hover:border-primary-300 dark:hover:border-primary-600 hover:shadow-md transition-all text-left group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-${mod.color}-50 dark:bg-${mod.color}-900/30`}>
                        <Icon className={`w-5 h-5 text-${mod.color}-500 dark:text-${mod.color}-400`} />
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-primary-400 transition-colors" />
                    </div>
                    <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      {mod.label}
                    </h4>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{mod.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'ejecucion' && (
          <div className="p-6">
            <div className="text-center py-12">
              <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-3">
                <Zap className="w-6 h-6 text-slate-400 dark:text-slate-500" />
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                Modulo de Ejecucion
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                Issues, Entregables, Bitacora
              </p>
              <button
                onClick={() => navigate(`/proyectos/${id}/ejecucion`)}
                className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Abrir Módulo de Ejecución
              </button>
            </div>
          </div>
        )}

        {activeTab === 'monitoreo' && (
          <div className="p-6">
            <div className="text-center py-12">
              <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="w-6 h-6 text-slate-400 dark:text-slate-500" />
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                Modulo de Monitoreo
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                Avance, Valor Ganado, KPIs, Cambios
              </p>
              <button
                onClick={() => navigate(`/proyectos/${id}/monitoreo`)}
                className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Abrir Módulo de Monitoreo
              </button>
            </div>
          </div>
        )}

        {activeTab === 'cierre' && (
          <div className="p-6">
            <div className="text-center py-12">
              <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-6 h-6 text-slate-400 dark:text-slate-500" />
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                Modulo de Cierre
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                Checklist, Lecciones, Transferencias
              </p>
              <button
                onClick={() => navigate(`/proyectos/${id}/cierre`)}
                className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Abrir Módulo de Cierre
              </button>
            </div>
          </div>
        )}

        {activeTab === 'evaluacion' && (
          <div className="p-6">
            <div className="text-center py-12">
              <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-3">
                <AlertCircle className="w-6 h-6 text-slate-400 dark:text-slate-500" />
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                Modulo de Evaluacion
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                Medios, Fines, Encuestas
              </p>
              <button
                onClick={() => navigate(`/proyectos/${id}/evaluacion`)}
                className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Abrir Módulo de Evaluación
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

interface InfoItemProps {
  label: string;
  value: string;
}

const InfoItem: React.FC<InfoItemProps> = ({ label, value }) => (
  <div>
    <p className="text-xs text-slate-400 dark:text-slate-500 mb-0.5">{label}</p>
    <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{value}</p>
  </div>
);

interface StatCardProps {
  icon: React.FC<{ className?: string }>;
  label: string;
  value: string | number;
  color: 'blue' | 'emerald' | 'red' | 'amber';
}

const colorMap = {
  blue: { bg: 'bg-blue-50 dark:bg-blue-900/30', icon: 'text-blue-500 dark:text-blue-400', ring: 'ring-blue-100 dark:ring-blue-800' },
  emerald: { bg: 'bg-emerald-50 dark:bg-emerald-900/30', icon: 'text-emerald-500 dark:text-emerald-400', ring: 'ring-emerald-100 dark:ring-emerald-800' },
  red: { bg: 'bg-red-50 dark:bg-red-900/30', icon: 'text-red-500 dark:text-red-400', ring: 'ring-red-100 dark:ring-red-800' },
  amber: { bg: 'bg-amber-50 dark:bg-amber-900/30', icon: 'text-amber-500 dark:text-amber-400', ring: 'ring-amber-100 dark:ring-amber-800' },
};

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, label, value, color }) => {
  const c = colorMap[color];
  return (
    <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600 p-4">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 ${c.bg} rounded-xl flex items-center justify-center ring-1 ${c.ring}`}>
          <Icon className={`w-5 h-5 ${c.icon}`} />
        </div>
        <div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">{label}</p>
          <p className="text-xl font-bold text-slate-800 dark:text-slate-100">{value}</p>
        </div>
      </div>
    </div>
  );
};

const StatusBadge: React.FC<{ status?: string }> = ({ status }) => {
  const styles: Record<string, string> = {
    Activo: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 ring-emerald-100 dark:ring-emerald-800',
    Cerrado: 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 ring-slate-200 dark:ring-slate-600',
    'En Revision': 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 ring-amber-100 dark:ring-amber-800',
    Borrador: 'bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 ring-slate-100 dark:ring-slate-700',
  };

  const s = styles[status || ''] || 'bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 ring-slate-100 dark:ring-slate-700';

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-lg ring-1 ring-inset ${s}`}
    >
      {status || 'Sin estado'}
    </span>
  );
};

export default ProjectDetailPage;
