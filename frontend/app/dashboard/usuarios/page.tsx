'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/app/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
            password: '', // No mostramos la contraseña
            acceso_valoraciones: usuario.acceso_valoraciones ?? false,
            acceso_pruebas_trabajo: usuario.acceso_pruebas_trabajo ?? false,
            acceso_formatos_to: usuario.acceso_formatos_to ?? false,
            activo: usuario.activo ?? true,
        });
        setModalOpen(true);
    };

    const handleOpenDelete = (usuario: Usuario) => {
        setSelectedUsuario(usuario);
        setDeleteModalOpen(true);
    };

    const handleSave = async () => {
        // Validaciones
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
                // Actualizar
                await api.put(`/usuarios/${selectedUsuario.id}`, {
                    nombre: formData.nombre,
                    apellido: formData.apellido,
                    rol: formData.rol,
                    activo: formData.activo,
                    acceso_valoraciones: formData.acceso_valoraciones,
                    acceso_pruebas_trabajo: formData.acceso_pruebas_trabajo,
                    acceso_formatos_to: formData.acceso_formatos_to,
                    ...(formData.password.trim() && { password: formData.password }),
                });
                toast.success('Usuario actualizado correctamente');
            } else {
                // Crear
                await api.post('/usuarios/', {
                    email: formData.email,
                    nombre: formData.nombre,
                    apellido: formData.apellido,
                    rol: formData.rol,
                    password: formData.password,
                    acceso_valoraciones: formData.acceso_valoraciones,
                    acceso_pruebas_trabajo: formData.acceso_pruebas_trabajo,
                    acceso_formatos_to: formData.acceso_formatos_to,
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
            admin: { label: 'Administrador', icon: Shield, color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
            supervisor: { label: 'Supervisor', icon: ShieldCheck, color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
            psicologo: { label: 'Psicólogo', icon: User, color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
            terapeuta_ocupacional: { label: 'Terapeuta Ocupacional', icon: Briefcase, color: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400' },
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

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
                            <Users className="h-8 w-8 text-indigo-500" />
                            Gestión de Usuarios
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            Administre los usuarios y sus permisos de acceso
                        </p>
                    </div>
                    <Button
                        onClick={handleOpenCreate}
                        className="gap-2 bg-indigo-500 hover:bg-indigo-600 text-white"
                    >
                        <Plus className="h-4 w-4" />
                        Nuevo Usuario
                    </Button>
                </div>

                {/* Search */}
                <form onSubmit={(e) => e.preventDefault()} autoComplete="off" className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        id="search_query_safe"
                        name="search_query_safe"
                        placeholder="Buscar por nombre o email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10"
                        autoComplete="off"
                        data-lpignore="true" // Agnostic attribute for LastPass/others
                    />
                </form>

                {/* Users Table */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Usuarios ({filteredUsuarios.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="text-center py-12">
                                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500 mx-auto"></div>
                                <p className="mt-3 text-gray-500">Cargando usuarios...</p>
                            </div>
                        ) : filteredUsuarios.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                                No se encontraron usuarios
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50 dark:bg-gray-800/50">
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b-2 border-gray-200 dark:border-gray-700">
                                                Usuario
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b-2 border-gray-200 dark:border-gray-700">
                                                Rol
                                            </th>
                                            <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b-2 border-gray-200 dark:border-gray-700">
                                                Acceso a Módulos
                                            </th>
                                            <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b-2 border-gray-200 dark:border-gray-700">
                                                Estado
                                            </th>
                                            <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b-2 border-gray-200 dark:border-gray-700">
                                                Acciones
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {filteredUsuarios.map((usuario, index) => (
                                            <tr
                                                key={usuario.id}
                                                className={`transition-colors hover:bg-orange-50 dark:hover:bg-orange-900/10 ${index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50/50 dark:bg-gray-800/30'
                                                    }`}
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                                                            {usuario.nombre.charAt(0)}{usuario.apellido.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-gray-900 dark:text-gray-100">
                                                                {usuario.nombre} {usuario.apellido}
                                                            </p>
                                                            <p className="text-sm text-gray-500 dark:text-gray-400">{usuario.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {getRolBadge(usuario.rol)}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-center gap-4">
                                                        <div className="flex items-center gap-2" title="Valoraciones Psicológicas">
                                                            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${usuario.acceso_valoraciones
                                                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                                : 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500'
                                                                }`}>
                                                                <ClipboardList className="h-3.5 w-3.5" />
                                                                <span className="hidden sm:inline">Val.</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2" title="Pruebas de Trabajo">
                                                            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${usuario.acceso_pruebas_trabajo
                                                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                                                : 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500'
                                                                }`}>
                                                                <Briefcase className="h-3.5 w-3.5" />
                                                                <span className="hidden sm:inline">P.T.</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2" title="Formatos TO">
                                                            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${usuario.acceso_formatos_to
                                                                ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                                                                : 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500'
                                                                }`}>
                                                                <FileText className="h-3.5 w-3.5" />
                                                                <span className="hidden sm:inline">F.TO</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${usuario.activo
                                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                        }`}>
                                                        {usuario.activo ? (
                                                            <><CheckCircle className="h-3.5 w-3.5" /> Activo</>
                                                        ) : (
                                                            <><XCircle className="h-3.5 w-3.5" /> Inactivo</>
                                                        )}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleOpenEdit(usuario)}
                                                            className="h-9 w-9 p-0 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600"
                                                            title="Editar usuario"
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleOpenDelete(usuario)}
                                                            className="h-9 w-9 p-0 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600"
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
                    </CardContent>
                </Card>
            </div>

            {/* Modal Crear/Editar Usuario */}
            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            {selectedUsuario ? <Pencil className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                            {selectedUsuario ? 'Editar Usuario' : 'Nuevo Usuario'}
                        </DialogTitle>
                        <DialogDescription>
                            {selectedUsuario
                                ? 'Modifique los datos del usuario. Deje la contraseña vacía para mantener la actual.'
                                : 'Complete los datos para crear un nuevo usuario.'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        {/* Nombre y Apellido */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="nombre">Nombre</Label>
                                <Input
                                    id="nombre"
                                    value={formData.nombre}
                                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                    placeholder="Nombre"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="apellido">Apellido</Label>
                                <Input
                                    id="apellido"
                                    value={formData.apellido}
                                    onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                                    placeholder="Apellido"
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <Label htmlFor="email" className="flex items-center gap-2">
                                <Mail className="h-4 w-4" />
                                Email
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="correo@ejemplo.com"
                                disabled={!!selectedUsuario}
                            />
                            {selectedUsuario && (
                                <p className="text-xs text-gray-500">El email no se puede modificar</p>
                            )}
                        </div>

                        {/* Contraseña */}
                        <div className="space-y-2">
                            <Label htmlFor="password" className="flex items-center gap-2">
                                <Lock className="h-4 w-4" />
                                Contraseña {selectedUsuario && '(dejar vacío para mantener)'}
                            </Label>
                            <Input
                                id="password"
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                placeholder={selectedUsuario ? '••••••••' : 'Contraseña'}
                            />
                        </div>

                        {/* Rol */}
                        <div className="space-y-2">
                            <Label>Rol</Label>
                            <div className="grid grid-cols-4 gap-2">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, rol: 'psicologo' })}
                                    className={`flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all ${formData.rol === 'psicologo'
                                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    <User className={`h-5 w-5 ${formData.rol === 'psicologo' ? 'text-green-600' : 'text-gray-400'}`} />
                                    <span className={`text-xs font-medium ${formData.rol === 'psicologo' ? 'text-green-700 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`}>
                                        Psicólogo
                                    </span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, rol: 'terapeuta_ocupacional' })}
                                    className={`flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all ${formData.rol === 'terapeuta_ocupacional'
                                        ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20'
                                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    <Briefcase className={`h-5 w-5 ${formData.rol === 'terapeuta_ocupacional' ? 'text-teal-600' : 'text-gray-400'}`} />
                                    <span className={`text-xs font-medium ${formData.rol === 'terapeuta_ocupacional' ? 'text-teal-700 dark:text-teal-400' : 'text-gray-600 dark:text-gray-400'}`}>
                                        T. Ocupacional
                                    </span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, rol: 'supervisor' })}
                                    className={`flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all ${formData.rol === 'supervisor'
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    <ShieldCheck className={`h-5 w-5 ${formData.rol === 'supervisor' ? 'text-blue-600' : 'text-gray-400'}`} />
                                    <span className={`text-xs font-medium ${formData.rol === 'supervisor' ? 'text-blue-700 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`}>
                                        Supervisor
                                    </span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, rol: 'admin' })}
                                    className={`flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all ${formData.rol === 'admin'
                                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    <Shield className={`h-5 w-5 ${formData.rol === 'admin' ? 'text-purple-600' : 'text-gray-400'}`} />
                                    <span className={`text-xs font-medium ${formData.rol === 'admin' ? 'text-purple-700 dark:text-purple-400' : 'text-gray-600 dark:text-gray-400'}`}>
                                        Admin
                                    </span>
                                </button>
                            </div>
                        </div>

                        {/* Acceso a Módulos */}
                        <div className="space-y-3">
                            <Label>Acceso a Módulos</Label>
                            <div className="space-y-2 rounded-lg border p-3">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="acceso_valoraciones"
                                        checked={formData.acceso_valoraciones}
                                        onCheckedChange={(checked) =>
                                            setFormData({ ...formData, acceso_valoraciones: !!checked })
                                        }
                                    />
                                    <label htmlFor="acceso_valoraciones" className="flex items-center gap-2 text-sm cursor-pointer">
                                        <ClipboardList className="h-4 w-4 text-green-600" />
                                        Valoraciones Psicológicas
                                    </label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="acceso_pruebas_trabajo"
                                        checked={formData.acceso_pruebas_trabajo}
                                        onCheckedChange={(checked) =>
                                            setFormData({ ...formData, acceso_pruebas_trabajo: !!checked })
                                        }
                                    />
                                    <label htmlFor="acceso_pruebas_trabajo" className="flex items-center gap-2 text-sm cursor-pointer">
                                        <Briefcase className="h-4 w-4 text-blue-600" />
                                        Pruebas de Trabajo
                                    </label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="acceso_formatos_to"
                                        checked={formData.acceso_formatos_to}
                                        onCheckedChange={(checked) =>
                                            setFormData({ ...formData, acceso_formatos_to: !!checked })
                                        }
                                    />
                                    <label htmlFor="acceso_formatos_to" className="flex items-center gap-2 text-sm cursor-pointer">
                                        <FileText className="h-4 w-4 text-teal-600" />
                                        Formatos TO
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Estado Activo */}
                        {selectedUsuario && (
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="activo"
                                    checked={formData.activo}
                                    onCheckedChange={(checked) =>
                                        setFormData({ ...formData, activo: !!checked })
                                    }
                                />
                                <label htmlFor="activo" className="text-sm cursor-pointer">
                                    Usuario activo
                                </label>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setModalOpen(false)}>
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={saving}
                            className="bg-indigo-500 hover:bg-indigo-600 text-white"
                        >
                            {saving ? 'Guardando...' : selectedUsuario ? 'Guardar Cambios' : 'Crear Usuario'}
                        </Button>
                    </DialogFooter>
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
                        <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
                            Cancelar
                        </Button>
                        <Button
                            className="bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/25"
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



