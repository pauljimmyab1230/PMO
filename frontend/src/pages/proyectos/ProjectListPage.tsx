import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { projectService } from '../../services/project.service';
import { Project } from '../../types';
import {
  Plus,
  Search,
  FolderKanban,
  Calendar,
  DollarSign,
  User,
  ArrowRight,
  AlertCircle,
  Filter,
  LayoutGrid,
  List,
} from 'lucide-react';

const ProjectListPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setError(null);
      const response = await projectService.getAll();
      setProjects(response.data);
    } catch (err) {
      setError('Error al cargar los proyectos');
      console.error('Error loading projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.nombre.toLowerCase().includes(filter.toLowerCase()) ||
      p.codigo.toLowerCase().includes(filter.toLowerCase());
    const matchesStatus = statusFilter === 'todos' || p.estado_nombre === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusOptions = [
    { value: 'todos', label: 'Todos' },
    { value: 'Activo', label: 'Activos' },
    { value: 'Cerrado', label: 'Cerrados' },
    { value: 'En Revision', label: 'En Revision' },
    { value: 'Borrador', label: 'Borradores' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-200 dark:border-slate-700 border-t-primary-600"></div>
          <p className="text-sm text-slate-400 dark:text-slate-500">Cargando proyectos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Proyectos</h1>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-0.5">
            {filteredProjects.length} proyecto{filteredProjects.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link
          to="/proyectos/nuevo"
          className="inline-flex items-center gap-2 bg-primary-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Nuevo Proyecto
        </Link>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">{error}</span>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-red-400 hover:text-red-600 transition-colors"
          >
            &times;
          </button>
        </div>
      )}

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre o codigo..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 hidden sm:block" />
          <div className="flex bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-1">
            {statusOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setStatusFilter(opt.value)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  statusFilter === opt.value
                    ? 'bg-primary-600 text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-1">
          <button
            onClick={() => setViewMode('table')}
            className={`p-2 rounded-md transition-colors ${
              viewMode === 'table'
                ? 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
            title="Vista tabla"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-md transition-colors ${
              viewMode === 'grid'
                ? 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
            title="Vista cuadricula"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Projects List */}
      {filteredProjects.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 px-6 py-16 text-center">
          <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-3">
            <FolderKanban className="w-6 h-6 text-slate-400 dark:text-slate-500" />
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            {filter || statusFilter !== 'todos' ? 'No se encontraron proyectos' : 'No hay proyectos registrados'}
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            {filter || statusFilter !== 'todos' ? 'Intenta con otros filtros' : 'Crea tu primer proyecto para comenzar'}
          </p>
          {!filter && statusFilter === 'todos' && (
            <Link
              to="/proyectos/nuevo"
              className="inline-flex items-center gap-1.5 mt-4 text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
            >
              <Plus className="w-4 h-4" />
              Crear proyecto
            </Link>
          )}
        </div>
      ) : viewMode === 'table' ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700">
                  <th className="text-left px-6 py-3 text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Codigo
                  </th>
                  <th className="text-left px-6 py-3 text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Proyecto
                  </th>
                  <th className="text-left px-6 py-3 text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="text-left px-6 py-3 text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    PM
                  </th>
                  <th className="text-left px-6 py-3 text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Presupuesto
                  </th>
                  <th className="text-left px-6 py-3 text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Fechas
                  </th>
                  <th className="text-right px-6 py-3 text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {filteredProjects.map((project) => (
                  <tr
                    key={project.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <span className="text-xs font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
                        {project.codigo}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-primary-50 dark:bg-primary-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FolderKanban className="w-4 h-4 text-primary-500 dark:text-primary-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                            {project.nombre}
                          </p>
                          {project.descripcion && (
                            <p className="text-xs text-slate-400 dark:text-slate-500 truncate max-w-xs">
                              {project.descripcion}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={project.estado_nombre} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center">
                          <User className="w-3 h-3 text-slate-500 dark:text-slate-400" />
                        </div>
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                          {project.pm_nombre || 'Sin asignar'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                        {project.presupuesto_planeado
                          ? `$${project.presupuesto_planeado.toLocaleString()}`
                          : '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {project.fecha_inicio_planeada && project.fecha_fin_planeada ? (
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>
                            {new Date(project.fecha_inicio_planeada).toLocaleDateString()} -{' '}
                            {new Date(project.fecha_fin_planeada).toLocaleDateString()}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-slate-400 dark:text-slate-500">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to={`/proyectos/${project.id}`}
                        className="inline-flex items-center gap-1 text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
                      >
                        Ver
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project) => (
            <Link
              key={project.id}
              to={`/proyectos/${project.id}`}
              className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 hover:shadow-md dark:hover:shadow-slate-900/20 transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-primary-50 dark:bg-primary-900/30 rounded-xl flex items-center justify-center">
                  <FolderKanban className="w-5 h-5 text-primary-500 dark:text-primary-400" />
                </div>
                <StatusBadge status={project.estado_nombre} />
              </div>
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                {project.nombre}
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 mb-4 line-clamp-2">
                {project.descripcion || 'Sin descripcion'}
              </p>
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                  {project.presupuesto_planeado && (
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5" />
                      ${project.presupuesto_planeado.toLocaleString()}
                    </span>
                  )}
                  {project.fecha_inicio_planeada && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(project.fecha_inicio_planeada).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-primary-400 transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      )}
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
      className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-md ring-1 ring-inset ${s}`}
    >
      {status || 'Sin estado'}
    </span>
  );
};

export default ProjectListPage;
