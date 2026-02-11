'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { ModuleGuard } from '@/app/components/guards/ModuleGuard';
import { toast } from 'sonner';
import {
    PlusCircle, Search, Eye, Trash2, FileText, Loader2,
    ChevronLeft, ChevronRight
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://mentis-production.up.railway.app';

interface PruebaListItem {
    id: number;
    estado: string;
    fecha_creacion: string;
    fecha_actualizacion: string;
    trabajador_nombre: string | null;
    trabajador_documento: string | null;
    empresa: string | null;
}

function PruebasTrabajoTOList() {
    const router = useRouter();
    const { token } = useAuth();
    const [pruebas, setPruebas] = useState<PruebaListItem[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const limit = 10;

    const fetchPruebas = async () => {
        setLoading(true);
        try {
            const res = await fetch(
                `${API_URL}/formatos-to/pruebas-trabajo/?skip=${page * limit}&limit=${limit}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (!res.ok) throw new Error('Error al obtener pruebas');
            const data = await res.json();
            setPruebas(data.items || []);
            setTotal(data.total || 0);
        } catch (e: any) {
            toast.error(e.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchPruebas(); }, [page]);

    const handleDelete = async (id: number) => {
        if (!confirm('¿Está seguro de eliminar esta prueba?')) return;
        try {
            const res = await fetch(`${API_URL}/formatos-to/pruebas-trabajo/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error('Error al eliminar');
            toast.success('Prueba eliminada');
            fetchPruebas();
        } catch (e: any) {
            toast.error(e.message);
        }
    };

    const filtered = pruebas.filter(p => {
        if (!searchTerm) return true;
        const s = searchTerm.toLowerCase();
        return (p.trabajador_nombre?.toLowerCase().includes(s)) ||
            (p.empresa?.toLowerCase().includes(s)) ||
            (p.trabajador_documento?.toLowerCase().includes(s));
    });

    const totalPages = Math.ceil(total / limit);

    const estadoLabel = (e: string) => {
        if (e === 'completada') return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">Completada</span>;
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-700">Borrador</span>;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Pruebas de Trabajo TO</h1>
                    <p className="text-sm text-gray-500 mt-1">Módulo de Terapia Ocupacional</p>
                </div>
                <button
                    onClick={() => router.push('/dashboard/formatos-to/pruebas-trabajo/nueva')}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm shadow-sm"
                >
                    <PlusCircle className="h-4 w-4" />
                    Nueva Prueba TO
                </button>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                    type="text"
                    placeholder="Buscar por trabajador, empresa o documento..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                />
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-20">
                        <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">No se encontraron pruebas</p>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">ID</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Trabajador</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Empresa</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">Estado</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">Fecha</th>
                                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filtered.map(p => (
                                <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-4 py-3 text-sm text-gray-600">{p.id}</td>
                                    <td className="px-4 py-3">
                                        <p className="text-sm font-medium text-gray-800">{p.trabajador_nombre || '—'}</p>
                                        <p className="text-xs text-gray-400">{p.trabajador_documento || ''}</p>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600 hidden md:table-cell">{p.empresa || '—'}</td>
                                    <td className="px-4 py-3 hidden sm:table-cell">{estadoLabel(p.estado)}</td>
                                    <td className="px-4 py-3 text-sm text-gray-500 hidden lg:table-cell">
                                        {new Date(p.fecha_creacion).toLocaleDateString('es-CO')}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <button
                                                onClick={() => router.push(`/dashboard/formatos-to/pruebas-trabajo/${p.id}`)}
                                                className="p-2 rounded-lg hover:bg-indigo-50 text-gray-500 hover:text-indigo-600 transition-colors"
                                                title="Ver"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(p.id)}
                                                className="p-2 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors"
                                                title="Eliminar"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
                        <p className="text-sm text-gray-500">
                            Mostrando {page * limit + 1}–{Math.min((page + 1) * limit, total)} de {total}
                        </p>
                        <div className="flex items-center gap-1">
                            <button disabled={page === 0} onClick={() => setPage(p => p - 1)}
                                className="p-1.5 rounded-lg hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed">
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                            <span className="text-sm px-2">{page + 1} / {totalPages}</span>
                            <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}
                                className="p-1.5 rounded-lg hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed">
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

import { DashboardLayout } from '@/app/components/layout/DashboardLayout';

export default function PruebasTrabajoTOPage() {
    return (
        <ModuleGuard requiredModule="formatos_to">
            <DashboardLayout>
                <PruebasTrabajoTOList />
            </DashboardLayout>
        </ModuleGuard>
    );
}
