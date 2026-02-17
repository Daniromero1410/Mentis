'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ModuleGuard } from '@/app/components/guards/ModuleGuard';
import { DashboardLayout } from '@/app/components/layout/DashboardLayout';
import {
    Plus, Search, FileText, Calendar, User,
    Eye, Edit, Trash2, ChevronLeft, ChevronRight, Activity, X
} from 'lucide-react';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { toast } from '@/components/ui/sileo-toast';

export default function AnalisisExigenciaPage() {
    const { token, user } = useAuth();
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    const [analisis, setAnalisis] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('todos');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const itemsPerPage = 10;

    const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null as number | null });

    const fetchAnalisis = async () => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams({
                skip: ((currentPage - 1) * itemsPerPage).toString(),
                limit: itemsPerPage.toString(),
            });

            if (statusFilter !== 'todos') {
                queryParams.append('estado', statusFilter);
            }

            const res = await fetch(`${API_URL}/formatos-to/analisis-exigencia/?${queryParams}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!res.ok) throw new Error('Error al cargar análisis');

            const data = await res.json();
            let items = data.items || [];

            // Client-side search filtering (backend usually handles specific search, but here we do simple filtering if backend doesn't support generic search param yet)
            if (searchTerm) {
                const term = searchTerm.toLowerCase();
                items = items.filter((a: any) =>
                    a.identificacion?.nombre_trabajador?.toLowerCase().includes(term) ||
                    a.identificacion?.numero_documento?.includes(term) ||
                    a.id?.toString().includes(term)
                );
            }

            setAnalisis(items);
            setTotalItems(data.total);
            setTotalPages(Math.ceil(data.total / itemsPerPage));

        } catch (error) {
            console.error(error);
            toast.error('Error al cargar los análisis de exigencia');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchAnalisis();
    }, [token, currentPage, statusFilter, searchTerm]);

    const handleDelete = async () => {
        if (!deleteModal.id) return;
        try {
            const res = await fetch(`${API_URL}/formatos-to/analisis-exigencia/${deleteModal.id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!res.ok) throw new Error('Error al eliminar');

            toast.success('Análisis eliminado correctamente');
            fetchAnalisis();
            setDeleteModal({ isOpen: false, id: null });
        } catch (error) {
            console.error(error);
            toast.error('No se pudo eliminar el análisis');
        }
    };

    const isAdminOrSupervisor = user?.rol === 'admin' || user?.rol === 'supervisor';

    return (
        <ModuleGuard requiredModule="formatos_to">
            <DashboardLayout>
                <div className="p-6 space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                                <Activity className="w-8 h-8 text-blue-600" />
                                Análisis de Exigencia TO
                            </h1>
                            <p className="text-gray-500 mt-2">Gestión de análisis de puestos de trabajo y exigencias.</p>
                        </div>
                        <Link href="/dashboard/formatos-to/analisis-exigencia/nueva">
                            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                                <Plus className="mr-2 h-4 w-4" />
                                Nuevo Análisis
                            </Button>
                        </Link>
                    </div>

                    {/* Filters */}
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
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
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

                    {/* Table */}
                    <div className="bg-white rounded-md border shadow-sm">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Fecha</TableHead>
                                    <TableHead>Trabajador</TableHead>
                                    <TableHead>Empresa</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8">
                                            Cargando análisis...
                                        </TableCell>
                                    </TableRow>
                                ) : analisis.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                                            No se encontraron análisis de exigencia.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    analisis.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-medium">#{item.id}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-4 w-4 text-gray-400" />
                                                    {item.identificacion?.fecha_valoracion?.split('T')[0] || 'Sin fecha'}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{item.identificacion?.nombre_trabajador || 'Sin nombre'}</span>
                                                    <span className="text-xs text-gray-500">{item.identificacion?.numero_documento}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>{item.identificacion?.empresa || '-'}</TableCell>
                                            <TableCell>
                                                <Badge variant={item.estado === 'completada' ? 'default' : 'secondary'}
                                                    className={item.estado === 'completada' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                                    {item.estado === 'completada' ? 'Completada' : 'Borrador'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link href={`/dashboard/formatos-to/analisis-exigencia/${item.id}`}>
                                                        <Button variant="ghost" size="icon" title="Ver detalles">
                                                            <Eye className="h-4 w-4 text-gray-500" />
                                                        </Button>
                                                    </Link>
                                                    {(isAdminOrSupervisor || item.created_by === user?.id) && (
                                                        <>
                                                            <Link href={`/dashboard/formatos-to/analisis-exigencia/${item.id}/editar`}>
                                                                <Button variant="ghost" size="icon" title="Editar">
                                                                    <Edit className="h-4 w-4 text-blue-500" />
                                                                </Button>
                                                            </Link>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                title="Eliminar"
                                                                onClick={() => setDeleteModal({ isOpen: true, id: item.id })}
                                                            >
                                                                <Trash2 className="h-4 w-4 text-red-500" />
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 mt-4">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <span className="text-sm text-gray-600">
                                Página {currentPage} de {totalPages}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    )}

                    {/* Delete Confirmation Modal */}
                    <Dialog open={deleteModal.isOpen} onOpenChange={(open) => !open && setDeleteModal({ isOpen: false, id: null })}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>¿Eliminar análisis?</DialogTitle>
                                <DialogDescription>
                                    Esta acción no se puede deshacer. Se eliminarán permanentemente todos los datos asociados a este análisis de exigencia.
                                </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setDeleteModal({ isOpen: false, id: null })}>
                                    Cancelar
                                </Button>
                                <Button variant="destructive" onClick={handleDelete}>
                                    Eliminar
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </DashboardLayout>
        </ModuleGuard>
    );
}
