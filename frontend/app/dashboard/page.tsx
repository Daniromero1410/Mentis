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
  ExternalLink,
  TrendingUp,
  Zap,
  Eye,
  AlertTriangle,
} from 'lucide-react';
import Link from 'next/link';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

// ─── Module definitions ──────────────────────────────────────────
interface ModuleDefinition {
  key: string;
  label: string;
  shortLabel: string;
  description: string;
  icon: any;
  href: string;
  newHref: string;
  gradient: string;
  iconBg: string;
  textColor: string;
  badgeColor: string;
  apiEndpoint: string;
  permissionCheck: (user: any) => boolean;
}

const MODULES: ModuleDefinition[] = [
  {
    key: 'valoraciones',
    label: 'Valoraciones Psicológicas',
    shortLabel: 'Valoraciones',
    description: 'Evaluación del estado mental y aptitud laboral',
    icon: ClipboardList,
    href: '/dashboard/valoraciones',
    newHref: '/dashboard/valoraciones/nueva',
    gradient: 'from-indigo-500 to-indigo-600',
    iconBg: 'bg-indigo-100 text-indigo-600',
    textColor: 'text-indigo-600',
    badgeColor: 'bg-indigo-500',
    apiEndpoint: '/valoraciones/?skip=0&limit=10',
    permissionCheck: (u: any) => u?.rol === 'admin' || u?.acceso_valoraciones !== false,
  },
  {
    key: 'pruebas-trabajo',
    label: 'Pruebas de Trabajo',
    shortLabel: 'Pruebas',
    description: 'Evaluación de factores de riesgo psicosocial',
    icon: Briefcase,
    href: '/dashboard/pruebas-trabajo',
    newHref: '/dashboard/pruebas-trabajo/nueva',
    gradient: 'from-violet-500 to-violet-600',
    iconBg: 'bg-violet-100 text-violet-600',
    textColor: 'text-violet-600',
    badgeColor: 'bg-violet-500',
    apiEndpoint: '/pruebas-trabajo/?skip=0&limit=10',
    permissionCheck: (u: any) => u?.rol === 'admin' || u?.acceso_pruebas_trabajo !== false,
  },
  {
    key: 'formatos-to-pruebas',
    label: 'Formato TO - Prueba de Trabajo',
    shortLabel: 'TO Pruebas',
    description: 'Formato de Terapia Ocupacional para pruebas',
    icon: FileCheck,
    href: '/dashboard/formatos-to/pruebas-trabajo',
    newHref: '/dashboard/formatos-to/pruebas-trabajo/nueva',
    gradient: 'from-emerald-500 to-emerald-600',
    iconBg: 'bg-emerald-100 text-emerald-600',
    textColor: 'text-emerald-600',
    badgeColor: 'bg-emerald-500',
    apiEndpoint: '/formatos-to/pruebas-trabajo/?skip=0&limit=10',
    permissionCheck: (u: any) => u?.rol === 'admin' || u?.acceso_formatos_to !== false,
  },
  {
    key: 'formatos-to-analisis',
    label: 'Formato TO - Análisis de Exigencia',
    shortLabel: 'TO Análisis',
    description: 'Análisis de exigencias del puesto de trabajo',
    icon: Activity,
    href: '/dashboard/formatos-to/analisis-exigencia',
    newHref: '/dashboard/formatos-to/analisis-exigencia/nueva',
    gradient: 'from-amber-500 to-amber-600',
    iconBg: 'bg-amber-100 text-amber-600',
    textColor: 'text-amber-600',
    badgeColor: 'bg-amber-500',
    apiEndpoint: '/formatos-to/analisis-exigencia/?skip=0&limit=10',
    permissionCheck: (u: any) => u?.rol === 'admin' || u?.acceso_formatos_to !== false,
  },
  {
    key: 'formatos-to-valoracion',
    label: 'Formato TO - Valoración Ocupacional',
    shortLabel: 'TO Valoración',
    description: 'Valoración del desempeño ocupacional',
    icon: Heart,
    href: '/dashboard/formatos-to/valoracion-ocupacional',
    newHref: '/dashboard/formatos-to/valoracion-ocupacional/nueva',
    gradient: 'from-rose-500 to-rose-600',
    iconBg: 'bg-rose-100 text-rose-600',
    textColor: 'text-rose-600',
    badgeColor: 'bg-rose-500',
    apiEndpoint: '/formatos-to/valoracion-ocupacional/?skip=0&limit=10',
    permissionCheck: (u: any) => u?.rol === 'admin' || u?.acceso_formatos_to !== false,
  },
  {
    key: 'analisis-exigencias-mental',
    label: 'Análisis de Exigencias Mental',
    shortLabel: 'Exig. Mental',
    description: 'Evaluación de carga y exigencia mental',
    icon: Brain,
    href: '/dashboard/analisis-exigencias-mental',
    newHref: '/dashboard/analisis-exigencias-mental/nueva',
    gradient: 'from-cyan-500 to-cyan-600',
    iconBg: 'bg-cyan-100 text-cyan-600',
    textColor: 'text-cyan-600',
    badgeColor: 'bg-cyan-500',
    apiEndpoint: '/analisis-exigencias-mental/?skip=0&limit=10',
    permissionCheck: (u: any) => u?.rol === 'admin' || u?.acceso_analisis_exigencias_mental !== false,
  },
];

interface RecordItem {
  id: number;
  estado: string;
  trabajador_nombre?: string;
  trabajador_documento?: string;
  trabajador_identificacion?: string;
  empresa?: string;
  fecha_creacion?: string;
  created_at?: string;
  fecha_valoracion?: string;
  fecha_actualizacion?: string;
}

export default function DashboardPage() {
  const { user, token } = useAuth();
  const [moduleData, setModuleData] = useState<Record<string, { items: RecordItem[], total: number }>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('');

  const availableModules = MODULES.filter(m => m.permissionCheck(user));

  // Set initial active tab
  useEffect(() => {
    if (availableModules.length > 0 && !activeTab) {
      setActiveTab(availableModules[0].key);
    }
  }, [availableModules]);

  const fetchData = async () => {
    try {
      const data: Record<string, { items: RecordItem[], total: number }> = {};

      const promises = availableModules.map(async (mod) => {
        try {
          const res = await api.get<{ items: RecordItem[], total: number }>(mod.apiEndpoint);
          data[mod.key] = { items: res.items || [], total: res.total || 0 };
        } catch {
          data[mod.key] = { items: [], total: 0 };
        }
      });

      await Promise.all(promises);
      setModuleData(data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
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
  const totalRegistros = Object.values(moduleData).reduce((a, d) => a + d.total, 0);
  const totalCompletadas = Object.values(moduleData).reduce((a, d) => a + d.items.filter(i => i.estado === 'completada').length, 0);
  const totalBorradores = Object.values(moduleData).reduce((a, d) => a + d.items.filter(i => i.estado !== 'completada').length, 0);

  const today = new Date();
  const formattedDate = format(today, "EEEE, d 'de' MMMM", { locale: es });
  const dayName = format(today, 'EEEE', { locale: es });
  const dayMonth = format(today, "d MMMM", { locale: es });

  const activeModule = availableModules.find(m => m.key === activeTab);
  const activeData = moduleData[activeTab] || { items: [], total: 0 };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'completada':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200">COMPLETADA</span>;
      case 'revisada':
      case 'en_proceso':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-700 border border-amber-200">EN PROCESO</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">BORRADOR</span>;
    }
  };

  const getRecordDate = (item: RecordItem) => {
    const dateStr = item.fecha_creacion || item.created_at || item.fecha_valoracion || '';
    if (!dateStr) return '—';
    try {
      return formatDistanceToNow(new Date(dateStr), { addSuffix: true, locale: es });
    } catch {
      return '—';
    }
  };

  const getRecordName = (item: RecordItem) => {
    return item.trabajador_nombre || 'Sin nombre';
  };

  const getRecordDoc = (item: RecordItem) => {
    return item.trabajador_documento || item.trabajador_identificacion || '—';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* ── Two-column layout ──────────────────────────────────── */}
        <div className="grid gap-6 lg:grid-cols-[340px_1fr]">

          {/* ─── Left Panel: Foco del Día ────────────────────────── */}
          <div className="space-y-5">

            {/* Welcome Card */}
            <Card className="border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-600 px-5 py-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
                    <TrendingUp className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest text-white/80">Foco del día</span>
                </div>
                <h2 className="text-xl font-bold text-white mb-0.5">
                  Hola, {user?.nombre}
                </h2>
                <p className="text-sm text-indigo-100 capitalize flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  {formattedDate}
                </p>
              </div>

              <CardContent className="p-4 space-y-2">
                {/* Quick action buttons */}
                <div className="grid grid-cols-2 gap-2">
                  {availableModules.slice(0, 2).map((mod) => {
                    const Icon = mod.icon;
                    return (
                      <Link key={mod.key} href={mod.newHref}>
                        <div className="flex flex-col items-center gap-2 p-3 rounded-xl border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/50 transition-all cursor-pointer group">
                          <div className={`p-2.5 rounded-xl bg-gradient-to-br ${mod.gradient} shadow-sm group-hover:scale-105 transition-transform`}>
                            <Icon className="h-5 w-5 text-white" />
                          </div>
                          <span className="text-[11px] font-semibold text-gray-600 text-center leading-tight">{mod.shortLabel} nueva</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Stats Card */}
            <Card className="border-gray-200">
              <CardContent className="p-0">
                <div className="divide-y divide-gray-100">
                  <div className="flex items-center justify-between px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <ClipboardList className="h-4 w-4 text-indigo-500" />
                      <span className="text-sm font-medium text-gray-700">Total Registros</span>
                    </div>
                    {loading ? (
                      <div className="h-6 w-8 rounded bg-gray-100 animate-pulse" />
                    ) : (
                      <span className="text-lg font-bold text-gray-900">{totalRegistros}</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <FileCheck className="h-4 w-4 text-emerald-500" />
                      <span className="text-sm font-medium text-gray-700">Completados</span>
                    </div>
                    {loading ? (
                      <div className="h-6 w-8 rounded bg-gray-100 animate-pulse" />
                    ) : (
                      <span className="text-lg font-bold text-emerald-600">{totalCompletadas}</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <FileEdit className="h-4 w-4 text-amber-500" />
                      <span className="text-sm font-medium text-gray-700">Pendientes</span>
                    </div>
                    {loading ? (
                      <div className="h-6 w-8 rounded bg-gray-100 animate-pulse" />
                    ) : (
                      <span className="text-lg font-bold text-amber-600">{totalBorradores}</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Modules Quick Access */}
            <div>
              <h3 className="text-[11px] font-bold uppercase tracking-widest text-gray-400 px-1 mb-3">Módulos Disponibles</h3>
              <div className="space-y-1.5">
                {availableModules.map((mod) => {
                  const Icon = mod.icon;
                  const data = moduleData[mod.key];
                  const count = data?.total || 0;
                  return (
                    <Link key={mod.key} href={mod.href}>
                      <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group">
                        <div className={`p-1.5 rounded-lg ${mod.iconBg}`}>
                          <Icon className="h-3.5 w-3.5" />
                        </div>
                        <span className="flex-1 text-sm font-medium text-gray-700 group-hover:text-gray-900 truncate">{mod.label}</span>
                        {!loading && (
                          <span className="text-xs font-semibold text-gray-400">{count}</span>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>


          {/* ─── Right Panel: Centro de Actividad ────────────────── */}
          <Card className="border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">Centro de Actividad</h2>
              </div>
              <Button
                onClick={handleRefresh}
                variant="ghost"
                size="sm"
                disabled={refreshing}
                className="text-gray-500 hover:text-gray-700"
              >
                <RefreshCcw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              </Button>
            </div>

            {/* Module Tabs */}
            <div className="px-6 py-2 border-b border-gray-100 overflow-x-auto">
              <div className="flex gap-1">
                {availableModules.map((mod) => {
                  const isActive = activeTab === mod.key;
                  return (
                    <button
                      key={mod.key}
                      onClick={() => setActiveTab(mod.key)}
                      className={`
                        px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all
                        ${isActive
                          ? `bg-gradient-to-r ${mod.gradient} text-white shadow-sm`
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                        }
                      `}
                    >
                      {mod.shortLabel}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              {loading ? (
                <div className="p-6 space-y-4">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="flex items-center gap-4">
                      <div className="w-9 h-9 rounded-full bg-gray-100 animate-pulse" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-36 bg-gray-100 rounded animate-pulse" />
                        <div className="h-3 w-24 bg-gray-50 rounded animate-pulse" />
                      </div>
                      <div className="h-5 w-20 bg-gray-100 rounded-full animate-pulse" />
                    </div>
                  ))}
                </div>
              ) : activeData.items.length === 0 ? (
                <div className="p-12 text-center">
                  {activeModule && (
                    <>
                      <div className={`w-14 h-14 mx-auto mb-4 rounded-2xl ${activeModule.iconBg} flex items-center justify-center`}>
                        {(() => { const Icon = activeModule.icon; return <Icon className="h-7 w-7" />; })()}
                      </div>
                      <p className="text-sm font-medium text-gray-900 mb-1">No hay registros</p>
                      <p className="text-xs text-gray-500 mb-4">Aún no se han creado registros en {activeModule.label}</p>
                      <Link href={activeModule.newHref}>
                        <Button size="sm" className={`bg-gradient-to-r ${activeModule.gradient} text-white`}>
                          <Plus className="h-3.5 w-3.5 mr-1" />
                          Crear primero
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              ) : (
                <>
                  {/* Table header */}
                  <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-6 py-3 border-b border-gray-100 bg-gray-50/50">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Trabajador / ID</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 min-w-[100px]">Estado</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 min-w-[100px] hidden sm:block">Fecha</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 min-w-[60px] text-right">Acción</span>
                  </div>

                  {/* Table body */}
                  <div className="divide-y divide-gray-50">
                    {activeData.items.slice(0, 8).map((item) => {
                      const name = getRecordName(item);
                      const initials = name.split(' ').map(n => n.charAt(0)).slice(0, 2).join('').toUpperCase();
                      const doc = getRecordDoc(item);

                      return (
                        <div
                          key={item.id}
                          className="grid grid-cols-[1fr_auto_auto_auto] gap-4 items-center px-6 py-3.5 hover:bg-gray-50/80 transition-colors"
                        >
                          {/* Name + Doc */}
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${activeModule?.gradient || 'from-indigo-500 to-indigo-600'} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                              {initials}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-gray-900 truncate">{name}</p>
                              <p className="text-xs text-gray-400 truncate">ID: {doc}</p>
                            </div>
                          </div>

                          {/* Estado */}
                          <div className="min-w-[100px]">
                            {getEstadoBadge(item.estado)}
                          </div>

                          {/* Date */}
                          <div className="min-w-[100px] hidden sm:block">
                            <span className="text-xs text-gray-500">{getRecordDate(item)}</span>
                          </div>

                          {/* Action */}
                          <div className="min-w-[60px] text-right">
                            <Link href={`${activeModule?.href}/${item.id}`}>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-indigo-600">
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Footer */}
                  {activeModule && (
                    <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/30">
                      <Link href={activeModule.href}>
                        <button className="w-full text-center text-xs font-bold uppercase tracking-wider text-gray-500 hover:text-indigo-600 transition-colors flex items-center justify-center gap-1.5 py-1">
                          Ver historial completo
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      </Link>
                    </div>
                  )}
                </>
              )}
            </div>
          </Card>
        </div>

      </div>
    </DashboardLayout>
  );
}