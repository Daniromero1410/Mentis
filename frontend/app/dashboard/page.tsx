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
  Eye,
  Pencil,
  Trash2,
  Download,
  X,
  User,
} from 'lucide-react';
import Link from 'next/link';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

// ─── Module definitions ──────────────────────────────────────────
interface ModuleDefinition {
  key: string;
  label: string;
  shortLabel: string;
  icon: any;
  href: string;
  newHref: string;
  apiEndpoint: string;
  permissionCheck: (user: any) => boolean;
}

const MODULES: ModuleDefinition[] = [
  {
    key: 'valoraciones',
    label: 'Valoraciones Psicológicas',
    shortLabel: 'Valoraciones',
    icon: ClipboardList,
    href: '/dashboard/valoraciones',
    newHref: '/dashboard/valoraciones/nueva',
    apiEndpoint: '/valoraciones/?skip=0&limit=10',
    permissionCheck: (u: any) => u?.rol === 'admin' || u?.acceso_valoraciones !== false,
  },
  {
    key: 'pruebas-trabajo',
    label: 'Pruebas de Trabajo',
    shortLabel: 'Pruebas',
    icon: Briefcase,
    href: '/dashboard/pruebas-trabajo',
    newHref: '/dashboard/pruebas-trabajo/nueva',
    apiEndpoint: '/pruebas-trabajo/?skip=0&limit=10',
    permissionCheck: (u: any) => u?.rol === 'admin' || u?.acceso_pruebas_trabajo !== false,
  },
  {
    key: 'formatos-to-pruebas',
    label: 'Formato TO - Prueba de Trabajo',
    shortLabel: 'TO Pruebas',
    icon: FileCheck,
    href: '/dashboard/formatos-to/pruebas-trabajo',
    newHref: '/dashboard/formatos-to/pruebas-trabajo/nueva',
    apiEndpoint: '/formatos-to/pruebas-trabajo/?skip=0&limit=10',
    permissionCheck: (u: any) => u?.rol === 'admin' || u?.acceso_formatos_to !== false,
  },
  {
    key: 'formatos-to-analisis',
    label: 'Formato TO - Análisis de Exigencia',
    shortLabel: 'TO Análisis',
    icon: Activity,
    href: '/dashboard/formatos-to/analisis-exigencia',
    newHref: '/dashboard/formatos-to/analisis-exigencia/nueva',
    apiEndpoint: '/formatos-to/analisis-exigencia/?skip=0&limit=10',
    permissionCheck: (u: any) => u?.rol === 'admin' || u?.acceso_formatos_to !== false,
  },
  {
    key: 'formatos-to-valoracion',
    label: 'Formato TO - Valoración Ocupacional',
    shortLabel: 'TO Valoración',
    icon: Heart,
    href: '/dashboard/formatos-to/valoracion-ocupacional',
    newHref: '/dashboard/formatos-to/valoracion-ocupacional/nueva',
    apiEndpoint: '/formatos-to/valoracion-ocupacional/?skip=0&limit=10',
    permissionCheck: (u: any) => u?.rol === 'admin' || u?.acceso_formatos_to !== false,
  },
  {
    key: 'analisis-exigencias-mental',
    label: 'Análisis de Exigencias Mental',
    shortLabel: 'Exig. Mental',
    icon: Brain,
    href: '/dashboard/analisis-exigencias-mental',
    newHref: '/dashboard/analisis-exigencias-mental/nueva',
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
  const [selectedRecord, setSelectedRecord] = useState<RecordItem | null>(null);

  const availableModules = MODULES.filter(m => m.permissionCheck(user));

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

  const totalRegistros = Object.values(moduleData).reduce((a, d) => a + d.total, 0);
  const totalCompletadas = Object.values(moduleData).reduce((a, d) => a + d.items.filter(i => i.estado === 'completada').length, 0);
  const totalBorradores = Object.values(moduleData).reduce((a, d) => a + d.items.filter(i => i.estado !== 'completada').length, 0);

  const formattedDate = format(new Date(), "EEEE, d 'de' MMMM", { locale: es });

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
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-700 border border-blue-200">BORRADOR</span>;
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

  const getFormattedDate = (item: RecordItem) => {
    const dateStr = item.fecha_creacion || item.created_at || item.fecha_valoracion || '';
    if (!dateStr) return '—';
    try {
      return format(new Date(dateStr), "d 'de' MMMM, yyyy", { locale: es });
    } catch {
      return '—';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-[340px_1fr]">

          {/* ─── Left Panel ───────────────────────────────────────── */}
          <div className="space-y-5">
            {/* Welcome Card */}
            <Card className="bg-white border-gray-200 overflow-hidden shadow-sm">
              <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 px-5 py-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
                    <TrendingUp className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest text-white/80">Foco del día</span>
                </div>
                <h2 className="text-xl font-bold text-white mb-0.5">
                  Hola, {user?.nombre}
                </h2>
                <p className="text-sm text-blue-100 capitalize flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  {formattedDate}
                </p>
              </div>

              {/* All modules as quick create buttons */}
              <CardContent className="p-4 bg-white">
                <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-3">Crear Nuevo</p>
                <div className="grid grid-cols-3 gap-2">
                  {availableModules.map((mod) => {
                    const Icon = mod.icon;
                    return (
                      <Link key={mod.key} href={mod.newHref}>
                        <div className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl border border-gray-100 bg-white hover:border-blue-200 hover:bg-blue-50/50 hover:shadow-sm transition-all cursor-pointer group">
                          <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 shadow-sm group-hover:scale-105 transition-transform">
                            <Icon className="h-4 w-4 text-white" />
                          </div>
                          <span className="text-[10px] font-semibold text-gray-500 text-center leading-tight line-clamp-2">{mod.shortLabel}</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Stats Card */}
            <Card className="bg-white border-gray-200 shadow-sm">
              <CardContent className="p-0 bg-white">
                <div className="divide-y divide-gray-100">
                  <div className="flex items-center justify-between px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <ClipboardList className="h-4 w-4 text-blue-500" />
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
                      <FileCheck className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium text-gray-700">Completados</span>
                    </div>
                    {loading ? (
                      <div className="h-6 w-8 rounded bg-gray-100 animate-pulse" />
                    ) : (
                      <span className="text-lg font-bold text-blue-600">{totalCompletadas}</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <FileEdit className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium text-gray-700">Pendientes</span>
                    </div>
                    {loading ? (
                      <div className="h-6 w-8 rounded bg-gray-100 animate-pulse" />
                    ) : (
                      <span className="text-lg font-bold text-blue-600">{totalBorradores}</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Modules List */}
            <Card className="bg-white border-gray-200 shadow-sm">
              <CardContent className="p-4 bg-white">
                <h3 className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-3">Módulos Disponibles</h3>
                <div className="space-y-1">
                  {availableModules.map((mod) => {
                    const Icon = mod.icon;
                    const data = moduleData[mod.key];
                    const count = data?.total || 0;
                    return (
                      <Link key={mod.key} href={mod.href}>
                        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-blue-50/60 transition-colors cursor-pointer group">
                          <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                            <Icon className="h-3.5 w-3.5" />
                          </div>
                          <span className="flex-1 text-sm font-medium text-gray-700 group-hover:text-blue-600 truncate transition-colors">{mod.label}</span>
                          {!loading && (
                            <span className="text-xs font-semibold text-gray-400">{count}</span>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>


          {/* ─── Right Panel: Centro de Actividad ────────────────── */}
          <Card className="bg-white border-gray-200 overflow-hidden shadow-sm">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 bg-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">Centro de Actividad</h2>
              </div>
              <Button
                onClick={handleRefresh}
                variant="ghost"
                size="icon"
                disabled={refreshing}
                className="h-8 w-8 text-gray-400 hover:text-blue-600 hover:bg-blue-50"
              >
                <RefreshCcw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              </Button>
            </div>

            {/* Module Tabs */}
            <div className="px-6 py-2.5 border-b border-gray-100 bg-white overflow-x-auto">
              <div className="flex gap-1">
                {availableModules.map((mod) => {
                  const isActive = activeTab === mod.key;
                  return (
                    <button
                      key={mod.key}
                      onClick={() => setActiveTab(mod.key)}
                      className={`
                        px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all
                        ${isActive
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'
                        }
                      `}
                    >
                      {mod.shortLabel}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Table Content */}
            <div className="bg-white">
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
                <div className="p-12 text-center bg-white">
                  {activeModule && (
                    <>
                      <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center">
                        {(() => { const Icon = activeModule.icon; return <Icon className="h-7 w-7" />; })()}
                      </div>
                      <p className="text-sm font-medium text-gray-900 mb-1">No hay registros</p>
                      <p className="text-xs text-gray-500 mb-4">Aún no se han creado registros en {activeModule.label}</p>
                      <Link href={activeModule.newHref}>
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
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
                  <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-6 py-3 border-b border-gray-100 bg-gray-50/60">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Trabajador / ID</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 min-w-[100px]">Estado</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 min-w-[120px] hidden sm:block">Fecha</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 min-w-[60px] text-right">Acción</span>
                  </div>

                  {/* Table body */}
                  <div className="divide-y divide-gray-50 bg-white">
                    {activeData.items.slice(0, 8).map((item) => {
                      const name = item.trabajador_nombre || 'Sin nombre';
                      const initials = name.split(' ').map(n => n.charAt(0)).slice(0, 2).join('').toUpperCase();
                      const doc = item.trabajador_documento || item.trabajador_identificacion || '—';

                      return (
                        <div
                          key={item.id}
                          onClick={() => setSelectedRecord(item)}
                          className="grid grid-cols-[1fr_auto_auto_auto] gap-4 items-center px-6 py-3.5 hover:bg-blue-50/40 transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                              {initials}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-gray-900 truncate">{name}</p>
                              <p className="text-xs text-gray-400 truncate">ID: {doc}</p>
                            </div>
                          </div>
                          <div className="min-w-[100px]">{getEstadoBadge(item.estado)}</div>
                          <div className="min-w-[120px] hidden sm:block">
                            <span className="text-xs text-gray-500">{getRecordDate(item)}</span>
                          </div>
                          <div className="min-w-[60px] text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                              onClick={(e) => { e.stopPropagation(); setSelectedRecord(item); }}
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Footer */}
                  {activeModule && (
                    <div className="px-6 py-3 border-t border-gray-100 bg-white">
                      <Link href={activeModule.href}>
                        <button className="w-full text-center text-xs font-bold uppercase tracking-wider text-gray-500 hover:text-blue-600 transition-colors flex items-center justify-center gap-1.5 py-1">
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


      {/* ─── Record Detail Modal ──────────────────────────────────── */}
      {selectedRecord && activeModule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedRecord(null)} />

          {/* Modal */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Top gradient accent */}
            <div className="h-1.5 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700" />

            {/* Header with close */}
            <div className="px-6 pt-5 pb-0 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-lg font-bold shadow-md shadow-blue-500/20">
                  {(selectedRecord.trabajador_nombre || 'SN').split(' ').map(n => n.charAt(0)).slice(0, 2).join('').toUpperCase()}
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    {selectedRecord.trabajador_nombre || 'Sin nombre'}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {selectedRecord.trabajador_documento || selectedRecord.trabajador_identificacion || '—'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-4 w-4 text-gray-400" />
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-5 space-y-4">
              {/* Info grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Módulo</p>
                  <p className="text-sm font-semibold text-gray-800">{activeModule.label}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Estado</p>
                  {getEstadoBadge(selectedRecord.estado)}
                </div>
                {selectedRecord.empresa && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Empresa</p>
                    <p className="text-sm text-gray-700">{selectedRecord.empresa}</p>
                  </div>
                )}
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Fecha</p>
                  <p className="text-sm text-gray-700">{getFormattedDate(selectedRecord)}</p>
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 rounded-xl bg-blue-50/60 border border-blue-100">
                  <p className="text-lg font-bold text-blue-600">#{selectedRecord.id}</p>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Registro</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-blue-50/60 border border-blue-100">
                  <p className="text-lg font-bold text-blue-600">{getRecordDate(selectedRecord)}</p>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Creado</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-blue-50/60 border border-blue-100">
                  <p className="text-lg font-bold text-blue-600 capitalize">{selectedRecord.estado}</p>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Estado</p>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="px-6 pb-5 flex gap-2">
              <Link href={`${activeModule.href}?id=${selectedRecord.id}&view=true`} className="flex-1">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-10 text-sm font-medium shadow-sm">
                  <Eye className="h-4 w-4 mr-2" />
                  Ver Registro
                </Button>
              </Link>
              <Link href={`${activeModule.newHref}?id=${selectedRecord.id}`} className="flex-1">
                <Button variant="outline" className="w-full rounded-xl h-10 text-sm font-medium border-gray-200 text-gray-700 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200">
                  <Pencil className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
}