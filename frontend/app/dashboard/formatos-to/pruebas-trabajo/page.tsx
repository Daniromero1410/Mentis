'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/app/components/layout/DashboardLayout';
import { ModuleGuard } from '@/app/components/guards/ModuleGuard';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
    AlertTriangle
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
import { toast } from 'sonner';

interface PruebaTrabajoTO {
    id: number;
    estado: string;
    fecha_creacion: string;
    fecha_actualizacion: string;
    trabajador_nombre?: string;
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

            // Client-side filtering for search (if backend doesn't support q=...)
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

    const estadoBadgeColor = (estado: string) => {
        switch (estado.toLowerCase()) {
            case 'completada':
                return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
            case 'borrador':
                return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
            default:
                return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        // Use substring to avoid timezone issues with pure dates if they are YYYY-MM-DD
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
                <div className="p-6 space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                                <ClipboardList className="w-8 h-8 text-blue-600" />
                                Pruebas de Trabajo (TO)
                            </h1>
                            <p className="text-gray-500 dark:text-gray-400 mt-1">
                                Gestión de pruebas de trabajo de Terapia Ocupacional
                            </p>
                        </div>
                        <Link href="/dashboard/formatos-to/pruebas-trabajo/nueva">
                            <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25">
                                <Plus className="mr-2 h-4 w-4" />
                                Nueva Prueba TO
                            </Button>
                        </Link>
                    </div>

                    {/* Filters */}
                    <Card className="border-gray-200 dark:border-[#333333]">
                        <CardContent className="p-4">
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                        <Input
                                            placeholder="Buscar por nombre, documento o empresa..."
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            onKeyPress={handleKeyPress}
                                            className="pl-10 bg-white dark:bg-[#1a1a1a] border-gray-200 dark:border-[#333333]"
                                        />
                                    </div>
                                </div>
                                <div className="w-full md:w-48">
                                    <Select value={estadoFilter} onValueChange={setEstadoFilter}>
                                        <SelectTrigger className="bg-white dark:bg-[#1a1a1a] border-gray-200 dark:border-[#333333]">
                                            <Filter className="mr-2 h-4 w-4" />
                                            <SelectValue placeholder="Estado" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="todos">Todos</SelectItem>
                                            <SelectItem value="borrador">Borrador</SelectItem>
                                            <SelectItem value="completada">Completada</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button
                                    onClick={handleSearch}
                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                    <Search className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Table */}
                    <Card className="border-gray-200 dark:border-[#333333]">
                        <CardContent className="p-0">
                            {loading ? (
                                <div className="flex items-center justify-center h-64">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                                </div>
                            ) : pruebas.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                                    <ClipboardList className="h-16 w-16 mb-4 opacity-20" />
                                    <p className="text-lg font-medium">No hay pruebas de trabajo TO</p>
                                    <p className="text-sm">Crea una nueva prueba para comenzar</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 dark:bg-[#1a1a1a] border-b border-gray-200 dark:border-[#333333]">
                                            <tr>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                                    Trabajador
                                                </th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                                    Documento
                                                </th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                                    Empresa
                                                </th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                                    Fecha
                                                </th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                                    Estado
                                                </th>
                                                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                                    Acciones
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white dark:bg-[#2a2a2a] divide-y divide-gray-100 dark:divide-[#333333]">
                                            {pruebas.map((prueba) => (
                                                <tr
                                                    key={prueba.id}
                                                    className="hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors"
                                                >
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                                                {prueba.trabajador_nombre
                                                                    ? prueba.trabajador_nombre.charAt(0).toUpperCase()
                                                                    : '?'}
                                                            </div>
                                                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                                {prueba.trabajador_nombre || 'Sin nombre'}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="text-sm text-gray-600 dark:text-gray-300">
                                                            {prueba.trabajador_documento || 'Sin documento'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                                            <FileText className="h-4 w-4 text-gray-400" />
                                                            {prueba.empresa || 'Sin empresa'}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="text-sm text-gray-600 dark:text-gray-300">
                                                            {formatDate(prueba.fecha_creacion)}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span
                                                            className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${estadoBadgeColor(
                                                                prueba.estado
                                                            )}`}
                                                        >
                                                            {prueba.estado.charAt(0).toUpperCase() + prueba.estado.slice(1)}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center justify-center gap-1">
                                                            {/* Ver (siempre visible) */}
                                                            <Link href={`/dashboard/formatos-to/pruebas-trabajo/${prueba.id}?mode=view`}>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="h-8 w-8 p-0 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600"
                                                                    title="Ver detalles"
                                                                >
                                                                    <Eye className="h-4 w-4" />
                                                                </Button>
                                                            </Link>

                                                            {/* Editar (siempre visible) */}
                                                            <Link href={`/dashboard/formatos-to/pruebas-trabajo/${prueba.id}?mode=edit`}>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="h-8 w-8 p-0 hover:bg-green-100 dark:hover:bg-green-900/30 text-green-600"
                                                                    title="Editar prueba"
                                                                >
                                                                    <Pencil className="h-4 w-4" />
                                                                </Button>
                                                            </Link>

                                                            {/* Descargar PDF (solo para completadas) */}
                                                            {prueba.estado.toLowerCase() === 'completada' && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => handleDownloadPDF(prueba)}
                                                                    className="h-8 w-8 p-0 hover:bg-purple-100 dark:hover:bg-purple-900/30 text-purple-600"
                                                                    title="Descargar PDF"
                                                                >
                                                                    <Download className="h-4 w-4" />
                                                                </Button>
                                                            )}

                                                            {/* Eliminar */}
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => openDeleteDialog(prueba)}
                                                                className="h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500"
                                                                title="Eliminar"
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

                            {/* Pagination */}
                            {!loading && pruebas.length > 0 && (
                                <div className="px-6 py-4 border-t border-gray-200 dark:border-[#333333] flex items-center justify-between">
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                        Mostrando {(page - 1) * limit + 1} a {Math.min(page * limit, total)} de {total}{' '}
                                        resultados
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setPage(page - 1)}
                                            disabled={page === 1}
                                            className="border-gray-200 dark:border-[#333333]"
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                        </Button>
                                        <div className="flex items-center gap-2 px-3 text-sm text-gray-700 dark:text-gray-300">
                                            Página {page} de {totalPages || 1}
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setPage(page + 1)}
                                            disabled={page >= totalPages}
                                            className="border-gray-200 dark:border-[#333333]"
                                        >
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Delete Confirmation Modal */}
                    <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <div className="flex items-center gap-3">
                                    <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                                        <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                                    </div>
                                    <div>
                                        <DialogTitle>Eliminar Prueba de Trabajo TO</DialogTitle>
                                        <DialogDescription>
                                            Esta acción no se puede deshacer
                                        </DialogDescription>
                                    </div>
                                </div>
                            </DialogHeader>
                            <div className="py-4">
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                    ¿Estás seguro de que deseas eliminar la prueba de{' '}
                                    <span className="font-semibold text-gray-900 dark:text-white">
                                        {pruebaToDelete?.trabajador_nombre || 'Sin nombre'}
                                    </span>
                                    ? Se eliminarán todos los datos asociados.
                                </p>
                            </div>
                            <DialogFooter className="gap-2 sm:gap-0">
                                <Button
                                    variant="outline"
                                    onClick={() => setDeleteDialogOpen(false)}
                                    disabled={deleting}
                                    className="border-gray-200 dark:border-[#444444]"
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    onClick={handleDelete}
                                    disabled={deleting}
                                    className="bg-red-600 hover:bg-red-700 text-white"
                                >
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
