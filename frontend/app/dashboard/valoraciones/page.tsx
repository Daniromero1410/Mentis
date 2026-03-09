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
import { toast } from '../../../components/ui/sileo-toast';

interface Valoracion {
  id: number;
  fecha_valoracion: string;
  estado: string;
  trabajador_nombre?: string;
  trabajador_documento?: string;
  empresa?: string;
  created_at: string;
}

export default function ValoracionesPage() {
  const [valoraciones, setValoraciones] = useState<Valoracion[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('todos');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [valoracionToDelete, setValoracionToDelete] = useState<Valoracion | null>(null);
  const [deleting, setDeleting] = useState(false);
  const limit = 10;

  const fetchValoraciones = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        skip: String((page - 1) * limit),
        limit: String(limit),
      });

      if (estadoFilter && estadoFilter !== 'todos') {
        params.append('estado', estadoFilter);
      }

      if (search.trim()) {
        params.append('buscar', search.trim());
      }

      const response = await api.get<{ items: Valoracion[], total: number }>(
        `/valoraciones/?${params.toString()}`
      );
      setValoraciones(response.items || []);
      setTotal(response.total || 0);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar valoraciones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchValoraciones();
  }, [page, estadoFilter]);

  const handleSearch = () => {
    setPage(1);
    fetchValoraciones();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  const openDeleteDialog = (valoracion: Valoracion) => {
    setValoracionToDelete(valoracion);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!valoracionToDelete) return;

    setDeleting(true);
    try {
      await api.delete(`/valoraciones/${valoracionToDelete.id}`);
      setDeleteDialogOpen(false);
      setValoracionToDelete(null);
      await fetchValoraciones();
      toast.success('Valoración eliminada correctamente');
    } catch (error: any) {
      toast.error(error.message || 'Error al eliminar');
    } finally {
      setDeleting(false);
    }
  };

  const handleDownloadPDF = async (id: number, documento?: string) => {
    try {
      toast.info('Generando archivo PDF...');
      await api.downloadFile(
        `/valoraciones/${id}/descargar-pdf`,
        `valoracion_${documento || id}.pdf`,
        true
      );
      toast.success('PDF descargado exitosamente');
    } catch (error: any) {
      console.error('Error al descargar PDF:', error);
      toast.error(error.message || 'Error al descargar PDF');
    }
  };

  const estadoBadgeColor = (estado: string) => {
    switch (estado.toLowerCase()) {
      case 'completada':
        return 'bg-green-100 text-green-700';
      case 'revisada':
        return 'bg-yellow-100 text-yellow-700';
      case 'borrador':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-brand-100 text-brand-700';
    }
  };

  const getEstadoLabel = (estado: string) => {
    switch (estado.toLowerCase()) {
      case 'completada': return 'Completada';
      case 'revisada': return 'En Revisión';
      case 'borrador': return 'Borrador';
      default: return estado;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const totalPages = Math.ceil(total / limit);

  const completadas = valoraciones.filter(v => v.estado.toLowerCase() === 'completada').length;
  const borradores = valoraciones.filter(v => v.estado.toLowerCase() === 'borrador').length;

  return (
    <ModuleGuard requiredModule="valoraciones">
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between anim-fade-in-up">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-600 flex items-center justify-center shadow-lg shadow-brand-500/25 shrink-0">
                <ClipboardList className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Valoraciones Psicológicas</h1>
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Gestiona las valoraciones psicológicas de los trabajadores</p>
              </div>
            </div>
            <Link href="/dashboard/valoraciones/nueva" className="w-full sm:w-auto">
              <Button className="bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-500/20 rounded-xl gap-2 w-full sm:w-auto justify-center">
                <Plus className="h-4 w-4" />
                Nueva Valoración
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 anim-fade-in-up delay-1">
            <div className="bg-white rounded-2xl border border-gray-200 p-3 sm:p-4 flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
                <ListFilter className="h-4 w-4 sm:h-5 sm:w-5 text-brand-600" />
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
                  placeholder="Buscar por nombre, identificación o empresa..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pl-10 bg-gray-50 border-gray-200 rounded-xl"
                />
              </div>
              <div className="flex gap-2">
                <div className="flex-1 sm:flex-none sm:w-44">
                  <Select value={estadoFilter} onValueChange={(value) => { setEstadoFilter(value); setPage(1); }}>
                    <SelectTrigger className="bg-gray-50 border-gray-200 rounded-xl w-full">
                      <Filter className="mr-2 h-4 w-4 text-gray-400" />
                      <SelectValue placeholder="Estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      <SelectItem value="borrador">Borrador</SelectItem>
                      <SelectItem value="completada">Completada</SelectItem>
                      <SelectItem value="revisada">En Revisión</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={handleSearch}
                  className="bg-brand-600 hover:bg-brand-700 text-white rounded-xl shrink-0"
                >
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
                    <div className="w-12 h-12 rounded-full border-4 border-brand-500/20"></div>
                    <div className="absolute top-0 left-0 w-12 h-12 rounded-full border-4 border-brand-600 border-t-transparent animate-spin"></div>
                  </div>
                  <p className="text-sm text-gray-500 animate-pulse">Cargando valoraciones...</p>
                </div>
              </div>
            ) : valoraciones.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center mb-4">
                  <ClipboardList className="h-8 w-8 text-brand-300" />
                </div>
                <p className="text-base font-semibold text-gray-700">No hay valoraciones</p>
                <p className="text-sm text-gray-400 mt-1 mb-4">Crea una nueva valoración para comenzar</p>
                <Link href="/dashboard/valoraciones/nueva">
                  <Button variant="outline" className="rounded-xl border-brand-200 text-brand-600 hover:bg-brand-50 gap-2">
                    <Plus className="h-4 w-4" />
                    Nueva Valoración
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
                      <th className="px-3 py-3 sm:px-6 sm:py-3.5 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {valoraciones.map((valoracion) => (
                      <tr key={valoracion.id} className="hover:bg-brand-50/30 transition-colors">
                        <td className="px-3 py-3 sm:px-6 sm:py-4">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div className="flex-shrink-0 h-9 w-9 bg-brand-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                              {valoracion.trabajador_nombre
                                ? valoracion.trabajador_nombre.charAt(0).toUpperCase()
                                : '?'}
                            </div>
                            <div className="min-w-0">
                              <span className="text-sm font-semibold text-gray-900 uppercase block truncate">
                                {valoracion.trabajador_nombre || 'Sin nombre'}
                              </span>
                              <span className="sm:hidden text-xs text-gray-400 truncate block">
                                {valoracion.trabajador_documento || '-'} · {valoracion.empresa || '-'}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-600">
                            {valoracion.trabajador_documento || 'Sin documento'}
                          </span>
                        </td>
                        <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <FileText className="h-3.5 w-3.5 text-gray-400" />
                            {valoracion.empresa || 'Sin empresa'}
                          </div>
                        </td>
                        <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-500">
                            {formatDate(valoracion.fecha_valoracion || valoracion.created_at)}
                          </span>
                        </td>
                        <td className="px-3 py-3 sm:px-6 sm:py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${estadoBadgeColor(valoracion.estado)}`}>
                            {getEstadoLabel(valoracion.estado)}
                          </span>
                        </td>
                        <td className="px-3 py-3 sm:px-6 sm:py-4 whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1">
                            <Link href={`/dashboard/valoraciones/nueva?id=${valoracion.id}&modo=ver`}>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-brand-100 text-brand-600 rounded-lg" title="Ver detalles">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Link href={`/dashboard/valoraciones/nueva?id=${valoracion.id}&modo=editar`}>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-green-100 text-green-600 rounded-lg" title="Editar valoración">
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </Link>
                            {valoracion.estado.toLowerCase() === 'completada' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDownloadPDF(valoracion.id, valoracion.trabajador_documento)}
                                className="h-8 w-8 p-0 hover:bg-purple-100 text-purple-600 rounded-lg"
                                title="Descargar PDF"
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openDeleteDialog(valoracion)}
                              className="h-8 w-8 p-0 hover:bg-red-100 text-red-500 rounded-lg"
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
            {!loading && valoraciones.length > 0 && (
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
                    onClick={() => setPage(page - 1)}
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
                    onClick={() => setPage(page + 1)}
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
                    <DialogTitle>Eliminar Valoración Psicológica</DialogTitle>
                    <DialogDescription>Esta acción no se puede deshacer</DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              <div className="py-4">
                <p className="text-sm text-gray-600">
                  ¿Estás seguro de que deseas eliminar la valoración psicológica de{' '}
                  <span className="font-semibold text-gray-900">
                    {valoracionToDelete?.trabajador_nombre || 'Sin nombre'}
                  </span>
                  ? Se eliminarán todos los datos asociados incluyendo el trabajador, empresa y evaluación.
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
