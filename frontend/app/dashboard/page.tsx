'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/app/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/app/context/AuthContext';
import { api } from '@/app/services/api';
import { Button } from '@/components/ui/button';
import {
  ClipboardList,
  FileCheck,
  Clock,
  FileEdit,
  RefreshCcw,
  Building2,
  Calendar,
  Plus,
  ArrowRight,
  TrendingUp,
  Eye,
  Briefcase,
  Users,
  Activity,
} from 'lucide-react';
import Link from 'next/link';

interface Valoracion {
  id: number;
  fecha_valoracion: string;
  estado: string;
  trabajador_nombre?: string;
  trabajador_documento?: string;
  empresa?: string;
  created_at: string;
}

interface PruebaTrabajo {
  id: number;
  estado: string;
  fecha_creacion: string;
  trabajador_nombre?: string;
  trabajador_identificacion?: string;
  empresa?: string;
}

export default function DashboardPage() {
  const { user, token } = useAuth();
  const [valoraciones, setValoraciones] = useState<Valoracion[]>([]);
  const [pruebasTrabajo, setPruebasTrabajo] = useState<PruebaTrabajo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Verificar acceso a módulos
  const tieneAccesoValoraciones = user?.rol === 'admin' || user?.acceso_valoraciones !== false;
  const tieneAccesoPruebas = user?.rol === 'admin' || user?.acceso_pruebas_trabajo !== false;

  const fetchData = async () => {
    try {
      const promises: Promise<any>[] = [];

      if (tieneAccesoValoraciones) {
        promises.push(api.get<{ items: Valoracion[], total: number }>('/valoraciones/?skip=0&limit=5'));
      }
      if (tieneAccesoPruebas) {
        promises.push(api.get<{ items: PruebaTrabajo[], total: number }>('/pruebas-trabajo/?skip=0&limit=5'));
      }

      const results = await Promise.all(promises);

      let idx = 0;
      if (tieneAccesoValoraciones) {
        setValoraciones(results[idx]?.items || []);
        idx++;
      }
      if (tieneAccesoPruebas) {
        setPruebasTrabajo(results[idx]?.items || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (token) fetchData();
  }, [token]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  // Estadísticas de valoraciones
  const statsValoraciones = {
    total: valoraciones.length,
    completadas: valoraciones.filter(v => v.estado === 'completada').length,
    enProceso: valoraciones.filter(v => v.estado === 'revisada').length,
    borradores: valoraciones.filter(v => v.estado === 'borrador').length,
  };

  // Estadísticas de pruebas de trabajo
  const statsPruebas = {
    total: pruebasTrabajo.length,
    completadas: pruebasTrabajo.filter(p => p.estado === 'completada').length,
    enProceso: pruebasTrabajo.filter(p => p.estado === 'en_proceso').length,
    borradores: pruebasTrabajo.filter(p => p.estado === 'borrador').length,
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'completada': return 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-500/20';
      case 'revisada':
      case 'en_proceso': return 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 border border-amber-500/20';
      default: return 'bg-slate-500/10 text-slate-600 dark:bg-slate-500/20 dark:text-slate-400 border border-slate-500/20';
    }
  };

  const getEstadoLabel = (estado: string) => {
    switch (estado) {
      case 'completada': return 'Completada';
      case 'revisada':
      case 'en_proceso': return 'En Proceso';
      default: return 'Borrador';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return 'Hace unos minutos';
    if (hours < 24) return `Hace ${hours} hora${hours > 1 ? 's' : ''}`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `Hace ${days} día${days > 1 ? 's' : ''}`;
    return date.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <DashboardLayout>
      {/* Welcome Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Bienvenido, <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">{user?.nombre}</span>
            </h1>
            <p className="text-gray-500 dark:text-[#b0b0b0]">
              Panel de control - Gestión de evaluaciones psicológicas
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={handleRefresh}
              variant="outline"
              disabled={refreshing}
              className="dark:border-[#333333] dark:hover:bg-[#333333] dark:text-white"
            >
              <RefreshCcw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
          </div>
        </div>
      </div>

      {/* Resumen General */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {/* Total Valoraciones */}
        {tieneAccesoValoraciones && (
          <Card className="relative overflow-hidden border-gray-200 dark:border-[#333333] dark:bg-[#2a2a2a] hover:shadow-xl transition-all duration-300 group">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-transparent opacity-50" />
            <CardContent className="p-6 relative">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-[#b0b0b0] mb-1">Valoraciones</p>
                  <p className="text-xs text-gray-400 dark:text-[#6b6b6b]">Psicológicas</p>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <ClipboardList className="h-5 w-5 text-white" />
                </div>
              </div>
              {loading ? (
                <div className="h-10 w-20 skeleton"></div>
              ) : (
                <div className="flex items-baseline gap-2">
                  <h3 className="text-4xl font-bold text-gray-900 dark:text-white">{statsValoraciones.total}</h3>
                  <span className="text-sm text-emerald-500 font-medium">{statsValoraciones.completadas} completadas</span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Total Pruebas de Trabajo */}
        {tieneAccesoPruebas && (
          <Card className="relative overflow-hidden border-gray-200 dark:border-[#333333] dark:bg-[#2a2a2a] hover:shadow-xl transition-all duration-300 group">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-transparent opacity-50" />
            <CardContent className="p-6 relative">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-[#b0b0b0] mb-1">Pruebas</p>
                  <p className="text-xs text-gray-400 dark:text-[#6b6b6b]">de Trabajo</p>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Briefcase className="h-5 w-5 text-white" />
                </div>
              </div>
              {loading ? (
                <div className="h-10 w-20 skeleton"></div>
              ) : (
                <div className="flex items-baseline gap-2">
                  <h3 className="text-4xl font-bold text-gray-900 dark:text-white">{statsPruebas.total}</h3>
                  <span className="text-sm text-emerald-500 font-medium">{statsPruebas.completadas} completadas</span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* En Proceso */}
        <Card className="relative overflow-hidden border-gray-200 dark:border-[#333333] dark:bg-[#2a2a2a] hover:shadow-xl transition-all duration-300 group">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-transparent opacity-50" />
          <CardContent className="p-6 relative">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-[#b0b0b0] mb-1">En Proceso</p>
                <p className="text-xs text-gray-400 dark:text-[#6b6b6b]">Requieren atención</p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Clock className="h-5 w-5 text-white" />
              </div>
            </div>
            {loading ? (
              <div className="h-10 w-20 skeleton"></div>
            ) : (
              <div className="flex items-baseline gap-2">
                <h3 className="text-4xl font-bold text-gray-900 dark:text-white">
                  {(tieneAccesoValoraciones ? statsValoraciones.enProceso : 0) + (tieneAccesoPruebas ? statsPruebas.enProceso : 0)}
                </h3>
                <Activity className="h-4 w-4 text-amber-500" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Borradores */}
        <Card className="relative overflow-hidden border-gray-200 dark:border-[#333333] dark:bg-[#2a2a2a] hover:shadow-xl transition-all duration-300 group">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-500/5 via-transparent to-transparent opacity-50" />
          <CardContent className="p-6 relative">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-[#b0b0b0] mb-1">Borradores</p>
                <p className="text-xs text-gray-400 dark:text-[#6b6b6b]">Sin finalizar</p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-slate-500 to-slate-600 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <FileEdit className="h-5 w-5 text-white" />
              </div>
            </div>
            {loading ? (
              <div className="h-10 w-20 skeleton"></div>
            ) : (
              <div className="flex items-baseline gap-2">
                <h3 className="text-4xl font-bold text-gray-900 dark:text-white">
                  {(tieneAccesoValoraciones ? statsValoraciones.borradores : 0) + (tieneAccesoPruebas ? statsPruebas.borradores : 0)}
                </h3>
                <FileEdit className="h-4 w-4 text-slate-500" />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Acciones Rápidas */}
      <div className="grid gap-6 md:grid-cols-2 mb-8">
        {tieneAccesoValoraciones && (
          <Card className="border-gray-200 dark:border-[#333333] dark:bg-[#2a2a2a] hover:shadow-xl transition-all duration-300 group">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-lg">
                  <ClipboardList className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Valoraciones Psicológicas</h3>
                  <p className="text-sm text-gray-500 dark:text-[#b0b0b0]">Evalúa el estado mental y aptitud laboral</p>
                </div>
                <Link href="/dashboard/valoraciones/nueva">
                  <Button className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 shadow-lg shadow-indigo-500/25 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Nueva
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {tieneAccesoPruebas && (
          <Card className="border-gray-200 dark:border-[#333333] dark:bg-[#2a2a2a] hover:shadow-xl transition-all duration-300 group">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-violet-500 to-violet-600 shadow-lg">
                  <Briefcase className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Pruebas de Trabajo</h3>
                  <p className="text-sm text-gray-500 dark:text-[#b0b0b0]">Evalúa factores de riesgo psicosocial</p>
                </div>
                <Link href="/dashboard/pruebas-trabajo/nueva">
                  <Button className="bg-gradient-to-r from-violet-500 to-violet-600 hover:from-violet-600 hover:to-violet-700 shadow-lg shadow-violet-500/25 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Nueva
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Actividad Reciente - Grid de 2 columnas */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Valoraciones Recientes */}
        {tieneAccesoValoraciones && (
          <Card className="border-gray-200 dark:border-[#333333] dark:bg-[#2a2a2a]">
            <div className="p-6 border-b border-gray-200 dark:border-[#333333]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                    <ClipboardList className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Valoraciones Recientes</h2>
                    <p className="text-xs text-gray-500 dark:text-[#b0b0b0]">Últimas evaluaciones</p>
                  </div>
                </div>
                <Link href="/dashboard/valoraciones">
                  <Button variant="ghost" size="sm" className="gap-1 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-900/20">
                    Ver todas
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
            <CardContent className="p-4">
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-[#1a1a1a]">
                      <div className="w-10 h-10 rounded-full skeleton"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-32 skeleton"></div>
                        <div className="h-3 w-24 skeleton"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : valoraciones.length > 0 ? (
                <div className="space-y-2">
                  {valoraciones.slice(0, 4).map((v) => (
                    <Link key={v.id} href={`/dashboard/valoraciones/nueva?id=${v.id}&modo=ver`}>
                      <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors cursor-pointer group">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                          {v.trabajador_nombre?.charAt(0) || 'N'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 dark:text-white text-sm truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {v.trabajador_nombre || 'Sin nombre'}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-[#b0b0b0] truncate">
                            {v.empresa || 'Sin empresa'} • {formatDate(v.created_at)}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded-md text-xs font-medium ${getEstadoBadge(v.estado)}`}>
                          {getEstadoLabel(v.estado)}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <ClipboardList className="h-10 w-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-sm text-gray-500 dark:text-[#b0b0b0]">No hay valoraciones</p>
                  <Link href="/dashboard/valoraciones/nueva">
                    <Button size="sm" className="mt-3 bg-indigo-500 hover:bg-indigo-600">
                      <Plus className="h-4 w-4 mr-1" /> Crear primera
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Pruebas de Trabajo Recientes */}
        {tieneAccesoPruebas && (
          <Card className="border-gray-200 dark:border-[#333333] dark:bg-[#2a2a2a]">
            <div className="p-6 border-b border-gray-200 dark:border-[#333333]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-violet-100 dark:bg-violet-900/30">
                    <Briefcase className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Pruebas de Trabajo</h2>
                    <p className="text-xs text-gray-500 dark:text-[#b0b0b0]">Últimas evaluaciones</p>
                  </div>
                </div>
                <Link href="/dashboard/pruebas-trabajo">
                  <Button variant="ghost" size="sm" className="gap-1 text-violet-600 hover:text-violet-700 hover:bg-violet-50 dark:text-violet-400 dark:hover:bg-violet-900/20">
                    Ver todas
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
            <CardContent className="p-4">
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-[#1a1a1a]">
                      <div className="w-10 h-10 rounded-full skeleton"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-32 skeleton"></div>
                        <div className="h-3 w-24 skeleton"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : pruebasTrabajo.length > 0 ? (
                <div className="space-y-2">
                  {pruebasTrabajo.slice(0, 4).map((p) => (
                    <Link key={p.id} href={`/dashboard/pruebas-trabajo/${p.id}`}>
                      <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors cursor-pointer group">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm">
                          {p.trabajador_nombre?.charAt(0) || 'N'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 dark:text-white text-sm truncate group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                            {p.trabajador_nombre || 'Sin nombre'}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-[#b0b0b0] truncate">
                            {p.empresa || 'Sin empresa'} • {formatDate(p.fecha_creacion)}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded-md text-xs font-medium ${getEstadoBadge(p.estado)}`}>
                          {getEstadoLabel(p.estado)}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Briefcase className="h-10 w-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-sm text-gray-500 dark:text-[#b0b0b0]">No hay pruebas de trabajo</p>
                  <Link href="/dashboard/pruebas-trabajo/nueva">
                    <Button size="sm" className="mt-3 bg-violet-500 hover:bg-violet-600">
                      <Plus className="h-4 w-4 mr-1" /> Crear primera
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}