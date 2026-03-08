'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/app/components/layout/DashboardLayout';
import { ModuleGuard } from '@/app/components/guards/ModuleGuard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { api } from '@/app/services/api';
import {
    Search,
    Plus,
    Filter,
    Download,
    Eye,
    Pencil,
    Trash2,
    ChevronLeft,
    ChevronRight,
    ClipboardList,
    FileText,
    AlertTriangle,
    CheckCircle2,
    Clock,
    ListFilter,
} from 'lucide-react';
import Link from 'next/link';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { toast } from '@/components/ui/sileo-toast';

interface PruebaTrabajoTO {
    id: number;
    estado: string;
    fecha_creacion: string;
    fecha_actualizacion: string;
    trabajador_nombre?: string;
    trabajador_tipo_documento?: string;
    trabajador_documento?: string;
    empresa?: string;
}

export default function PruebasTrabajoTOPage() {
    const [pruebas, setPruebas] = useState<PruebaTrabajoTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [estadoFilter, setEstadoFilter] = useState('todos');
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [pruebaToDelete, setPruebaToDelete] = useState<PruebaTrabajoTO | null>(null);
    const [deleting, setDeleting] = useState(false);
    const limit = 10;

    const fetchPruebas = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                skip: String((page - 1) * limit),
                limit: String(limit),
            });

            if (estadoFilter && estadoFilter !== 'todos') {
                params.append('estado', estadoFilter);
            }

            const response = await api.get<{ items: PruebaTrabajoTO[], total: number }>(
                `/formatos-to/pruebas-trabajo/?${params.toString()}`
            );

            let items = response.items || [];
            if (search) {
                const lowerSearch = search.toLowerCase();
                items = items.filter(p =>
                    (p.trabajador_nombre || '').toLowerCase().includes(lowerSearch) ||
                    (p.trabajador_documento || '').toLowerCase().includes(lowerSearch) ||
                    (p.empresa || '').toLowerCase().includes(lowerSearch)
                );
            }

            setPruebas(items);
            setTotal(response.total || 0);
        } catch (error) {
            console.error('Error:', error);
            toast.error('Error al cargar pruebas de trabajo TO');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPruebas();
    }, [page, estadoFilter, search]);

    const handleSearch = () => {
        setPage(1);
        fetchPruebas();
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleSearch();
    };

    const openDeleteDialog = (prueba: PruebaTrabajoTO) => {
        setPruebaToDelete(prueba);
        setDeleteDialogOpen(true);
    };

    const handleDelete = async () => {
        if (!pruebaToDelete) return;

        setDeleting(true);
        try {
            await api.delete(`/formatos-to/pruebas-trabajo/${pruebaToDelete.id}`);
            setDeleteDialogOpen(false);
            setPruebaToDelete(null);
            await fetchPruebas();
            toast.success('Prueba TO eliminada correctamente');
        } catch (error) {
            console.error('Error:', error);
            toast.error('Error al eliminar la prueba');
        } finally {
            setDeleting(false);
        }
    };

    const handleDownloadPDF = async (prueba: PruebaTrabajoTO) => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://mentis-production.up.railway.app';
            const response = await fetch(
                `${apiUrl}/formatos-to/pruebas-trabajo/${prueba.id}/descargar-pdf`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                }
            );

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const errorMessage = errorData.detail || 'Error al descargar PDF';
                throw new Error(errorMessage);
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const nombreArchivo = prueba.trabajador_nombre
                ? `Prueba_Trabajo_TO_${prueba.trabajador_nombre.replace(/\s+/g, '_')}.pdf`
                : `prueba_trabajo_to_${prueba.id}.pdf`;
            a.download = nombreArchivo;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            toast.success('PDF descargado correctamente');
        } catch (error) {
            console.error('Error:', error);
            const message = error instanceof Error ? error.message : 'Error al descargar el PDF';
            toast.error(message);
        }
    };

    const totalPages = Math.ceil(total / limit);

    const completadas = pruebas.filter(p => p.estado.toLowerCase() === 'completada').length;
    const borradores = pruebas.filter(p => p.estado.toLowerCase() === 'borrador').length;

    const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    return (
        <ModuleGuard requiredModule="pruebas_trabajo">
            <DashboardLayout>
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between anim-fade-in-up">
                        <div className="flex items-center gap-3 sm:gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/25 shrink-0">
                                <ClipboardList className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Pruebas de Trabajo (TO)</h1>
                                <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Gestione las pruebas de trabajo de Terapia Ocupacional</p>
                            </div>
                        </div>
                        <Link href="/dashboard/formatos-to/pruebas-trabajo/nueva" className="w-full sm:w-auto">
                            <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 rounded-xl gap-2 w-full sm:w-auto justify-center">
                                <Plus className="h-4 w-4" />
                                Nueva Prueba TO
                            </Button>
                        </Link>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-2 sm:gap-4 anim-fade-in-up delay-1">
                        <div className="bg-white rounded-2xl border border-gray-200 p-3 sm:p-4 flex items-center gap-2 sm:gap-3">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                                <ListFilter className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-lg sm:text-2xl font-bold text-gray-900">{total}</p>
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
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <Input
                                    placeholder="Buscar por nombre, documento o empresa..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    className="pl-10 bg-gray-50 border-gray-200 rounded-xl"
                                />
                            </div>
                            <div className="flex gap-2">
                                <div className="flex-1 sm:flex-none sm:w-44">
                                    <Select value={estadoFilter} onValueChange={setEstadoFilter}>
                                        <SelectTrigger className="bg-gray-50 border-gray-200 rounded-xl w-full">
                                            <Filter className="mr-2 h-4 w-4 text-gray-400" />
                                            <SelectValue placeholder="Estado" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="todos">Todos</SelectItem>
                                            <SelectItem value="borrador">Borrador</SelectItem>
                                            <SelectItem value="completada">Completada</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button onClick={handleSearch} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shrink-0">
                                    <Search className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden anim-fade-in-up delay-3">
                        {loading ? (
                            <div className="flex items-center justify-center h-64">
                                <div className="flex flex-col items-center gap-3">
                                    <div className="relative w-12 h-12">
                                        <div className="w-12 h-12 rounded-full border-4 border-blue-500/20"></div>
                                        <div className="absolute top-0 left-0 w-12 h-12 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
                                    </div>
                                    <p className="text-sm text-gray-500 animate-pulse">Cargando pruebas TO...</p>
                                </div>
                            </div>
                        ) : pruebas.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-64">
                                <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
                                    <ClipboardList className="h-8 w-8 text-blue-300" />
                                </div>
                                <p className="text-base font-semibold text-gray-700">No hay pruebas de trabajo TO</p>
                                <p className="text-sm text-gray-400 mt-1 mb-4">
                                    {search || estadoFilter !== 'todos'
                                        ? 'No se encontraron resultados para tu búsqueda.'
                                        : 'Comienza creando una nueva prueba de trabajo TO.'}
                                </p>
                                {!(search || estadoFilter !== 'todos') && (
                                    <Link href="/dashboard/formatos-to/pruebas-trabajo/nueva">
                                        <Button variant="outline" className="rounded-xl border-blue-200 text-blue-600 hover:bg-blue-50 gap-2">
                                            <Plus className="h-4 w-4" />
                                            Nueva Prueba TO
                                        </Button>
                                    </Link>
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
                                        {pruebas.map((prueba) => {
                                            const nombre = prueba.trabajador_nombre || 'Sin nombre';
                                            const initial = nombre.charAt(0).toUpperCase();
                                            return (
                                                <tr key={prueba.id} className="hover:bg-blue-50/30 transition-colors">
                                                    <td className="px-3 py-3 sm:px-6 sm:py-4">
                                                        <div className="flex items-center gap-2 sm:gap-3">
                                                            <div className="flex items-center justify-center w-9 h-9 rounded-full bg-blue-600 text-white font-bold text-sm shrink-0">
                                                                {initial}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <span className="font-semibold text-gray-900 text-sm uppercase block truncate">{nombre}</span>
                                                                <span className="sm:hidden text-xs text-gray-400 truncate block">
                                                                    {prueba.trabajador_documento || '-'} · {prueba.empresa || '-'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                        {prueba.trabajador_documento || '-'}
                                                    </td>
                                                    <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                                            <FileText className="h-3.5 w-3.5 text-gray-400" />
                                                            {prueba.empresa || '-'}
                                                        </div>
                                                    </td>
                                                    <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {formatDate(prueba.fecha_creacion)}
                                                    </td>
                                                    <td className="px-3 py-3 sm:px-6 sm:py-4 whitespace-nowrap">
                                                        <Badge
                                                            variant="secondary"
                                                            className={`font-medium rounded-full px-2.5 py-0.5 ${prueba.estado.toLowerCase() === 'completada'
                                                                ? 'bg-green-100 text-green-700 hover:bg-green-100'
                                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-100'
                                                                }`}
                                                        >
                                                            {prueba.estado.toLowerCase() === 'completada' ? 'Completado' : 'Borrador'}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-3 py-3 sm:px-6 sm:py-4 whitespace-nowrap">
                                                        <div className="flex items-center justify-end gap-1">
                                                            <Link href={`/dashboard/formatos-to/pruebas-trabajo/${prueba.id}?mode=view`}>
                                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg" title="Ver detalles">
                                                                    <Eye className="h-4 w-4" />
                                                                </Button>
                                                            </Link>
                                                            <Link href={`/dashboard/formatos-to/pruebas-trabajo/${prueba.id}?mode=edit`}>
                                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg" title="Editar prueba">
                                                                    <Pencil className="h-4 w-4" />
                                                                </Button>
                                                            </Link>
                                                            {prueba.estado.toLowerCase() === 'completada' && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => handleDownloadPDF(prueba)}
                                                                    className="h-8 w-8 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg"
                                                                    title="Descargar PDF"
                                                                >
                                                                    <Download className="h-4 w-4" />
                                                                </Button>
                                                            )}
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => openDeleteDialog(prueba)}
                                                                className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg"
                                                                title="Eliminar"
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
                        {!loading && pruebas.length > 0 && (
                            <div className="px-3 py-3 sm:px-6 sm:py-4 border-t border-gray-100 flex items-center justify-between gap-2">
                                <div className="hidden sm:block text-sm text-gray-500">
                                    Mostrando {(page - 1) * limit + 1}–{Math.min(page * limit, total)} de {total} resultados
                                </div>
                                <div className="text-xs text-gray-500 sm:hidden">
                                    {(page - 1) * limit + 1}–{Math.min(page * limit, total)} / {total}
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
                                        {page} / {totalPages || 1}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                        disabled={page >= totalPages}
                                        className="border-gray-200 rounded-lg"
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Delete Confirmation Modal */}
                    <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <div className="flex items-center gap-3">
                                    <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                                        <AlertTriangle className="h-6 w-6 text-red-600" />
                                    </div>
                                    <div>
                                        <DialogTitle>Eliminar Prueba de Trabajo TO</DialogTitle>
                                        <DialogDescription>Esta acción no se puede deshacer</DialogDescription>
                                    </div>
                                </div>
                            </DialogHeader>
                            <div className="py-4">
                                <p className="text-sm text-gray-600">
                                    ¿Estás seguro de que deseas eliminar la prueba de{' '}
                                    <span className="font-semibold text-gray-900">
                                        {pruebaToDelete?.trabajador_nombre || 'Sin nombre'}
                                    </span>
                                    ? Se eliminarán todos los datos asociados.
                                </p>
                            </div>
                            <DialogFooter className="gap-2 sm:gap-0">
                                <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={deleting} className="border-gray-200 rounded-xl">
                                    Cancelar
                                </Button>
                                <Button onClick={handleDelete} disabled={deleting} className="bg-red-600 hover:bg-red-700 text-white rounded-xl">
                                    {deleting ? (
                                        <div className="flex items-center gap-2">
                                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                            Eliminando...
                                        </div>
                                    ) : (
                                        <>
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Eliminar
                                        </>
                                    )}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </DashboardLayout>
        </ModuleGuard>
    );
}
