import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import {
  Plus,
  Users,
  Building2,
  FolderOpen,
  DollarSign,
  Shield,
  AlertCircle,
  X,
  Save,
  Loader2,
  Edit3,
  Trash2,
  Check,
  Settings,
} from 'lucide-react';

interface Item {
  id: number;
  nombre: string;
  [key: string]: any;
}

const AdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'usuarios' | 'areas' | 'tipos' | 'categorias' | 'roles' | 'estados'>('usuarios');
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);

  const [usuarioForm, setUsuarioForm] = useState({ nombre: '', email: '', password: '', rol: 'equipo', activo: true });
  const [areaForm, setAreaForm] = useState({ nombre: '', descripcion: '', director_id: '' });
  const [tipoForm, setTipoForm] = useState({ nombre: '', descripcion: '', activo: true });
  const [categoriaForm, setCategoriaForm] = useState({ nombre: '', tipo: 'opex', activo: true });
  const [rolForm, setRolForm] = useState({ nombre: '', tarifa_hora: '', activo: true });
  const [estadoForm, setEstadoForm] = useState({ nombre: '', color: '#3B82F6', orden: 0, es_estado_final: false });
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    loadItems();
  }, [activeTab]);

  const getEndpoints = () => ({
    usuarios: { get: '/admin/usuarios', post: '/admin/usuarios', put: '/admin/usuarios', del: '/admin/usuarios' },
    areas: { get: '/admin/areas', post: '/admin/areas', put: '/admin/areas', del: '/admin/areas' },
    tipos: { get: '/admin/tipos-proyecto', post: '/admin/tipos-proyecto', put: '/admin/tipos-proyecto', del: '/admin/tipos-proyecto' },
    categorias: { get: '/admin/categorias-costo', post: '/admin/categorias-costo', put: '/admin/categorias-costo', del: '/admin/categorias-costo' },
    roles: { get: '/admin/roles-proyecto', post: '/admin/roles-proyecto', put: '/admin/roles-proyecto', del: '/admin/roles-proyecto' },
    estados: { get: '/admin/estados-proyecto', post: '/admin/estados-proyecto', put: '/admin/estados-proyecto', del: '/admin/estados-proyecto' },
  });

  const loadItems = async () => {
    try {
      setLoading(true);
      const endpoints = getEndpoints();
      const [res, usersRes] = await Promise.all([
        api.get(endpoints[activeTab].get),
        api.get('/admin/usuarios').catch(() => ({ data: { data: [] } })),
      ]);
      setItems(res.data.data || []);
      setUsers(usersRes.data.data || []);
    } catch (err) {
      setError('Error al cargar');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingItem(null);
    setUsuarioForm({ nombre: '', email: '', password: '', rol: 'equipo', activo: true });
    setAreaForm({ nombre: '', descripcion: '', director_id: '' });
    setTipoForm({ nombre: '', descripcion: '', activo: true });
    setCategoriaForm({ nombre: '', tipo: 'opex', activo: true });
    setRolForm({ nombre: '', tarifa_hora: '', activo: true });
    setEstadoForm({ nombre: '', color: '#3B82F6', orden: 0, es_estado_final: false });
    setShowModal(true);
  };

  const openEditModal = (item: Item) => {
    setEditingItem(item);
    if (activeTab === 'usuarios') setUsuarioForm({ nombre: item.nombre, email: item.email, password: '', rol: item.rol, activo: Boolean(item.activo) });
    else if (activeTab === 'areas') setAreaForm({ nombre: item.nombre, descripcion: item.descripcion || '', director_id: item.director_id || '' });
    else if (activeTab === 'tipos') setTipoForm({ nombre: item.nombre, descripcion: item.descripcion || '', activo: Boolean(item.activo) });
    else if (activeTab === 'categorias') setCategoriaForm({ nombre: item.nombre, tipo: item.tipo, activo: Boolean(item.activo) });
    else if (activeTab === 'roles') setRolForm({ nombre: item.nombre, tarifa_hora: item.tarifa_hora || '', activo: Boolean(item.activo) });
    else setEstadoForm({ nombre: item.nombre, color: item.color || '#3B82F6', orden: item.orden || 0, es_estado_final: Boolean(item.es_estado_final) });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const endpoints = getEndpoints();
      let data: any;
      if (activeTab === 'usuarios') data = usuarioForm;
      else if (activeTab === 'areas') data = areaForm;
      else if (activeTab === 'tipos') data = tipoForm;
      else if (activeTab === 'categorias') data = categoriaForm;
      else if (activeTab === 'roles') data = { ...rolForm, tarifa_hora: Number(rolForm.tarifa_hora) || 0 };
      else data = { ...estadoForm, orden: Number(estadoForm.orden) || 0 };

      if (editingItem) {
        await api.put(`${endpoints[activeTab].put}/${editingItem.id}`, data);
      } else {
        await api.post(endpoints[activeTab].post, data);
      }
      setShowModal(false);
      await loadItems();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al guardar');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Eliminar este registro?')) return;
    try {
      const endpoints = getEndpoints();
      await api.delete(`${endpoints[activeTab].del}/${id}`);
      await loadItems();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al eliminar');
    }
  };

  const tabs = [
    { id: 'usuarios' as const, label: 'Usuarios', icon: Users, color: 'blue' },
    { id: 'areas' as const, label: 'Areas', icon: Building2, color: 'violet' },
    { id: 'tipos' as const, label: 'Tipos Proyecto', icon: FolderOpen, color: 'emerald' },
    { id: 'categorias' as const, label: 'Categorias Costo', icon: DollarSign, color: 'amber' },
    { id: 'roles' as const, label: 'Roles Proyecto', icon: Shield, color: 'red' },
    { id: 'estados' as const, label: 'Estados Proyecto', icon: AlertCircle, color: 'slate' },
  ];

  return (
    <div className="p-5 space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Administracion del Sistema</h1>
        <p className="text-xs text-slate-400 dark:text-slate-500">Gestion de configuracion general</p>
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
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-slate-400" />
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              {tabs.find((t) => t.id === activeTab)?.label}
            </h2>
            <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded-full">
              {items.length}
            </span>
          </div>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 bg-primary-600 text-white px-3 py-2 rounded-lg text-xs font-medium hover:bg-primary-700 transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            Nuevo
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-200 dark:border-slate-700 border-t-primary-600"></div>
              <p className="text-sm text-slate-400 dark:text-slate-500">Cargando...</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700">
                  {activeTab === 'usuarios' && (
                    <>
                      <th className="text-left px-6 py-3 text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Nombre</th>
                      <th className="text-left px-6 py-3 text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Email</th>
                      <th className="text-center px-6 py-3 text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Rol</th>
                      <th className="text-center px-6 py-3 text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Activo</th>
                    </>
                  )}
                  {activeTab === 'areas' && (
                    <>
                      <th className="text-left px-6 py-3 text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Nombre</th>
                      <th className="text-left px-6 py-3 text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Descripcion</th>
                      <th className="text-left px-6 py-3 text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Director</th>
                    </>
                  )}
                  {activeTab === 'tipos' && (
                    <>
                      <th className="text-left px-6 py-3 text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Nombre</th>
                      <th className="text-left px-6 py-3 text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Descripcion</th>
                      <th className="text-center px-6 py-3 text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Activo</th>
                    </>
                  )}
                  {activeTab === 'categorias' && (
                    <>
                      <th className="text-left px-6 py-3 text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Nombre</th>
                      <th className="text-center px-6 py-3 text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Tipo</th>
                      <th className="text-center px-6 py-3 text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Activo</th>
                    </>
                  )}
                  {activeTab === 'roles' && (
                    <>
                      <th className="text-left px-6 py-3 text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Nombre</th>
                      <th className="text-right px-6 py-3 text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Tarifa/Hora</th>
                      <th className="text-center px-6 py-3 text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Activo</th>
                    </>
                  )}
                  {activeTab === 'estados' && (
                    <>
                      <th className="text-left px-6 py-3 text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Nombre</th>
                      <th className="text-center px-6 py-3 text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Color</th>
                      <th className="text-center px-6 py-3 text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Orden</th>
                      <th className="text-center px-6 py-3 text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Final</th>
                    </>
                  )}
                  <th className="text-right px-6 py-3 text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Settings className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">No hay registros</p>
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group">
                      {activeTab === 'usuarios' && (
                        <>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center text-primary-700 dark:text-primary-300 font-semibold text-xs">
                                {item.nombre?.charAt(0).toUpperCase()}
                              </div>
                              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{item.nombre}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">{item.email}</td>
                          <td className="px-6 py-4 text-center">
                            <span className="inline-flex px-2 py-0.5 text-[10px] font-semibold rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 capitalize">
                              {item.rol}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            {item.activo ? (
                              <span className="inline-flex items-center justify-center w-5 h-5 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
                                <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                              </span>
                            ) : (
                              <span className="inline-flex items-center justify-center w-5 h-5 bg-slate-100 dark:bg-slate-700 rounded-full">
                                <X className="w-3 h-3 text-slate-400" />
                              </span>
                            )}
                          </td>
                        </>
                      )}
                      {activeTab === 'areas' && (
                        <>
                          <td className="px-6 py-4 text-sm font-medium text-slate-700 dark:text-slate-200">{item.nombre}</td>
                          <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">{item.descripcion || '-'}</td>
                          <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">{item.director_nombre || '-'}</td>
                        </>
                      )}
                      {activeTab === 'tipos' && (
                        <>
                          <td className="px-6 py-4 text-sm font-medium text-slate-700 dark:text-slate-200">{item.nombre}</td>
                          <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">{item.descripcion || '-'}</td>
                          <td className="px-6 py-4 text-center">
                            {item.activo ? (
                              <span className="inline-flex items-center justify-center w-5 h-5 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
                                <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                              </span>
                            ) : (
                              <span className="inline-flex items-center justify-center w-5 h-5 bg-slate-100 dark:bg-slate-700 rounded-full">
                                <X className="w-3 h-3 text-slate-400" />
                              </span>
                            )}
                          </td>
                        </>
                      )}
                      {activeTab === 'categorias' && (
                        <>
                          <td className="px-6 py-4 text-sm font-medium text-slate-700 dark:text-slate-200">{item.nombre}</td>
                          <td className="px-6 py-4 text-center">
                            <span className={`inline-flex px-2 py-0.5 text-[10px] font-semibold rounded-md ${
                              item.tipo === 'capex'
                                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                                : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
                            }`}>
                              {item.tipo?.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            {item.activo ? (
                              <span className="inline-flex items-center justify-center w-5 h-5 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
                                <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                              </span>
                            ) : (
                              <span className="inline-flex items-center justify-center w-5 h-5 bg-slate-100 dark:bg-slate-700 rounded-full">
                                <X className="w-3 h-3 text-slate-400" />
                              </span>
                            )}
                          </td>
                        </>
                      )}
                      {activeTab === 'roles' && (
                        <>
                          <td className="px-6 py-4 text-sm font-medium text-slate-700 dark:text-slate-200">{item.nombre}</td>
                          <td className="px-6 py-4 text-right text-sm text-slate-600 dark:text-slate-300">${item.tarifa_hora || 0}/h</td>
                          <td className="px-6 py-4 text-center">
                            {item.activo ? (
                              <span className="inline-flex items-center justify-center w-5 h-5 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
                                <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                              </span>
                            ) : (
                              <span className="inline-flex items-center justify-center w-5 h-5 bg-slate-100 dark:bg-slate-700 rounded-full">
                                <X className="w-3 h-3 text-slate-400" />
                              </span>
                            )}
                          </td>
                        </>
                      )}
                      {activeTab === 'estados' && (
                        <>
                          <td className="px-6 py-4 text-sm font-medium text-slate-700 dark:text-slate-200">{item.nombre}</td>
                          <td className="px-6 py-4 text-center">
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-semibold rounded-md" style={{ backgroundColor: item.color + '20', color: item.color }}>
                              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                              {item.color}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center text-sm text-slate-600 dark:text-slate-300">{item.orden}</td>
                          <td className="px-6 py-4 text-center">
                            {item.es_estado_final ? (
                              <span className="inline-flex items-center justify-center w-5 h-5 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
                                <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                              </span>
                            ) : (
                              <span className="inline-flex items-center justify-center w-5 h-5 bg-slate-100 dark:bg-slate-700 rounded-full">
                                <X className="w-3 h-3 text-slate-400" />
                              </span>
                            )}
                          </td>
                        </>
                      )}
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
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                {editingItem ? 'Editar' : 'Nuevo'} {tabs.find((t) => t.id === activeTab)?.label}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-140px)]">
              {activeTab === 'usuarios' && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Nombre *</label>
                    <input type="text" value={usuarioForm.nombre} onChange={(e) => setUsuarioForm({ ...usuarioForm, nombre: e.target.value })} required
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Email *</label>
                    <input type="email" value={usuarioForm.email} onChange={(e) => setUsuarioForm({ ...usuarioForm, email: e.target.value })} required
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                      {editingItem ? 'Nueva Contrasena (vacio = no cambiar)' : 'Contrasena *'}
                    </label>
                    <input type="password" value={usuarioForm.password} onChange={(e) => setUsuarioForm({ ...usuarioForm, password: e.target.value })} {...(!editingItem && { required: true })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Rol</label>
                      <select value={usuarioForm.rol} onChange={(e) => setUsuarioForm({ ...usuarioForm, rol: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors">
                        <option value="admin">Admin</option>
                        <option value="pmo">PMO</option>
                        <option value="pm">PM</option>
                        <option value="equipo">Equipo</option>
                        <option value="sponsor">Sponsor</option>
                        <option value="visor">Visor</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Activo</label>
                      <select value={usuarioForm.activo ? '1' : '0'} onChange={(e) => setUsuarioForm({ ...usuarioForm, activo: e.target.value === '1' })}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors">
                        <option value="1">Si</option>
                        <option value="0">No</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'areas' && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Nombre *</label>
                    <input type="text" value={areaForm.nombre} onChange={(e) => setAreaForm({ ...areaForm, nombre: e.target.value })} required
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Descripcion</label>
                    <textarea value={areaForm.descripcion} onChange={(e) => setAreaForm({ ...areaForm, descripcion: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors resize-none" rows={2} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Director</label>
                    <select value={areaForm.director_id} onChange={(e) => setAreaForm({ ...areaForm, director_id: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors">
                      <option value="">Sin asignar</option>
                      {users.map((u: any) => (
                        <option key={u.id} value={u.id}>{u.nombre}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {activeTab === 'tipos' && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Nombre *</label>
                    <input type="text" value={tipoForm.nombre} onChange={(e) => setTipoForm({ ...tipoForm, nombre: e.target.value })} required
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Descripcion</label>
                    <textarea value={tipoForm.descripcion} onChange={(e) => setTipoForm({ ...tipoForm, descripcion: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors resize-none" rows={2} />
                  </div>
                </>
              )}

              {activeTab === 'categorias' && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Nombre *</label>
                    <input type="text" value={categoriaForm.nombre} onChange={(e) => setCategoriaForm({ ...categoriaForm, nombre: e.target.value })} required
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Tipo *</label>
                    <select value={categoriaForm.tipo} onChange={(e) => setCategoriaForm({ ...categoriaForm, tipo: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors">
                      <option value="capex">CAPEX</option>
                      <option value="opex">OPEX</option>
                    </select>
                  </div>
                </>
              )}

              {activeTab === 'roles' && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Nombre *</label>
                    <input type="text" value={rolForm.nombre} onChange={(e) => setRolForm({ ...rolForm, nombre: e.target.value })} required
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Tarifa por Hora ($)</label>
                    <input type="number" value={rolForm.tarifa_hora} onChange={(e) => setRolForm({ ...rolForm, tarifa_hora: e.target.value })} min="0" step="0.01"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors" />
                  </div>
                </>
              )}

              {activeTab === 'estados' && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Nombre *</label>
                    <input type="text" value={estadoForm.nombre} onChange={(e) => setEstadoForm({ ...estadoForm, nombre: e.target.value })} required
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Color</label>
                      <div className="flex items-center gap-2">
                        <input type="color" value={estadoForm.color} onChange={(e) => setEstadoForm({ ...estadoForm, color: e.target.value })}
                          className="w-10 h-10 rounded border border-slate-200 dark:border-slate-600 cursor-pointer" />
                        <input type="text" value={estadoForm.color} onChange={(e) => setEstadoForm({ ...estadoForm, color: e.target.value })}
                          className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 font-mono" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Orden</label>
                      <input type="number" value={estadoForm.orden} onChange={(e) => setEstadoForm({ ...estadoForm, orden: Number(e.target.value) })} min="0"
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Estado Final</label>
                    <select value={estadoForm.es_estado_final ? '1' : '0'} onChange={(e) => setEstadoForm({ ...estadoForm, es_estado_final: e.target.value === '1' })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors">
                      <option value="0">No</option>
                      <option value="1">Sí (Cierre o Cancelación)</option>
                    </select>
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
    </div>
  );
};

export default AdminPage;
