'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/app/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
import {
    FileText,
    Plus,
    Search,
    Edit,
    Trash2,
    Download,
    Eye,
    CheckCircle,
    Clock,
    Filter,
    Briefcase
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

    // Paginación
    const [page, setPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const limit = 10;

    // Modal de eliminación
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        // Verificar permisos
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
            // Por ahora, es un endpoint falso o placeholder si no hemos hecho el PDF en el backend todavía
            // The custom api wrapper might not support responseType directly in get()
            const response = await api.get(`/formatos-to/valoracion-ocupacional/${id}/descargar-pdf`);

            const blob = new Blob([response as any], { type: 'application/pdf' });
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

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 flex items-center gap-3">
                            <FileText className="h-8 w-8 text-indigo-500" />
                            Valoración Ocupacional
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">
                            Gestione las valoraciones de Terapia Ocupacional
                        </p>
                    </div>
                    <Button onClick={handleCreateNuevo} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
                        <Plus className="h-4 w-4" />
                        Nueva Valoración
                    </Button>
                </div>

                {/* Filtros */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Buscar por nombre, documento o empresa..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <Filter className="h-4 w-4 text-gray-500" />
                                <Select value={estadoFilter} onValueChange={setEstadoFilter}>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Filtrar por estado" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="todos">Todos los estados</SelectItem>
                                        <SelectItem value="borrador">Borrador</SelectItem>
                                        <SelectItem value="completada">Completada</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Tabla */}
                <Card className="border-none shadow-md overflow-hidden">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-gray-50/50 dark:bg-gray-800/50">
                                <TableRow>
                                    <TableHead className="font-semibold px-6 py-4">Información del Trabajador</TableHead>
                                    <TableHead className="font-semibold py-4">Empresa</TableHead>
                                    <TableHead className="font-semibold py-4">Fecha</TableHead>
                                    <TableHead className="font-semibold py-4">Estado</TableHead>
                                    <TableHead className="text-right font-semibold px-6 py-4">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-48 text-center">
                                            <div className="flex flex-col items-center justify-center text-gray-500">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mb-4"></div>
                                                Cargando valoraciones...
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : filteredValoraciones.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-48 text-center">
                                            <div className="flex flex-col items-center justify-center text-gray-500">
                                                <FileText className="h-12 w-12 mb-4 text-gray-300 dark:text-gray-600" />
                                                <p className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
                                                    No hay valoraciones
                                                </p>
                                                <p className="text-sm">
                                                    {searchTerm || estadoFilter !== 'todos'
                                                        ? 'No se encontraron resultados para tu búsqueda.'
                                                        : 'Comienza creando una nueva valoración ocupacional.'}
                                                </p>
                                                {!(searchTerm || estadoFilter !== 'todos') && (
                                                    <Button onClick={handleCreateNuevo} variant="outline" className="mt-4">
                                                        <Plus className="h-4 w-4 mr-2" />
                                                        Crear la primera
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredValoraciones.map((item) => (
                                        <TableRow key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                            <TableCell className="px-6 py-4">
                                                <div className="font-medium text-gray-900 dark:text-gray-100">
                                                    {item.trabajador_nombre || 'Sin nombre'}
                                                </div>
                                                <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                                    <span className="text-xs px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded font-medium">CC</span>
                                                    {item.trabajador_documento || '---'}
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <div className="flex items-center gap-2">
                                                    <Briefcase className="h-4 w-4 text-gray-400" />
                                                    <span className="text-gray-700 dark:text-gray-300">
                                                        {item.empresa || 'No registrada'}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4 text-gray-600 dark:text-gray-400">
                                                {format(new Date(item.fecha_creacion), "d 'de' MMMM, yyyy", { locale: es })}
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <Badge
                                                    variant={item.estado === 'completada' ? 'default' : 'secondary'}
                                                    className={`capitalize flex items-center gap-1.5 w-fit ${item.estado === 'completada'
                                                        ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/40 dark:text-green-400'
                                                        : 'bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/40 dark:text-amber-400'
                                                        }`}
                                                >
                                                    {item.estado === 'completada' ? <CheckCircle className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
                                                    {item.estado}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleEdit(item.id)}
                                                        className="h-8 shadow-sm border border-gray-200 dark:border-gray-700 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-900/30 dark:hover:text-indigo-400"
                                                    >
                                                        {item.estado === 'completada' ? (
                                                            <><Eye className="h-4 w-4 mr-1.5" /> Ver</>
                                                        ) : (
                                                            <><Edit className="h-4 w-4 mr-1.5" /> Editar</>
                                                        )}
                                                    </Button>

                                                    {item.estado === 'completada' && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleDownloadPDF(item.id)}
                                                            className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/30"
                                                            title="Descargar PDF"
                                                        >
                                                            <Download className="h-4 w-4" />
                                                        </Button>
                                                    )}

                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => confirmDelete(item.id)}
                                                        className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30"
                                                        title="Eliminar valoración"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    {!loading && totalPages > 1 && (
                        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-900/30">
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                Mostrando {(page - 1) * limit + 1} a {Math.min(page * limit, totalItems)} de {totalItems} resultados
                            </span>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                >
                                    Anterior
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                >
                                    Siguiente
                                </Button>
                            </div>
                        </div>
                    )}
                </Card>
            </div>

            {/* Delete Modal */}
            <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-red-600 flex items-center gap-2">
                            <Trash2 className="h-5 w-5" />
                            Eliminar Valoración
                        </DialogTitle>
                        <DialogDescription>
                            ¿Estás seguro que deseas eliminar esta valoración ocupacional? Esta acción no se puede deshacer.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-4">
                        <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
                            Cancelar
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isDeleting}
                        >
                            {isDeleting ? 'Eliminando...' : 'Eliminar Valoración'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    );
}
