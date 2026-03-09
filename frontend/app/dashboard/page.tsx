'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/app/components/layout/DashboardLayout';
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
  TrendingUp,
  Eye,
  Pencil,
  X,
  Building2,
  Hash,
  Clock,
} from 'lucide-react';
import Link from 'next/link';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

// ─── Module definitions ──────────────────────────────────────
interface ModuleDefinition {
  key: string;
  label: string;
  shortLabel: string;
  icon: any;
  href: string;
  newHref: string;
  apiEndpoint: string;
  permissionCheck: (user: any) => boolean;
  getViewUrl: (id: number) => string;
  getEditUrl: (id: number) => string;
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
    getViewUrl: (id) => `/dashboard/valoraciones/nueva?id=${id}&modo=ver`,
    getEditUrl: (id) => `/dashboard/valoraciones/nueva?id=${id}&modo=editar`,
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
    getViewUrl: (id) => `/dashboard/pruebas-trabajo/${id}`,
    getEditUrl: (id) => `/dashboard/pruebas-trabajo/${id}/evaluar`,
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
    getViewUrl: (id) => `/dashboard/formatos-to/pruebas-trabajo/${id}?mode=view`,
    getEditUrl: (id) => `/dashboard/formatos-to/pruebas-trabajo/${id}?mode=edit`,
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
    getViewUrl: (id) => `/dashboard/formatos-to/analisis-exigencia/${id}`,
    getEditUrl: (id) => `/dashboard/formatos-to/analisis-exigencia/${id}/editar`,
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
    getViewUrl: (id) => `/dashboard/formatos-to/valoracion-ocupacional/nueva?id=${id}&view=true`,
    getEditUrl: (id) => `/dashboard/formatos-to/valoracion-ocupacional/nueva?id=${id}`,
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
    getViewUrl: (id) => `/dashboard/analisis-exigencias-mental/${id}`,
    getEditUrl: (id) => `/dashboard/analisis-exigencias-mental/${id}/evaluar`,
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
  const [modalVisible, setModalVisible] = useState(false);

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
      console.error('Error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (token) fetchData();
  }, [token]);

  const handleRefresh = () => { setRefreshing(true); fetchData(); };

  const openModal = (item: RecordItem) => {
    setSelectedRecord(item);
    requestAnimationFrame(() => setModalVisible(true));
  };

  const closeModal = () => {
    setModalVisible(false);
    setTimeout(() => setSelectedRecord(null), 200);
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
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200 badge-animate">COMPLETADA</span>;
      case 'revisada':
      case 'en_proceso':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-700 border border-amber-200 badge-animate">EN PROCESO</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-brand-100 text-brand-700 border border-brand-200 badge-animate">BORRADOR</span>;
    }
  };

  const getRecordDate = (item: RecordItem) => {
    const d = item.fecha_creacion || item.created_at || item.fecha_valoracion || '';
    if (!d) return '—';
    try { return formatDistanceToNow(new Date(d), { addSuffix: true, locale: es }); } catch { return '—'; }
  };

  const getFormattedDate = (item: RecordItem) => {
    const d = item.fecha_creacion || item.created_at || item.fecha_valoracion || '';
    if (!d) return '—';
    try { return format(new Date(d), "d 'de' MMMM, yyyy", { locale: es }); } catch { return '—'; }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 anim-fade-in">
        <div className="grid gap-6 lg:grid-cols-[340px_1fr]">

          {/* ─── Left Panel ───────────────────────────────────── */}
          <div className="space-y-5">

            {/* Welcome — no Card wrapper, manual rounded container */}
            <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm anim-fade-in-up bg-white">
              <div className="bg-brand-600 px-5 pt-6 pb-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
                    <TrendingUp className="h-4 w-4 text-[#ffc600]" />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-widest text-[#ffc600]/70">Foco del día</span>
                </div>
                <h2 className="text-2xl font-bold text-[#ffc600] mb-1">Hola, {user?.nombre}</h2>
                <p className="text-sm text-[#ffc600]/80 capitalize flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  {formattedDate}
                </p>
              </div>

              <div className="p-4 bg-white">
                <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-3">Crear Nuevo</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {availableModules.map((mod, idx) => {
                    const Icon = mod.icon;
                    return (
                      <Link key={mod.key} href={mod.newHref}>
                        <div className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border border-gray-100 bg-white hover:border-brand-300 hover:bg-brand-50 hover:shadow-md cursor-pointer group opacity-0 anim-fade-in-up delay-${idx + 1}`} style={{ animationFillMode: 'forwards' }}>
                          <div className="p-2 rounded-lg bg-brand-600 shadow-sm group-hover:scale-110 group-hover:shadow-md transition-transform duration-200">
                            <Icon className="h-4 w-4 text-[#ffc600]" />
                          </div>
                          <span className="text-[10px] font-semibold text-gray-500 group-hover:text-brand-600 text-center leading-tight line-clamp-2 transition-colors duration-200">{mod.shortLabel}</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm opacity-0 anim-fade-in-up delay-2" style={{ animationFillMode: 'forwards' }}>
              <div className="divide-y divide-gray-100">
                {[
                  { icon: ClipboardList, label: 'Total Registros', value: totalRegistros, color: 'text-gray-900' },
                  { icon: FileCheck, label: 'Completados', value: totalCompletadas, color: 'text-brand-600' },
                  { icon: FileEdit, label: 'Pendientes', value: totalBorradores, color: 'text-brand-600' },
                ].map((stat, idx) => {
                  const SIcon = stat.icon;
                  return (
                    <div key={idx} className="flex items-center justify-between px-5 py-3.5 hover:bg-brand-50/30 row-hover">
                      <div className="flex items-center gap-3">
                        <SIcon className="h-4 w-4 text-brand-500" />
                        <span className="text-sm font-medium text-gray-700">{stat.label}</span>
                      </div>
                      {loading ? (
                        <div className="h-6 w-8 rounded bg-gray-100 animate-pulse" />
                      ) : (
                        <span className={`text-lg font-bold ${stat.color}`}>{stat.value}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modules List */}
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-4 opacity-0 anim-fade-in-up delay-3" style={{ animationFillMode: 'forwards' }}>
              <h3 className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-3">Módulos Disponibles</h3>
              <div className="space-y-0.5">
                {availableModules.map((mod) => {
                  const Icon = mod.icon;
                  const count = moduleData[mod.key]?.total || 0;
                  return (
                    <Link key={mod.key} href={mod.href}>
                      <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-brand-50 row-hover cursor-pointer group">
                        <div className="p-1.5 rounded-lg bg-brand-50 text-brand-600 group-hover:bg-brand-100 transition-colors duration-200">
                          <Icon className="h-3.5 w-3.5" />
                        </div>
                        <span className="flex-1 text-sm font-medium text-gray-700 group-hover:text-brand-600 truncate transition-colors duration-200">{mod.label}</span>
                        {!loading && <span className="text-xs font-semibold text-gray-400 group-hover:text-brand-500 transition-colors duration-200">{count}</span>}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>


          {/* ─── Right Panel ──────────────────────────────────── */}
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden opacity-0 anim-slide-right delay-1" style={{ animationFillMode: 'forwards' }}>
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 bg-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-brand-50 text-brand-600">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">Centro de Actividad</h2>
              </div>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-2 rounded-lg text-gray-400 hover:text-brand-600 hover:bg-brand-50 disabled:opacity-50"
              >
                <RefreshCcw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Module Tabs */}
            <div className="px-3 sm:px-6 py-2.5 border-b border-gray-100 bg-white overflow-x-auto scrollbar-none">
              <div className="flex gap-1">
                {availableModules.map((mod) => (
                  <button
                    key={mod.key}
                    onClick={() => setActiveTab(mod.key)}
                    className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap tab-transition ${activeTab === mod.key
                      ? 'bg-brand-600 text-[#ffc600] shadow-sm shadow-brand-500/25'
                      : 'text-gray-500 hover:text-brand-600 hover:bg-brand-50'
                      }`}
                  >
                    {mod.shortLabel}
                  </button>
                ))}
              </div>
            </div>

            {/* Table */}
            <div className="bg-white">
              {loading ? (
                <div className="p-6 space-y-4">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="flex items-center gap-4 animate-pulse">
                      <div className="w-9 h-9 rounded-full bg-gray-100" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-36 bg-gray-100 rounded" />
                        <div className="h-3 w-24 bg-gray-50 rounded" />
                      </div>
                      <div className="h-5 w-20 bg-gray-100 rounded-full" />
                    </div>
                  ))}
                </div>
              ) : activeData.items.length === 0 ? (
                <div className="p-12 text-center anim-fade-in-scale" style={{ animationFillMode: 'forwards' }}>
                  {activeModule && (
                    <>
                      <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-brand-50 text-brand-500 flex items-center justify-center">
                        {(() => { const Icon = activeModule.icon; return <Icon className="h-7 w-7" />; })()}
                      </div>
                      <p className="text-sm font-medium text-gray-900 mb-1">No hay registros</p>
                      <p className="text-xs text-gray-500 mb-4">Aún no se han creado registros en {activeModule.label}</p>
                      <Link href={activeModule.newHref}>
                        <Button size="sm" className="bg-brand-600 hover:bg-brand-700 text-white">
                          <Plus className="h-3.5 w-3.5 mr-1" />
                          Crear primero
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_auto_auto_auto] gap-3 sm:gap-4 px-4 sm:px-6 py-3 border-b border-gray-100 bg-gray-50/60">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Trabajador / ID</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 min-w-[80px] sm:min-w-[100px] hidden sm:block">Estado</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 min-w-[100px] hidden md:block">Fecha</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 text-right">Estado</span>
                  </div>

                  <div className="divide-y divide-gray-50 bg-white">
                    {activeData.items.slice(0, 8).map((item, idx) => {
                      const name = item.trabajador_nombre || 'Sin nombre';
                      const initials = name.split(' ').map(n => n.charAt(0)).slice(0, 2).join('').toUpperCase();
                      const doc = item.trabajador_documento || item.trabajador_identificacion || '—';

                      return (
                        <div
                          key={item.id}
                          onClick={() => openModal(item)}
                          className={`grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_auto_auto_auto] gap-3 sm:gap-4 items-center px-4 sm:px-6 py-3 sm:py-3.5 hover:bg-brand-50/40 row-hover cursor-pointer opacity-0 anim-fade-in-up delay-${idx + 1}`}
                          style={{ animationFillMode: 'forwards' }}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-full bg-brand-600 flex items-center justify-center text-[#ffc600] text-xs font-bold shrink-0 shadow-sm">
                              {initials}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-gray-900 truncate">{name}</p>
                              <p className="text-xs text-gray-400 truncate">ID: {doc}</p>
                            </div>
                          </div>
                          <div className="hidden sm:block min-w-[80px]">{getEstadoBadge(item.estado)}</div>
                          <div className="min-w-[100px] hidden md:block">
                            <span className="text-xs text-gray-500">{getRecordDate(item)}</span>
                          </div>
                          <div className="text-right flex items-center gap-1 justify-end">
                            <span className="sm:hidden">{getEstadoBadge(item.estado)}</span>
                            <button
                              className="p-2 rounded-lg text-gray-400 hover:text-brand-600 hover:bg-brand-50 hidden sm:block"
                              onClick={(e) => { e.stopPropagation(); openModal(item); }}
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {activeModule && (
                    <div className="px-6 py-3 border-t border-gray-100 bg-white">
                      <Link href={activeModule.href}>
                        <button className="w-full text-center text-xs font-bold uppercase tracking-wider text-gray-500 hover:text-brand-600 flex items-center justify-center gap-1.5 py-1">
                          Ver historial completo
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      </Link>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>


      {/* ─── Record Detail Modal ──────────────────────────────── */}
      {selectedRecord && activeModule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-200 ${modalVisible ? 'opacity-100' : 'opacity-0'}`}
            onClick={closeModal}
          />

          <div className={`relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden transition-all duration-200 ${modalVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'}`}>
            {/* Gradient header */}
            <div className="bg-brand-600 px-6 pt-5 pb-6 relative">
              <button onClick={closeModal} className="absolute top-4 right-4 p-1.5 hover:bg-white/20 rounded-lg transition-colors duration-200">
                <X className="h-4 w-4 text-[#ffc600]/80" />
              </button>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-[#ffc600] text-lg font-bold shadow-lg border-2 border-white/30">
                  {(selectedRecord.trabajador_nombre || 'SN').split(' ').map(n => n.charAt(0)).slice(0, 2).join('').toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#ffc600]">{selectedRecord.trabajador_nombre || 'Sin nombre'}</h3>
                  <p className="text-sm text-[#ffc600]/80">{selectedRecord.trabajador_documento || selectedRecord.trabajador_identificacion || '—'}</p>
                </div>
              </div>
            </div>

            {/* Info fields */}
            <div className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <Hash className="h-3 w-3 text-brand-400" />
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Registro</p>
                  </div>
                  <p className="text-sm font-semibold text-gray-800">#{selectedRecord.id}</p>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <Activity className="h-3 w-3 text-brand-400" />
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Estado</p>
                  </div>
                  {getEstadoBadge(selectedRecord.estado)}
                </div>
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <ClipboardList className="h-3 w-3 text-brand-400" />
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Módulo</p>
                  </div>
                  <p className="text-sm text-gray-700">{activeModule.label}</p>
                </div>
                {selectedRecord.empresa && (
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <Building2 className="h-3 w-3 text-brand-400" />
                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Empresa</p>
                    </div>
                    <p className="text-sm text-gray-700">{selectedRecord.empresa}</p>
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <Calendar className="h-3 w-3 text-brand-400" />
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Fecha</p>
                  </div>
                  <p className="text-sm text-gray-700">{getFormattedDate(selectedRecord)}</p>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <Clock className="h-3 w-3 text-brand-400" />
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Creado</p>
                  </div>
                  <p className="text-sm text-gray-700">{getRecordDate(selectedRecord)}</p>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="px-6 pb-5 flex gap-3">
              <Link href={activeModule.getViewUrl(selectedRecord.id)} className="flex-1">
                <Button className="w-full bg-brand-600 hover:bg-brand-700 text-white rounded-xl h-11 text-sm font-medium shadow-sm hover:shadow-md">
                  <Eye className="h-4 w-4 mr-2" />
                  Ver Registro
                </Button>
              </Link>
              <Link href={activeModule.getEditUrl(selectedRecord.id)} className="flex-1">
                <Button variant="outline" className="w-full rounded-xl h-11 text-sm font-medium border-gray-200 text-gray-700 hover:bg-brand-50 hover:text-brand-600 hover:border-brand-200">
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