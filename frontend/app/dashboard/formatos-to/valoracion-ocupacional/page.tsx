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

    return (
        <DashboardLayout>
            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                            <FileText className="h-8 w-8 text-blue-600" />
                            Valoración Ocupacional
                        </h1>
                        <p className="text-gray-500 mt-2">
                            Gestione las valoraciones de Terapia Ocupacional
                        </p>
                    </div>
                    <Button onClick={handleCreateNuevo} className="bg-blue-600 hover:bg-blue-700 text-white">
                        <Plus className="mr-2 h-4 w-4" />
                        Nueva Valoración
                    </Button>
                </div>

                {/* Filtros */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                        <Input
                            placeholder="Buscar por trabajador o documento..."
                            className="pl-9"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Select value={estadoFilter} onValueChange={setEstadoFilter}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Estado" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="todos">Todos</SelectItem>
                            <SelectItem value="borrador">Borrador</SelectItem>
                            <SelectItem value="completada">Completada</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Tabla */}
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
                            ) : filteredValoraciones.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-12 text-gray-500">
                                        <div className="flex flex-col items-center justify-center text-gray-500">
                                            <p className="text-lg font-medium text-gray-900 mb-1">
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
                                filteredValoraciones.map((item) => {
                                    const nombre = item.trabajador_nombre || 'Sin nombre';
                                    const initial = nombre.charAt(0).toUpperCase();
                                    return (
                                        <TableRow key={item.id} className="hover:bg-gray-50/50 transition-colors">
                                            <TableCell className="py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-sm">
                                                        {initial}
                                                    </div>
                                                    <span className="font-semibold text-gray-900 text-sm uppercase">{nombre}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-sm text-gray-600">
                                                {item.trabajador_documento || '-'}
                                            </TableCell>
                                            <TableCell className="text-sm text-gray-600">
                                                <div className="flex items-center gap-2">
                                                    <Briefcase className="h-3 w-3 text-gray-400" />
                                                    {item.empresa || '-'}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-sm text-gray-500">
                                                {format(new Date(item.fecha_creacion), "d 'de' MMMM, yyyy", { locale: es })}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant="secondary"
                                                    className={`font-medium rounded-full px-3 py-0.5 ${item.estado.toLowerCase() === 'completada'
                                                        ? 'bg-green-100 text-green-700 hover:bg-green-100'
                                                        : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100'
                                                        }`}
                                                >
                                                    {item.estado.toLowerCase() === 'completada' ? 'Completada' : 'Borrador'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => router.push(`/dashboard/formatos-to/valoracion-ocupacional/nueva?id=${item.id}&view=true`)}
                                                        className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                        title="Ver Detalles"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>

                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleEdit(item.id)}
                                                        className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                                                        title="Editar"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>

                                                    {item.estado.toLowerCase() === 'completada' && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleDownloadPDF(item.id)}
                                                            className="h-8 w-8 text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                                                            title="Descargar PDF"
                                                        >
                                                            <Download className="h-4 w-4" />
                                                        </Button>
                                                    )}

                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => confirmDelete(item.id)}
                                                        className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                        title="Eliminar valoración"
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
                            Anterior
                        </Button>
                        <span className="text-sm text-gray-600">
                            Página {page} de {totalPages}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                        >
                            Siguiente
                        </Button>
                    </div>
                )}
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
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            {isDeleting ? 'Eliminando...' : 'Eliminar Valoración'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    );
}
