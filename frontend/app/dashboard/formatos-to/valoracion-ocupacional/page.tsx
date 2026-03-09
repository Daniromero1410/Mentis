'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/app/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    FileText,
    Plus,
    Search,
    Edit,
    Trash2,
    Download,
    Eye,
    CheckCircle2,
    Clock,
    ListFilter,
    AlertTriangle,
    ChevronLeft,
    ChevronRight,
    Briefcase,
} from 'lucide-react';
import { api } from '@/app/services/api';
import { toast } from '@/components/ui/sileo-toast';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAuth } from '@/app/context/AuthContext';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface ValoracionOcupacionalListItem {
    id: number;
    estado: 'borrador' | 'completada';
    fecha_creacion: string;
    fecha_actualizacion: string;
    trabajador_nombre: string | null;
    trabajador_documento: string | null;
    empresa: string | null;
}

interface PaginatedResponse {
    items: ValoracionOcupacionalListItem[];
    total: number;
}

export default function ValoracionOcupacionalPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [valoraciones, setValoraciones] = useState<ValoracionOcupacionalListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [estadoFilter, setEstadoFilter] = useState('todos');

    const [page, setPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const limit = 10;

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        if (user && !user.acceso_formatos_to && user.rol !== 'admin') {
            router.push('/dashboard');
            toast.error('No tienes permisos para acceder a este módulo');
            return;
        }

        fetchValoraciones();
    }, [page, estadoFilter, user]);

    const fetchValoraciones = async () => {
        try {
            setLoading(true);
            const skip = (page - 1) * limit;
            let url = `/formatos-to/valoracion-ocupacional/?skip=${skip}&limit=${limit}`;

            if (estadoFilter !== 'todos') {
                url += `&estado=${estadoFilter}`;
            }

            const data = await api.get<PaginatedResponse>(url);
            setValoraciones(data.items);
            setTotalItems(data.total);
        } catch (error: any) {
            toast.error('Error al cargar las valoraciones');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateNuevo = () => {
        router.push('/dashboard/formatos-to/valoracion-ocupacional/nueva');
    };

    const handleEdit = (id: number) => {
        router.push(`/dashboard/formatos-to/valoracion-ocupacional/nueva?id=${id}`);
    };

    const confirmDelete = (id: number) => {
        setItemToDelete(id);
        setDeleteModalOpen(true);
    };

    const handleDelete = async () => {
        if (!itemToDelete) return;

        try {
            setIsDeleting(true);
            await api.delete(`/formatos-to/valoracion-ocupacional/${itemToDelete}`);
            toast.success('Valoración eliminada correctamente');
            setDeleteModalOpen(false);
            setItemToDelete(null);
            fetchValoraciones();
        } catch (error: any) {
            toast.error(error.message || 'Error al eliminar la valoración');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleDownloadPDF = async (id: number) => {
        try {
            toast.success('Generando PDF...');
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://mentis-production.up.railway.app';
            const token = localStorage.getItem('token');
            const response = await fetch(`${apiUrl}/formatos-to/valoracion-ocupacional/${id}/descargar-pdf`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) throw new Error('Error al descargar PDF');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Valoracion_Ocupacional_${id}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error: any) {
            toast.error('Error al descargar el PDF. Asegúrate de que la valoración esté completada.');
        }
    };

    const filteredValoraciones = valoraciones.filter(v => {
        if (!searchTerm) return true;
        const searchLower = searchTerm.toLowerCase();
        return (
            (v.trabajador_nombre?.toLowerCase() || '').includes(searchLower) ||
            (v.trabajador_documento?.toLowerCase() || '').includes(searchLower) ||
            (v.empresa?.toLowerCase() || '').includes(searchLower)
        );
    });

    const totalPages = Math.ceil(totalItems / limit);

    const completadas = valoraciones.filter(v => v.estado.toLowerCase() === 'completada').length;
    const borradores = valoraciones.filter(v => v.estado.toLowerCase() === 'borrador').length;

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between anim-fade-in-up">
                    <div className="flex items-center gap-3 sm:gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-brand-600 flex items-center justify-center shadow-lg shadow-brand-500/25 shrink-0">
                            <FileText className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Valoración Ocupacional</h1>
                            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Gestione las valoraciones de Terapia Ocupacional</p>
                        </div>
                    </div>
                    <Button onClick={handleCreateNuevo} className="bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-500/20 rounded-xl gap-2 w-full sm:w-auto justify-center">
                        <Plus className="h-4 w-4" />
                        Nueva Valoración
                    </Button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 sm:gap-4 anim-fade-in-up delay-1">
                    <div className="bg-white rounded-2xl border border-gray-200 p-3 sm:p-4 flex items-center gap-2 sm:gap-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
                            <ListFilter className="h-4 w-4 sm:h-5 sm:w-5 text-brand-600" />
                        </div>
                        <div>
                            <p className="text-lg sm:text-2xl font-bold text-gray-900">{totalItems}</p>
                            <p className="text-[10px] sm:text-xs text-gray-500">Total</p>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl border border-gray-200 p-3 sm:p-4 flex items-center gap-2 sm:gap-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
                            <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-lg sm:text-2xl font-bold text-gray-900">{completadas}</p>
                            <p className="text-[10px] sm:text-xs text-gray-500">Completadas</p>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl border border-gray-200 p-3 sm:p-4 flex items-center gap-2 sm:gap-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
                            <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
                        </div>
                        <div>
                            <p className="text-lg sm:text-2xl font-bold text-gray-900">{borradores}</p>
                            <p className="text-[10px] sm:text-xs text-gray-500">Borradores</p>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-2xl border border-gray-200 p-4 anim-fade-in-up delay-2">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Buscar por trabajador o documento..."
                                className="pl-10 bg-gray-50 border-gray-200 rounded-xl"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Select value={estadoFilter} onValueChange={setEstadoFilter}>
                            <SelectTrigger className="w-full sm:w-44 bg-gray-50 border-gray-200 rounded-xl">
                                <SelectValue placeholder="Estado" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="todos">Todos</SelectItem>
                                <SelectItem value="borrador">Borrador</SelectItem>
                                <SelectItem value="completada">Completada</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden anim-fade-in-up delay-3">
                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="flex flex-col items-center gap-3">
                                <div className="relative w-12 h-12">
                                    <div className="w-12 h-12 rounded-full border-4 border-brand-500/20"></div>
                                    <div className="absolute top-0 left-0 w-12 h-12 rounded-full border-4 border-brand-600 border-t-transparent animate-spin"></div>
                                </div>
                                <p className="text-sm text-gray-500 animate-pulse">Cargando valoraciones...</p>
                            </div>
                        </div>
                    ) : filteredValoraciones.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64">
                            <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center mb-4">
                                <FileText className="h-8 w-8 text-brand-300" />
                            </div>
                            <p className="text-base font-semibold text-gray-700">No hay valoraciones ocupacionales</p>
                            <p className="text-sm text-gray-400 mt-1 mb-4">
                                {searchTerm || estadoFilter !== 'todos'
                                    ? 'No se encontraron resultados para tu búsqueda.'
                                    : 'Comienza creando una nueva valoración ocupacional.'}
                            </p>
                            {!(searchTerm || estadoFilter !== 'todos') && (
                                <Button onClick={handleCreateNuevo} variant="outline" className="rounded-xl border-brand-200 text-brand-600 hover:bg-brand-50 gap-2">
                                    <Plus className="h-4 w-4" />
                                    Crear la primera
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50/80 border-b border-gray-100">
                                    <tr>
                                        <th className="px-3 py-3 sm:px-6 sm:py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Trabajador</th>
                                        <th className="hidden sm:table-cell px-3 py-3 sm:px-6 sm:py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Documento</th>
                                        <th className="hidden sm:table-cell px-3 py-3 sm:px-6 sm:py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Empresa</th>
                                        <th className="hidden md:table-cell px-3 py-3 sm:px-6 sm:py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Fecha</th>
                                        <th className="px-3 py-3 sm:px-6 sm:py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Estado</th>
                                        <th className="px-3 py-3 sm:px-6 sm:py-3.5 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredValoraciones.map((item) => {
                                        const nombre = item.trabajador_nombre || 'Sin nombre';
                                        const initial = nombre.charAt(0).toUpperCase();
                                        return (
                                            <tr key={item.id} className="hover:bg-brand-50/30 transition-colors">
                                                <td className="px-3 py-3 sm:px-6 sm:py-4">
                                                    <div className="flex items-center gap-2 sm:gap-3">
                                                        <div className="flex items-center justify-center w-9 h-9 rounded-full bg-brand-600 text-white font-bold text-sm shrink-0">
                                                            {initial}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <span className="font-semibold text-gray-900 text-sm uppercase block truncate">{nombre}</span>
                                                            <span className="sm:hidden text-xs text-gray-400 truncate block">
                                                                {item.trabajador_documento || '-'} · {item.empresa || '-'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                    {item.trabajador_documento || '-'}
                                                </td>
                                                <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <Briefcase className="h-3.5 w-3.5 text-gray-400" />
                                                        {item.empresa || '-'}
                                                    </div>
                                                </td>
                                                <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {format(new Date(item.fecha_creacion), "d 'de' MMMM, yyyy", { locale: es })}
                                                </td>
                                                <td className="px-3 py-3 sm:px-6 sm:py-4 whitespace-nowrap">
                                                    <Badge
                                                        variant="secondary"
                                                        className={`font-medium rounded-full px-2.5 py-0.5 ${item.estado.toLowerCase() === 'completada'
                                                            ? 'bg-green-100 text-green-700 hover:bg-green-100'
                                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-100'
                                                            }`}
                                                    >
                                                        {item.estado.toLowerCase() === 'completada' ? 'Completada' : 'Borrador'}
                                                    </Badge>
                                                </td>
                                                <td className="px-3 py-3 sm:px-6 sm:py-4 whitespace-nowrap">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => router.push(`/dashboard/formatos-to/valoracion-ocupacional/nueva?id=${item.id}&view=true`)}
                                                            className="h-8 w-8 text-brand-600 hover:text-brand-700 hover:bg-brand-50 rounded-lg"
                                                            title="Ver Detalles"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleEdit(item.id)}
                                                            className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg"
                                                            title="Editar"
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        {item.estado.toLowerCase() === 'completada' && (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => handleDownloadPDF(item.id)}
                                                                className="h-8 w-8 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg"
                                                                title="Descargar PDF"
                                                            >
                                                                <Download className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => confirmDelete(item.id)}
                                                            className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg"
                                                            title="Eliminar valoración"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    {!loading && valoraciones.length > 0 && totalPages > 1 && (
                        <div className="px-3 py-3 sm:px-6 sm:py-4 border-t border-gray-100 flex items-center justify-between gap-2">
                            <div className="hidden sm:block text-sm text-gray-500">
                                Página {page} de {totalPages}
                            </div>
                            <div className="text-xs text-gray-500 sm:hidden">
                                {page} / {totalPages}
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="border-gray-200 rounded-lg"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <span className="text-sm text-gray-700 px-1 sm:px-2">
                                    {page} / {totalPages}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="border-gray-200 rounded-lg"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Modal */}
            <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                                <AlertTriangle className="h-6 w-6 text-red-600" />
                            </div>
                            <div>
                                <DialogTitle>Eliminar Valoración</DialogTitle>
                                <DialogDescription>
                                    ¿Estás seguro que deseas eliminar esta valoración ocupacional? Esta acción no se puede deshacer.
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>
                    <DialogFooter className="mt-4 gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setDeleteModalOpen(false)} className="rounded-xl border-gray-200">
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="bg-red-600 hover:bg-red-700 text-white rounded-xl"
                        >
                            {isDeleting ? 'Eliminando...' : 'Eliminar Valoración'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    );
}
