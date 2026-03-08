'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/app/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { api } from '@/app/services/api';
import { toast } from '@/components/ui/sileo-toast';
import {
    Users,
    Plus,
    Pencil,
    Trash2,
    Search,
    Shield,
    ShieldCheck,
    User,
    Mail,
    Lock,
    ClipboardList,
    Briefcase,
    CheckCircle,
    XCircle,
    FileText,
    Activity,
} from 'lucide-react';

interface Usuario {
    id: number;
    email: string;
    nombre: string;
    apellido: string;
    rol: 'admin' | 'supervisor' | 'psicologo' | 'terapeuta_ocupacional';
    activo: boolean;
    acceso_valoraciones: boolean;
    acceso_pruebas_trabajo: boolean;
    acceso_formatos_to: boolean;
    acceso_analisis_exigencias_mental: boolean;
    acceso_valoracion_ocupacional: boolean;
    created_at: string;
}

interface UsuarioForm {
    email: string;
    nombre: string;
    apellido: string;
    rol: 'admin' | 'supervisor' | 'psicologo' | 'terapeuta_ocupacional';
    password: string;
    acceso_valoraciones: boolean;
    acceso_pruebas_trabajo: boolean;
    acceso_formatos_to: boolean;
    acceso_analisis_exigencias_mental: boolean;
    activo: boolean;
}

const initialFormState: UsuarioForm = {
    email: '',
    nombre: '',
    apellido: '',
    rol: 'psicologo',
    password: '',
    acceso_valoraciones: true,
    acceso_pruebas_trabajo: true,
    acceso_formatos_to: false,
    acceso_analisis_exigencias_mental: false,
    activo: true,
};

export default function UsuariosPage() {
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null);
    const [formData, setFormData] = useState<UsuarioForm>(initialFormState);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchUsuarios();
    }, []);

    const fetchUsuarios = async () => {
        try {
            setLoading(true);
            const data = await api.get<Usuario[]>('/usuarios/');
            setUsuarios(data);
        } catch (error: any) {
            toast.error(error.message || 'Error al cargar usuarios');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenCreate = () => {
        setSelectedUsuario(null);
        setFormData(initialFormState);
        setModalOpen(true);
    };

    const handleOpenEdit = (usuario: Usuario) => {
        setSelectedUsuario(usuario);
        setFormData({
            email: usuario.email,
            nombre: usuario.nombre,
            apellido: usuario.apellido,
            rol: usuario.rol,
            password: '',
            acceso_valoraciones: usuario.acceso_valoraciones ?? false,
            acceso_pruebas_trabajo: usuario.acceso_pruebas_trabajo ?? false,
            acceso_formatos_to: usuario.acceso_formatos_to ?? false,
            acceso_analisis_exigencias_mental: usuario.acceso_analisis_exigencias_mental ?? false,
            activo: usuario.activo ?? true,
        });
        setModalOpen(true);
    };

    const handleOpenDelete = (usuario: Usuario) => {
        setSelectedUsuario(usuario);
        setDeleteModalOpen(true);
    };

    const handleSave = async () => {
        if (!formData.nombre.trim() || !formData.apellido.trim()) {
            toast.error('Nombre y apellido son requeridos');
            return;
        }
        if (!formData.email.trim()) {
            toast.error('El email es requerido');
            return;
        }
        if (!selectedUsuario && !formData.password.trim()) {
            toast.error('La contraseña es requerida para nuevos usuarios');
            return;
        }

        try {
            setSaving(true);
            if (selectedUsuario) {
                await api.put(`/usuarios/${selectedUsuario.id}`, {
                    nombre: formData.nombre,
                    apellido: formData.apellido,
                    rol: formData.rol,
                    activo: formData.activo,
                    acceso_valoraciones: formData.acceso_valoraciones,
                    acceso_pruebas_trabajo: formData.acceso_pruebas_trabajo,
                    acceso_formatos_to: formData.acceso_formatos_to,
                    acceso_analisis_exigencias_mental: formData.acceso_analisis_exigencias_mental,
                    ...(formData.password.trim() && { password: formData.password }),
                });
                toast.success('Usuario actualizado correctamente');
            } else {
                await api.post('/usuarios/', {
                    email: formData.email,
                    nombre: formData.nombre,
                    apellido: formData.apellido,
                    rol: formData.rol,
                    password: formData.password,
                    acceso_valoraciones: formData.acceso_valoraciones,
                    acceso_pruebas_trabajo: formData.acceso_pruebas_trabajo,
                    acceso_formatos_to: formData.acceso_formatos_to,
                    acceso_analisis_exigencias_mental: formData.acceso_analisis_exigencias_mental,
                });
                toast.success('Usuario creado correctamente');
            }
            setModalOpen(false);
            fetchUsuarios();
        } catch (error: any) {
            toast.error(error.message || 'Error al guardar usuario');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedUsuario) return;
        try {
            await api.delete(`/usuarios/${selectedUsuario.id}`);
            toast.success('Usuario eliminado correctamente');
            setDeleteModalOpen(false);
            fetchUsuarios();
        } catch (error: any) {
            toast.error(error.message || 'Error al eliminar usuario');
        }
    };

    const filteredUsuarios = usuarios.filter((u) => {
        const searchLower = search.toLowerCase();
        return (
            u.nombre.toLowerCase().includes(searchLower) ||
            u.apellido.toLowerCase().includes(searchLower) ||
            u.email.toLowerCase().includes(searchLower)
        );
    });

    const getRolBadge = (rol: string) => {
        const badges = {
            admin: { label: 'Administrador', icon: Shield, color: 'bg-purple-100 text-purple-700' },
            supervisor: { label: 'Supervisor', icon: ShieldCheck, color: 'bg-blue-100 text-blue-700' },
            psicologo: { label: 'Psicólogo', icon: User, color: 'bg-green-100 text-green-700' },
            terapeuta_ocupacional: { label: 'T. Ocupacional', icon: Briefcase, color: 'bg-teal-100 text-teal-700' },
        };
        const badge = badges[rol as keyof typeof badges] || badges.psicologo;
        const Icon = badge.icon;
        return (
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
                <Icon className="h-3 w-3" />
                {badge.label}
            </span>
        );
    };

    const activos = usuarios.filter(u => u.activo).length;
    const inactivos = usuarios.filter(u => !u.activo).length;

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between anim-fade-in-up">
                    <div className="flex items-center gap-3 sm:gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/25 shrink-0">
                            <Users className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
                            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Administra los usuarios y sus permisos de acceso</p>
                        </div>
                    </div>
                    <Button
                        onClick={handleOpenCreate}
                        className="bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 rounded-xl gap-2 w-full sm:w-auto justify-center"
                    >
                        <Plus className="h-4 w-4" />
                        Nuevo Usuario
                    </Button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 sm:gap-4 anim-fade-in-up delay-1">
                    <div className="bg-white rounded-2xl border border-gray-200 p-3 sm:p-4 flex items-center gap-2 sm:gap-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                            <Users className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-lg sm:text-2xl font-bold text-gray-900">{usuarios.length}</p>
                            <p className="text-[10px] sm:text-xs text-gray-500">Total</p>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl border border-gray-200 p-3 sm:p-4 flex items-center gap-2 sm:gap-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
                            <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-lg sm:text-2xl font-bold text-gray-900">{activos}</p>
                            <p className="text-[10px] sm:text-xs text-gray-500">Activos</p>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl border border-gray-200 p-3 sm:p-4 flex items-center gap-2 sm:gap-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                            <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />
                        </div>
                        <div>
                            <p className="text-lg sm:text-2xl font-bold text-gray-900">{inactivos}</p>
                            <p className="text-[10px] sm:text-xs text-gray-500">Inactivos</p>
                        </div>
                    </div>
                </div>

                {/* Search */}
                <div className="anim-fade-in-up delay-2">
                    <form onSubmit={(e) => e.preventDefault()} autoComplete="off" className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            id="search_query_safe"
                            name="search_query_safe"
                            placeholder="Buscar por nombre o email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10 bg-white border-gray-200 rounded-xl"
                            autoComplete="off"
                            data-lpignore="true"
                        />
                    </form>
                </div>

                {/* Users Table */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden anim-fade-in-up delay-3">
                    <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-gray-100 flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-semibold text-gray-700">Usuarios ({filteredUsuarios.length})</span>
                    </div>
                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="flex flex-col items-center gap-3">
                                <div className="relative w-12 h-12">
                                    <div className="w-12 h-12 rounded-full border-4 border-blue-500/20"></div>
                                    <div className="absolute top-0 left-0 w-12 h-12 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
                                </div>
                                <p className="text-sm text-gray-500 animate-pulse">Cargando usuarios...</p>
                            </div>
                        </div>
                    ) : filteredUsuarios.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-48 text-gray-500">
                            <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-3">
                                <Users className="h-7 w-7 text-blue-300" />
                            </div>
                            <p className="text-sm font-medium text-gray-700">No se encontraron usuarios</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-gray-50/80 border-b border-gray-100">
                                        <th className="px-3 py-3 sm:px-6 sm:py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Usuario</th>
                                        <th className="hidden sm:table-cell px-3 py-3 sm:px-6 sm:py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Rol</th>
                                        <th className="hidden md:table-cell px-3 py-3 sm:px-6 sm:py-3.5 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Módulos</th>
                                        <th className="px-3 py-3 sm:px-6 sm:py-3.5 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Estado</th>
                                        <th className="px-3 py-3 sm:px-6 sm:py-3.5 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredUsuarios.map((usuario) => (
                                        <tr key={usuario.id} className="hover:bg-blue-50/30 transition-colors">
                                            <td className="px-3 py-3 sm:px-6 sm:py-4">
                                                <div className="flex items-center gap-2 sm:gap-3">
                                                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-sm shrink-0">
                                                        {usuario.nombre.charAt(0)}{usuario.apellido.charAt(0)}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-semibold text-gray-900 text-sm truncate">
                                                            {usuario.nombre} {usuario.apellido}
                                                        </p>
                                                        <p className="text-xs text-gray-500 truncate">{usuario.email}</p>
                                                        <div className="sm:hidden mt-1">
                                                            {getRolBadge(usuario.rol)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="hidden sm:table-cell px-6 py-4">
                                                {getRolBadge(usuario.rol)}
                                            </td>
                                            <td className="hidden md:table-cell px-6 py-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    <div title="Valoraciones Psicológicas" className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium ${usuario.acceso_valoraciones ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                                                        <ClipboardList className="h-3.5 w-3.5" />
                                                        <span>Val.</span>
                                                    </div>
                                                    <div title="Pruebas de Trabajo" className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium ${usuario.acceso_pruebas_trabajo ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-400'}`}>
                                                        <Briefcase className="h-3.5 w-3.5" />
                                                        <span>P.T.</span>
                                                    </div>
                                                    <div title="Formatos TO" className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium ${usuario.acceso_formatos_to ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-400'}`}>
                                                        <FileText className="h-3.5 w-3.5" />
                                                        <span>F.TO</span>
                                                    </div>
                                                    <div title="Análisis Exigencias Mental" className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium ${usuario.acceso_analisis_exigencias_mental ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-400'}`}>
                                                        <Activity className="h-3.5 w-3.5" />
                                                        <span>A.E.M</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-3 py-3 sm:px-6 sm:py-4 text-center">
                                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${usuario.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                    {usuario.activo ? (
                                                        <><CheckCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> <span className="hidden sm:inline">Activo</span></>
                                                    ) : (
                                                        <><XCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> <span className="hidden sm:inline">Inactivo</span></>
                                                    )}
                                                </span>
                                            </td>
                                            <td className="px-3 py-3 sm:px-6 sm:py-4">
                                                <div className="flex items-center justify-center gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleOpenEdit(usuario)}
                                                        className="h-8 w-8 p-0 rounded-lg hover:bg-blue-100 text-blue-600"
                                                        title="Editar usuario"
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleOpenDelete(usuario)}
                                                        className="h-8 w-8 p-0 rounded-lg hover:bg-red-100 text-red-600"
                                                        title="Eliminar usuario"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Crear/Editar Usuario */}
            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                <DialogContent className="p-0 gap-0 w-full max-w-lg sm:max-w-[540px] max-h-[95dvh] flex flex-col overflow-hidden rounded-2xl">
                    {/* Gradient header */}
                    <div className="bg-blue-600 px-5 pt-5 pb-6 shrink-0">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg border border-white/30 shrink-0">
                                {selectedUsuario ? (
                                    <Pencil className="h-6 w-6 text-white" />
                                ) : (
                                    <Plus className="h-6 w-6 text-white" />
                                )}
                            </div>
                            <div>
                                <DialogTitle className="text-lg font-bold text-white">
                                    {selectedUsuario ? 'Editar Usuario' : 'Nuevo Usuario'}
                                </DialogTitle>
                                <DialogDescription className="text-sm text-blue-100 mt-0.5">
                                    {selectedUsuario
                                        ? 'Modifica los datos y permisos del usuario'
                                        : 'Completa los datos para crear un nuevo acceso'}
                                </DialogDescription>
                            </div>
                        </div>
                    </div>

                    {/* Scrollable form body */}
                    <div className="overflow-y-auto flex-1 px-5 py-5 space-y-5">
                        {/* Nombre & Apellido */}
                        <div className="space-y-3">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Información Personal</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <Label htmlFor="nombre" className="text-xs font-semibold text-gray-600">Nombre</Label>
                                    <Input
                                        id="nombre"
                                        value={formData.nombre}
                                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                        placeholder="Nombre"
                                        className="h-10 rounded-xl border-gray-200 bg-gray-50/50 focus:border-blue-500"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="apellido" className="text-xs font-semibold text-gray-600">Apellido</Label>
                                    <Input
                                        id="apellido"
                                        value={formData.apellido}
                                        onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                                        placeholder="Apellido"
                                        className="h-10 rounded-xl border-gray-200 bg-gray-50/50 focus:border-blue-500"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="email" className="text-xs font-semibold text-gray-600 flex items-center gap-1.5">
                                    <Mail className="h-3.5 w-3.5 text-blue-500" />
                                    Correo Electrónico
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="correo@ejemplo.com"
                                        disabled={!!selectedUsuario}
                                        className={`h-10 rounded-xl border-gray-200 ${selectedUsuario ? 'bg-gray-100 text-gray-500 border-dashed pr-10' : 'bg-gray-50/50 focus:border-blue-500'}`}
                                    />
                                    {selectedUsuario && <Shield className="absolute right-3 top-3 h-4 w-4 text-gray-400" />}
                                </div>
                                {selectedUsuario && (
                                    <p className="text-[11px] text-gray-400 flex items-center gap-1 px-1">
                                        <Shield className="h-3 w-3" /> El email no se puede modificar
                                    </p>
                                )}
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="password" className="text-xs font-semibold text-gray-600 flex items-center gap-1.5">
                                    <Lock className="h-3.5 w-3.5 text-blue-500" />
                                    Contraseña {selectedUsuario && <span className="font-normal text-gray-400">(vacío = sin cambios)</span>}
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    placeholder={selectedUsuario ? '••••••••' : 'Mínimo 6 caracteres'}
                                    className="h-10 rounded-xl border-gray-200 bg-gray-50/50 focus:border-blue-500"
                                />
                            </div>
                        </div>

                        {/* Rol */}
                        <div className="space-y-3">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Rol del Usuario</p>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                {([
                                    { value: 'psicologo', label: 'Psicólogo', icon: User, color: 'green' },
                                    { value: 'terapeuta_ocupacional', label: 'T. Ocup.', icon: Briefcase, color: 'teal' },
                                    { value: 'supervisor', label: 'Supervisor', icon: ShieldCheck, color: 'blue' },
                                    { value: 'admin', label: 'Admin', icon: Shield, color: 'purple' },
                                ] as const).map((r) => {
                                    const RIcon = r.icon;
                                    const active = formData.rol === r.value;
                                    const colors: Record<string, string> = {
                                        green: active ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-500 hover:border-green-300',
                                        teal: active ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-gray-200 text-gray-500 hover:border-teal-300',
                                        blue: active ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-500 hover:border-blue-300',
                                        purple: active ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-200 text-gray-500 hover:border-purple-300',
                                    };
                                    return (
                                        <button
                                            key={r.value}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, rol: r.value })}
                                            className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${colors[r.color]}`}
                                        >
                                            <RIcon className="h-5 w-5" />
                                            <span className="text-xs font-semibold leading-tight text-center">{r.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Módulos */}
                        <div className="space-y-3">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Acceso a Módulos</p>
                            <div className="rounded-xl border border-gray-200 divide-y divide-gray-100 overflow-hidden">
                                {([
                                    { id: 'acceso_valoraciones', key: 'acceso_valoraciones', label: 'Valoraciones Psicológicas', icon: ClipboardList, color: 'text-green-600 bg-green-50' },
                                    { id: 'acceso_pruebas_trabajo', key: 'acceso_pruebas_trabajo', label: 'Pruebas de Trabajo', icon: Briefcase, color: 'text-blue-600 bg-blue-50' },
                                    { id: 'acceso_formatos_to', key: 'acceso_formatos_to', label: 'Formatos TO', icon: FileText, color: 'text-teal-600 bg-teal-50' },
                                    { id: 'acceso_analisis_exigencias_mental', key: 'acceso_analisis_exigencias_mental', label: 'Análisis Exigencias Mental', icon: Activity, color: 'text-yellow-600 bg-yellow-50' },
                                ] as const).map((mod) => {
                                    const MIcon = mod.icon;
                                    const checked = formData[mod.key as keyof UsuarioForm] as boolean;
                                    return (
                                        <label key={mod.id} htmlFor={mod.id} className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors">
                                            <div className={`p-1.5 rounded-lg ${mod.color}`}>
                                                <MIcon className="h-3.5 w-3.5" />
                                            </div>
                                            <span className="flex-1 text-sm text-gray-700">{mod.label}</span>
                                            <Checkbox
                                                id={mod.id}
                                                checked={checked}
                                                onCheckedChange={(v) => setFormData({ ...formData, [mod.key]: !!v })}
                                            />
                                        </label>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Estado (solo edición) */}
                        {selectedUsuario && (
                            <div className="rounded-xl border border-gray-200 overflow-hidden">
                                <label htmlFor="activo" className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors">
                                    <div className={`p-1.5 rounded-lg ${formData.activo ? 'text-green-600 bg-green-50' : 'text-red-500 bg-red-50'}`}>
                                        {formData.activo ? <CheckCircle className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                                    </div>
                                    <span className="flex-1 text-sm text-gray-700">Usuario activo</span>
                                    <Checkbox
                                        id="activo"
                                        checked={formData.activo}
                                        onCheckedChange={(v) => setFormData({ ...formData, activo: !!v })}
                                    />
                                </label>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-5 pb-5 pt-3 border-t border-gray-100 flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 shrink-0">
                        <Button variant="outline" onClick={() => setModalOpen(false)} className="flex-1 sm:flex-none rounded-xl border-gray-200 h-11">
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-11 shadow-md shadow-blue-500/20"
                        >
                            {saving ? 'Guardando...' : selectedUsuario ? 'Guardar Cambios' : 'Crear Usuario'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Modal Eliminar */}
            <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-red-600 flex items-center gap-2">
                            <Trash2 className="h-5 w-5" />
                            Eliminar Usuario
                        </DialogTitle>
                        <DialogDescription>
                            ¿Está seguro que desea eliminar el usuario{' '}
                            <strong>
                                {selectedUsuario?.nombre} {selectedUsuario?.apellido}
                            </strong>
                            ? Esta acción no se puede deshacer.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteModalOpen(false)} className="rounded-xl border-gray-200">
                            Cancelar
                        </Button>
                        <Button
                            className="bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/25 rounded-xl"
                            onClick={handleDelete}
                        >
                            Eliminar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    );
}
