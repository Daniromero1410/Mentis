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
  Calendar,
  Plus,
  ArrowRight,
  Briefcase,
  Activity,
  Heart,
  Brain,
  BarChart3,
  ExternalLink,
  TrendingUp,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// ─── Module definitions ──────────────────────────────────────────
interface ModuleDefinition {
  key: string;
  label: string;
  description: string;
  icon: any;
  href: string;
  newHref: string;
  gradient: string;
  iconBg: string;
  textColor: string;
  apiEndpoint: string;
  permissionCheck: (user: any) => boolean;
}

const MODULES: ModuleDefinition[] = [
  {
    key: 'valoraciones',
    label: 'Valoraciones Psicológicas',
    description: 'Evaluación del estado mental y aptitud laboral',
    icon: ClipboardList,
    href: '/dashboard/valoraciones',
    newHref: '/dashboard/valoraciones/nueva',
    gradient: 'from-indigo-500 to-indigo-600',
    iconBg: 'bg-indigo-100 text-indigo-600',
    textColor: 'text-indigo-600',
    apiEndpoint: '/valoraciones/?skip=0&limit=100',
    permissionCheck: (u: any) => u?.rol === 'admin' || u?.acceso_valoraciones !== false,
  },
  {
    key: 'pruebas-trabajo',
    label: 'Pruebas de Trabajo',
    description: 'Evaluación de factores de riesgo psicosocial',
    icon: Briefcase,
    href: '/dashboard/pruebas-trabajo',
    newHref: '/dashboard/pruebas-trabajo/nueva',
    gradient: 'from-violet-500 to-violet-600',
    iconBg: 'bg-violet-100 text-violet-600',
    textColor: 'text-violet-600',
    apiEndpoint: '/pruebas-trabajo/?skip=0&limit=100',
    permissionCheck: (u: any) => u?.rol === 'admin' || u?.acceso_pruebas_trabajo !== false,
  },
  {
    key: 'formatos-to-pruebas',
    label: 'Formato TO - Prueba de Trabajo',
    description: 'Formato de Terapia Ocupacional para pruebas',
    icon: FileCheck,
    href: '/dashboard/formatos-to/pruebas-trabajo',
    newHref: '/dashboard/formatos-to/pruebas-trabajo/nueva',
    gradient: 'from-emerald-500 to-emerald-600',
    iconBg: 'bg-emerald-100 text-emerald-600',
    textColor: 'text-emerald-600',
    apiEndpoint: '/formatos-to/pruebas-trabajo/?skip=0&limit=100',
    permissionCheck: (u: any) => u?.rol === 'admin' || u?.acceso_formatos_to !== false,
  },
  {
    key: 'formatos-to-analisis',
    label: 'Formato TO - Análisis de Exigencia',
    description: 'Análisis de exigencias del puesto de trabajo',
    icon: Activity,
    href: '/dashboard/formatos-to/analisis-exigencia',
    newHref: '/dashboard/formatos-to/analisis-exigencia/nueva',
    gradient: 'from-amber-500 to-amber-600',
    iconBg: 'bg-amber-100 text-amber-600',
    textColor: 'text-amber-600',
    apiEndpoint: '/formatos-to/analisis-exigencia/?skip=0&limit=100',
    permissionCheck: (u: any) => u?.rol === 'admin' || u?.acceso_formatos_to !== false,
  },
  {
    key: 'formatos-to-valoracion',
    label: 'Formato TO - Valoración Ocupacional',
    description: 'Valoración del desempeño ocupacional',
    icon: Heart,
    href: '/dashboard/formatos-to/valoracion-ocupacional',
    newHref: '/dashboard/formatos-to/valoracion-ocupacional/nueva',
    gradient: 'from-rose-500 to-rose-600',
    iconBg: 'bg-rose-100 text-rose-600',
    textColor: 'text-rose-600',
    apiEndpoint: '/formatos-to/valoracion-ocupacional/?skip=0&limit=100',
    permissionCheck: (u: any) => u?.rol === 'admin' || u?.acceso_formatos_to !== false,
  },
  {
    key: 'analisis-exigencias-mental',
    label: 'Análisis de Exigencias Mental',
    description: 'Evaluación de carga y exigencia mental',
    icon: Brain,
    href: '/dashboard/analisis-exigencias-mental',
    newHref: '/dashboard/analisis-exigencias-mental/nueva',
    gradient: 'from-cyan-500 to-cyan-600',
    iconBg: 'bg-cyan-100 text-cyan-600',
    textColor: 'text-cyan-600',
    apiEndpoint: '/analisis-exigencias-mental/?skip=0&limit=100',
    permissionCheck: (u: any) => u?.rol === 'admin' || u?.acceso_analisis_exigencias_mental !== false,
  },
];

interface ModuleStats {
  total: number;
  completadas: number;
  borradores: number;
}

export default function DashboardPage() {
  const { user, token } = useAuth();
  const [moduleStats, setModuleStats] = useState<Record<string, ModuleStats>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const availableModules = MODULES.filter(m => m.permissionCheck(user));

  const fetchData = async () => {
    try {
      const stats: Record<string, ModuleStats> = {};

      const promises = availableModules.map(async (mod) => {
        try {
          const data = await api.get<{ items: any[], total: number }>(mod.apiEndpoint);
          const items = data.items || [];
          stats[mod.key] = {
            total: data.total || items.length,
            completadas: items.filter((i: any) => i.estado === 'completada').length,
            borradores: items.filter((i: any) => i.estado === 'borrador' || i.estado === 'en_proceso' || i.estado === 'revisada').length,
          };
        } catch {
          stats[mod.key] = { total: 0, completadas: 0, borradores: 0 };
        }
      });

      await Promise.all(promises);
      setModuleStats(stats);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
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

  // Summary stats
  const totalRegistros = Object.values(moduleStats).reduce((a, s) => a + s.total, 0);
  const totalCompletadas = Object.values(moduleStats).reduce((a, s) => a + s.completadas, 0);
  const totalBorradores = Object.values(moduleStats).reduce((a, s) => a + s.borradores, 0);

  const today = new Date();
  const formattedDate = format(today, "EEEE, d 'de' MMMM", { locale: es });

  return (
    <DashboardLayout>
      <div className="space-y-8">

        {/* ── Welcome Header ────────────────────────────────────────── */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Bienvenido, <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">{user?.nombre}</span>
            </h1>
            <p className="text-gray-500 mt-1 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="capitalize">{formattedDate}</span>
            </p>
          </div>
          <Button
            onClick={handleRefresh}
            variant="outline"
            disabled={refreshing}
            className="gap-2 self-start lg:self-center"
          >
            <RefreshCcw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>

        {/* ── Quick Stats Row ───────────────────────────────────────── */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Módulos Disponibles */}
          <Card className="relative overflow-hidden border-gray-200 hover:shadow-lg transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-transparent" />
            <CardContent className="p-5 relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Módulos</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{availableModules.length}</p>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-lg">
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">Disponibles para ti</p>
            </CardContent>
          </Card>

          {/* Total Registros */}
          <Card className="relative overflow-hidden border-gray-200 hover:shadow-lg transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-transparent" />
            <CardContent className="p-5 relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Registros</p>
                  {loading ? (
                    <div className="h-9 w-16 rounded bg-gray-100 animate-pulse mt-1" />
                  ) : (
                    <p className="text-3xl font-bold text-gray-900 mt-1">{totalRegistros}</p>
                  )}
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 shadow-lg">
                  <ClipboardList className="h-5 w-5 text-white" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">Total en el sistema</p>
            </CardContent>
          </Card>

          {/* Completados */}
          <Card className="relative overflow-hidden border-gray-200 hover:shadow-lg transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent" />
            <CardContent className="p-5 relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Completados</p>
                  {loading ? (
                    <div className="h-9 w-16 rounded bg-gray-100 animate-pulse mt-1" />
                  ) : (
                    <p className="text-3xl font-bold text-emerald-600 mt-1">{totalCompletadas}</p>
                  )}
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg">
                  <FileCheck className="h-5 w-5 text-white" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">Finalizados correctamente</p>
            </CardContent>
          </Card>

          {/* Borradores */}
          <Card className="relative overflow-hidden border-gray-200 hover:shadow-lg transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-transparent" />
            <CardContent className="p-5 relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Borradores</p>
                  {loading ? (
                    <div className="h-9 w-16 rounded bg-gray-100 animate-pulse mt-1" />
                  ) : (
                    <p className="text-3xl font-bold text-amber-600 mt-1">{totalBorradores}</p>
                  )}
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 shadow-lg">
                  <FileEdit className="h-5 w-5 text-white" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">Pendientes por finalizar</p>
            </CardContent>
          </Card>
        </div>


        {/* ── Centro de Actividad (Module Table) ────────────────────── */}
        <Card className="border-gray-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-md">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Centro de Actividad</h2>
                <p className="text-xs text-gray-500">Todos los módulos disponibles según tus permisos</p>
              </div>
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            {loading ? (
              // Skeleton rows
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="px-6 py-5 flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-gray-100 animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-40 bg-gray-100 rounded animate-pulse" />
                    <div className="h-3 w-56 bg-gray-50 rounded animate-pulse" />
                  </div>
                  <div className="h-8 w-20 bg-gray-100 rounded animate-pulse" />
                </div>
              ))
            ) : availableModules.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <ClipboardList className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No tienes módulos disponibles</p>
                <p className="text-sm text-gray-400 mt-1">Contacta al administrador para obtener acceso</p>
              </div>
            ) : (
              availableModules.map((mod) => {
                const stats = moduleStats[mod.key] || { total: 0, completadas: 0, borradores: 0 };
                const Icon = mod.icon;

                return (
                  <div
                    key={mod.key}
                    className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50/80 transition-colors group"
                  >
                    {/* Icon */}
                    <div className={`p-2.5 rounded-xl ${mod.iconBg} group-hover:scale-105 transition-transform`}>
                      <Icon className="h-5 w-5" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors truncate">
                        {mod.label}
                      </h3>
                      <p className="text-xs text-gray-500 truncate">{mod.description}</p>
                    </div>

                    {/* Stats badges */}
                    <div className="hidden sm:flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                        {stats.total} total
                      </span>
                      {stats.completadas > 0 && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {stats.completadas} completadas
                        </span>
                      )}
                      {stats.borradores > 0 && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                          {stats.borradores} pendientes
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Link href={mod.newHref}>
                        <Button
                          size="sm"
                          className={`bg-gradient-to-r ${mod.gradient} text-white shadow-sm hover:shadow-md transition-all text-xs px-3`}
                        >
                          <Plus className="h-3.5 w-3.5 mr-1" />
                          Nuevo
                        </Button>
                      </Link>
                      <Link href={mod.href}>
                        <Button
                          size="sm"
                          variant="ghost"
                          className={`${mod.textColor} hover:bg-gray-100 text-xs px-3`}
                        >
                          Ver lista
                          <ArrowRight className="h-3.5 w-3.5 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>

      </div>
    </DashboardLayout>
  );
}