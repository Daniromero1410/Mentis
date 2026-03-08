'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { Button } from '@/components/ui/button';
import { ModuleGuard } from '@/app/components/guards/ModuleGuard';
import { DashboardLayout } from '@/app/components/layout/DashboardLayout';
import {
    Plus, Search, FileText,
    Eye, Edit, Trash2, ChevronLeft, ChevronRight, Activity,
    CheckCircle2, Clock, ListFilter, AlertTriangle,
} from 'lucide-react';
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

    const completadas = analisis.filter(a => a.estado === 'completada').length;
    const borradores = analisis.filter(a => a.estado !== 'completada').length;

    return (
        <ModuleGuard requiredModule="formatos_to">
            <DashboardLayout>
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between anim-fade-in-up">
                        <div className="flex items-center gap-3 sm:gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/25 shrink-0">
                                <Activity className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Análisis de Exigencia TO</h1>
                                <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Gestión de análisis de puestos de trabajo y exigencias</p>
                            </div>
                        </div>
                        <Link href="/dashboard/formatos-to/analisis-exigencia/nueva" className="w-full sm:w-auto">
                            <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 rounded-xl gap-2 w-full sm:w-auto justify-center">
                                <Plus className="h-4 w-4" />
                                Nuevo Análisis
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
                                <p className="text-[10px] sm:text-xs text-gray-500">Completados</p>
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
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
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
                                        <div className="w-12 h-12 rounded-full border-4 border-blue-500/20"></div>
                                        <div className="absolute top-0 left-0 w-12 h-12 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
                                    </div>
                                    <p className="text-sm text-gray-500 animate-pulse">Cargando análisis...</p>
                                </div>
                            </div>
                        ) : analisis.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-64">
                                <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
                                    <Activity className="h-8 w-8 text-blue-300" />
                                </div>
                                <p className="text-base font-semibold text-gray-700">No se encontraron análisis de exigencia</p>
                                <p className="text-sm text-gray-400 mt-1 mb-4">Crea un nuevo análisis para comenzar</p>
                                <Link href="/dashboard/formatos-to/analisis-exigencia/nueva">
                                    <Button variant="outline" className="rounded-xl border-blue-200 text-blue-600 hover:bg-blue-50 gap-2">
                                        <Plus className="h-4 w-4" />
                                        Nuevo Análisis
                                    </Button>
                                </Link>
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
                                        {analisis.map((item) => {
                                            const nombre = item.trabajador_nombre || 'Sin nombre';
                                            const initial = nombre.charAt(0).toUpperCase();
                                            return (
                                                <tr key={item.id} className="hover:bg-blue-50/30 transition-colors">
                                                    <td className="px-3 py-3 sm:px-6 sm:py-4">
                                                        <div className="flex items-center gap-2 sm:gap-3">
                                                            <div className="flex items-center justify-center w-9 h-9 rounded-full bg-blue-600 text-white font-bold text-sm shrink-0">
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
                                                            <FileText className="h-3.5 w-3.5 text-gray-400" />
                                                            {item.empresa || '-'}
                                                        </div>
                                                    </td>
                                                    <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {item.identificacion?.fecha_valoracion?.split('T')[0] || item.fecha_creacion?.split('T')[0] || '-'}
                                                    </td>
                                                    <td className="px-3 py-3 sm:px-6 sm:py-4 whitespace-nowrap">
                                                        <Badge
                                                            variant="secondary"
                                                            className={`font-medium rounded-full px-2.5 py-0.5 ${item.estado === 'completada'
                                                                ? 'bg-green-100 text-green-700 hover:bg-green-100'
                                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-100'
                                                                }`}
                                                        >
                                                            {item.estado === 'completada' ? 'Completado' : 'Borrador'}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-3 py-3 sm:px-6 sm:py-4 whitespace-nowrap">
                                                        <div className="flex items-center justify-end gap-1">
                                                            <Link href={`/dashboard/formatos-to/analisis-exigencia/${item.id}`}>
                                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg">
                                                                    <Eye className="h-4 w-4" />
                                                                </Button>
                                                            </Link>
                                                            {(isAdminOrSupervisor || item.created_by === user?.id) && (
                                                                <>
                                                                    <Link href={`/dashboard/formatos-to/analisis-exigencia/${item.id}/editar`}>
                                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg">
                                                                            <Edit className="h-4 w-4" />
                                                                        </Button>
                                                                    </Link>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg"
                                                                        onClick={() => setDeleteModal({ isOpen: true, id: item.id })}
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </Button>
                                                                </>
                                                            )}
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
                        {!loading && analisis.length > 0 && totalPages > 1 && (
                            <div className="px-3 py-3 sm:px-6 sm:py-4 border-t border-gray-100 flex items-center justify-between gap-2">
                                <div className="hidden sm:block text-sm text-gray-500">
                                    Página {currentPage} de {totalPages}
                                </div>
                                <div className="text-xs text-gray-500 sm:hidden">
                                    {currentPage} / {totalPages}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="border-gray-200 rounded-lg"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    <span className="text-sm text-gray-700 px-1 sm:px-2">
                                        {currentPage} / {totalPages}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                        className="border-gray-200 rounded-lg"
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Delete Confirmation Modal */}
                    <Dialog open={deleteModal.isOpen} onOpenChange={(open) => !open && setDeleteModal({ isOpen: false, id: null })}>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <div className="flex items-center gap-3">
                                    <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                                        <AlertTriangle className="h-6 w-6 text-red-600" />
                                    </div>
                                    <div>
                                        <DialogTitle>¿Eliminar análisis?</DialogTitle>
                                        <DialogDescription>
                                            Esta acción no se puede deshacer. Se eliminarán permanentemente todos los datos asociados.
                                        </DialogDescription>
                                    </div>
                                </div>
                            </DialogHeader>
                            <DialogFooter className="gap-2 sm:gap-0 mt-2">
                                <Button variant="outline" onClick={() => setDeleteModal({ isOpen: false, id: null })} className="rounded-xl border-gray-200">
                                    Cancelar
                                </Button>
                                <Button className="bg-red-600 hover:bg-red-700 text-white rounded-xl" onClick={handleDelete}>
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
