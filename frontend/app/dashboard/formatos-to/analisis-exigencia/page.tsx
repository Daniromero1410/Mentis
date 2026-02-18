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
                    a.trabajador_nombre?.toLowerCase().includes(term) ||
                    a.trabajador_documento?.includes(term) ||
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
                    <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
                                    <TableHead className="text-xs font-bold text-gray-500 uppercase tracking-wider py-4">TRABAJADOR</TableHead>
                                    <TableHead className="text-xs font-bold text-gray-500 uppercase tracking-wider py-4">TIPO DOC</TableHead>
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
                                        <TableCell colSpan={7} className="text-center py-12 text-gray-500">
                                            Cargando análisis...
                                        </TableCell>
                                    </TableRow>
                                ) : analisis.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-12 text-gray-500">
                                            No se encontraron análisis de exigencia.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    analisis.map((item) => {
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
                                                    {item.trabajador_tipo_documento || '-'}
                                                </TableCell>
                                                <TableCell className="text-sm text-gray-600">
                                                    {item.trabajador_documento || '-'}
                                                </TableCell>
                                                <TableCell className="text-sm text-gray-600 flex items-center gap-2">
                                                    <FileText className="h-3 w-3 text-gray-400" />
                                                    {item.empresa || '-'}
                                                </TableCell>
                                                <TableCell className="text-sm text-gray-500">
                                                    {item.identificacion?.fecha_valoracion?.split('T')[0] || item.fecha_creacion?.split('T')[0] || '-'}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant="secondary"
                                                        className={`font-medium rounded-full px-3 py-0.5 ${item.estado === 'completada'
                                                            ? 'bg-green-100 text-green-700 hover:bg-green-100'
                                                            : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100'
                                                            }`}
                                                    >
                                                        {item.estado === 'completada' ? 'Completado' : 'Borrador'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Link href={`/dashboard/formatos-to/analisis-exigencia/${item.id}`}>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                        {(isAdminOrSupervisor || item.created_by === user?.id) && (
                                                            <>
                                                                <Link href={`/dashboard/formatos-to/analisis-exigencia/${item.id}/editar`}>
                                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50">
                                                                        <Edit className="h-4 w-4" />
                                                                    </Button>
                                                                </Link>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                                    onClick={() => setDeleteModal({ isOpen: true, id: item.id })}
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination - Keep existing logic but maybe style it a bit? Logic is fine */}
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

                    {/* Delete Confirmation Modal - Force Portal if needed or check Dialog structure */}
                    <Dialog open={deleteModal.isOpen} onOpenChange={(open) => !open && setDeleteModal({ isOpen: false, id: null })}>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2 text-red-600">
                                    <Activity className="h-5 w-5" />
                                    ¿Eliminar análisis?
                                </DialogTitle>
                                <DialogDescription>
                                    Esta acción no se puede deshacer. Se eliminarán permanentemente todos los datos asociados a este análisis.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="flex justify-end gap-3 mt-6">
                                <Button variant="outline" onClick={() => setDeleteModal({ isOpen: false, id: null })}>
                                    Cancelar
                                </Button>
                                <Button
                                    className="bg-red-600 hover:bg-red-700 text-white"
                                    onClick={handleDelete}
                                >
                                    Eliminar
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </DashboardLayout>
        </ModuleGuard>
    );
}
