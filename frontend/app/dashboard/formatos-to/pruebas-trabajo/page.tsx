'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/app/components/layout/DashboardLayout';
import { ModuleGuard } from '@/app/components/guards/ModuleGuard';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
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
                            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                                <ClipboardList className="h-8 w-8 text-blue-600" />
                                Pruebas de Trabajo (TO)
                            </h1>
                            <p className="text-gray-500 mt-2">
                                Gestione las pruebas de trabajo de Terapia Ocupacional
                            </p>
                        </div>
                        <Link href="/dashboard/formatos-to/pruebas-trabajo/nueva">
                            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
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

                    <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
                                    <TableHead className="text-xs font-bold text-gray-500 uppercase tracking-wider py-4">TRABAJADOR</TableHead>
                                    <TableHead className="text-xs font-bold text-gray-500 uppercase tracking-wider py-4">DOCUMENTO</TableHead>
                                    <TableHead className="text-xs font-bold text-gray-500 uppercase tracking-wider py-4">EMPRESA</TableHead>
                                    <TableHead className="text-xs font-bold text-gray-500 uppercase tracking-wider py-4">FECHA</TableHead>
                                    <TableHead className="text-xs font-bold text-gray-500 uppercase tracking-wider py-4">ESTADO</TableHead>
                                    <TableHead className="text-xs font-bold text-gray-500 uppercase tracking-wider py-4 text-right">ACCIONES</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-12 text-gray-500">
                                            <div className="flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
                                        </TableCell>
                                    </TableRow>
                                ) : pruebas.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-12 text-gray-500">
                                            <div className="flex flex-col items-center justify-center text-gray-500">
                                                <p className="text-lg font-medium text-gray-900 mb-1">
                                                    No hay pruebas de trabajo TO
                                                </p>
                                                <p className="text-sm">
                                                    {search || estadoFilter !== 'todos'
                                                        ? 'No se encontraron resultados para tu búsqueda.'
                                                        : 'Comienza creando una nueva prueba de trabajo TO.'}
                                                </p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    pruebas.map((prueba) => {
                                        const nombre = prueba.trabajador_nombre || 'Sin nombre';
                                        const initial = nombre.charAt(0).toUpperCase();
                                        return (
                                            <TableRow key={prueba.id} className="hover:bg-gray-50/50 transition-colors">
                                                <TableCell className="py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-sm">
                                                            {initial}
                                                        </div>
                                                        <span className="font-semibold text-gray-900 text-sm uppercase">{nombre}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-sm text-gray-600">
                                                    {prueba.trabajador_documento || '-'}
                                                </TableCell>
                                                <TableCell className="text-sm text-gray-600 flex items-center gap-2">
                                                    <FileText className="h-3 w-3 text-gray-400" />
                                                    {prueba.empresa || '-'}
                                                </TableCell>
                                                <TableCell className="text-sm text-gray-500">
                                                    {formatDate(prueba.fecha_creacion)}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant="secondary"
                                                        className={`font-medium rounded-full px-3 py-0.5 ${prueba.estado.toLowerCase() === 'completada'
                                                            ? 'bg-green-100 text-green-700 hover:bg-green-100'
                                                            : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100'
                                                            }`}
                                                    >
                                                        {prueba.estado.toLowerCase() === 'completada' ? 'Completado' : 'Borrador'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Link href={`/dashboard/formatos-to/pruebas-trabajo/${prueba.id}?mode=view`}>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                                title="Ver detalles"
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        </Link>

                                                        <Link href={`/dashboard/formatos-to/pruebas-trabajo/${prueba.id}?mode=edit`}>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                                                                title="Editar prueba"
                                                            >
                                                                <Pencil className="h-4 w-4" />
                                                            </Button>
                                                        </Link>

                                                        {prueba.estado.toLowerCase() === 'completada' && (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => handleDownloadPDF(prueba)}
                                                                className="h-8 w-8 text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                                                                title="Descargar PDF"
                                                            >
                                                                <Download className="h-4 w-4" />
                                                            </Button>
                                                        )}

                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => openDeleteDialog(prueba)}
                                                            className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                            title="Eliminar"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    {!loading && totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 mt-4">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <span className="text-sm text-gray-600">
                                Página {page} de {totalPages}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page >= totalPages}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    )}

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
