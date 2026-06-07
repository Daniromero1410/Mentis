'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/app/services/api';
import { toast } from '@/components/ui/sileo-toast';
import { Loader2, Wand2, Settings2, Check, X, Plus, Trash2, Users, Download } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ARLS, SERVICIOS, MESES, formatCOP } from './constants';

interface ServicioAdmin {
    id: number;
    terapeuta_id: number;
    terapeuta_nombre: string;
    nombre_usuario: string;
    tipo_documento: string;
    numero_documento: string;
    arl: string;
    servicio: string;
    numero_autorizacion: string;
    fecha_realizacion: string;
    carpeta_cargue: string;
    cantidad: number;
    precio_unitario: number | null;
    total: number | null;
}

interface TotalArl {
    arl: string;
    total_servicios: number;
    valor_bruto: number;
    retefuente: number;
    valor_posterior_retefuente: number;
    pago_70: number;
}

interface Consolidado {
    servicios: ServicioAdmin[];
    totales_por_arl: TotalArl[];
    valor_bruto_total: number;
    retefuente_total: number;
    valor_posterior_retefuente_total: number;
    pago_70_total: number;
}

interface Cierre {
    id: number;
    terapeuta_id: number;
    terapeuta_nombre: string;
    estado: string;
    fecha_cierre: string | null;
    total_servicios: number;
}

interface Tarifa { id: number; arl: string; servicio: string; precio_unitario: number; }

const hoy = new Date();

export function VistaAdmin() {
    const [mes, setMes] = useState(hoy.getMonth() + 1);
    const [anio, setAnio] = useState(hoy.getFullYear());
    const [filtroArl, setFiltroArl] = useState('');
    const [filtroTerapeuta, setFiltroTerapeuta] = useState<number | ''>('');
    const [data, setData] = useState<Consolidado | null>(null);
    const [cierres, setCierres] = useState<Cierre[]>([]);
    const [loading, setLoading] = useState(true);
    const [precioEdit, setPrecioEdit] = useState<{ [id: number]: string }>({});
    const [showTarifas, setShowTarifas] = useState(false);

    const cargar = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ mes: String(mes), anio: String(anio) });
            if (filtroArl) params.append('arl', filtroArl);
            if (filtroTerapeuta) params.append('terapeuta_id', String(filtroTerapeuta));
            const [consolidado, cierresData] = await Promise.all([
                api.get<Consolidado>(`/cuentas/admin/servicios?${params.toString()}`),
                api.get<Cierre[]>(`/cuentas/admin/cierres?mes=${mes}&anio=${anio}`),
            ]);
            setData(consolidado);
            setCierres(cierresData);
        } catch (e: any) {
            toast.error(e.message || 'Error al cargar');
        } finally {
            setLoading(false);
        }
    }, [mes, anio, filtroArl, filtroTerapeuta]);

    useEffect(() => { cargar(); }, [cargar]);

    const guardarPrecio = async (id: number) => {
        const raw = precioEdit[id];
        if (raw === undefined) return;
        const precio = parseFloat(raw.replace(/[^0-9.]/g, ''));
        try {
            await api.put(`/cuentas/admin/servicios/${id}/precio`, { precio_unitario: isNaN(precio) ? 0 : precio });
            setPrecioEdit((p) => { const n = { ...p }; delete n[id]; return n; });
            cargar();
        } catch (e: any) {
            toast.error(e.message || 'Error al guardar precio');
        }
    };

    const aplicarTarifas = async () => {
        try {
            const res = await api.post<any>(`/cuentas/admin/aplicar-tarifas?mes=${mes}&anio=${anio}&solo_vacios=true`, {});
            toast.success(`${res.actualizados} servicio(s) actualizado(s) con el catálogo`);
            cargar();
        } catch (e: any) {
            toast.error(e.message || 'Error al aplicar tarifas');
        }
    };

    const cambiarEstadoCierre = async (cierreId: number, estado: string) => {
        try {
            await api.put(`/cuentas/admin/cierres/${cierreId}/estado?estado=${estado}`, {});
            toast.success('Estado actualizado');
            cargar();
        } catch (e: any) {
            toast.error(e.message || 'Error');
        }
    };

    const [exportando, setExportando] = useState(false);
    const exportarExcel = async () => {
        if (!data || data.servicios.length === 0) { toast.error('No hay datos para exportar'); return; }
        setExportando(true);
        try {
            const params = new URLSearchParams({ mes: String(mes), anio: String(anio) });
            if (filtroArl) params.append('arl', filtroArl);
            if (filtroTerapeuta) params.append('terapeuta_id', String(filtroTerapeuta));
            await api.downloadFile(`/cuentas/admin/exportar?${params.toString()}`, `Cuentas_${MESES[mes]}_${anio}.xlsx`);
            toast.success('Excel generado');
        } catch (e: any) {
            toast.error(e.message || 'Error al exportar');
        } finally {
            setExportando(false);
        }
    };

    const anios = [hoy.getFullYear() - 1, hoy.getFullYear(), hoy.getFullYear() + 1];
    const terapeutasUnicos = data
        ? Array.from(new Map(data.servicios.map((s) => [s.terapeuta_id, s.terapeuta_nombre])).entries())
        : [];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Consolidado de Cuentas</h1>
                    <p className="text-sm text-slate-500">Servicios de todos los terapeutas, precios y totales</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Select value={String(mes)} onValueChange={(v) => setMes(Number(v))}>
                        <SelectTrigger className={triggerCls}><SelectValue /></SelectTrigger>
                        <SelectContent>
                            {MESES.slice(1).map((m, i) => <SelectItem key={i + 1} value={String(i + 1)}>{m}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Select value={String(anio)} onValueChange={(v) => setAnio(Number(v))}>
                        <SelectTrigger className={triggerCls}><SelectValue /></SelectTrigger>
                        <SelectContent>
                            {anios.map((a) => <SelectItem key={a} value={String(a)}>{a}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <button onClick={() => setShowTarifas(true)} className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 h-10 text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                        <Settings2 size={15} /> Tarifas
                    </button>
                    <button onClick={exportarExcel} disabled={exportando} className="inline-flex items-center gap-2 rounded-full bg-green-600 px-4 h-10 text-sm font-medium text-white hover:bg-green-700 transition-colors disabled:opacity-50">
                        {exportando ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />} Exportar Excel
                    </button>
                </div>
            </div>

            {/* Cierres por terapeuta */}
            {cierres.length > 0 && (
                <div className="rounded-xl border border-slate-200 p-4">
                    <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-slate-700">
                        <Users size={16} /> Estado de cierres del mes
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {cierres.map((c) => (
                            <div key={c.id} className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs ${
                                c.estado === 'cerrado' ? 'border-amber-200 bg-amber-50' :
                                c.estado === 'revisado' ? 'border-green-200 bg-green-50' : 'border-slate-200 bg-slate-50'}`}>
                                <span className="font-medium text-slate-700">{c.terapeuta_nombre}</span>
                                <span className="text-slate-400">({c.total_servicios})</span>
                                <span className={`rounded px-1.5 py-0.5 font-medium ${
                                    c.estado === 'cerrado' ? 'bg-amber-100 text-amber-700' :
                                    c.estado === 'revisado' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                                    {c.estado}
                                </span>
                                {c.estado === 'cerrado' && (
                                    <button onClick={() => cambiarEstadoCierre(c.id, 'revisado')} title="Marcar revisado" className="text-green-600 hover:text-green-800"><Check size={14} /></button>
                                )}
                                {c.estado !== 'abierto' && (
                                    <button onClick={() => cambiarEstadoCierre(c.id, 'abierto')} title="Reabrir" className="text-slate-400 hover:text-slate-600"><X size={14} /></button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Filtros + acción tarifas */}
            <div className="flex flex-wrap items-center gap-2">
                <Select value={filtroArl || 'todas'} onValueChange={(v) => setFiltroArl(v === 'todas' ? '' : v)}>
                    <SelectTrigger className={triggerCls}><SelectValue placeholder="Todas las ARL" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="todas">Todas las ARL</SelectItem>
                        {ARLS.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                    </SelectContent>
                </Select>
                <Select value={filtroTerapeuta ? String(filtroTerapeuta) : 'todos'} onValueChange={(v) => setFiltroTerapeuta(v === 'todos' ? '' : Number(v))}>
                    <SelectTrigger className={triggerCls}><SelectValue placeholder="Todos los terapeutas" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="todos">Todos los terapeutas</SelectItem>
                        {terapeutasUnicos.map(([id, nombre]) => <SelectItem key={id} value={String(id)}>{nombre}</SelectItem>)}
                    </SelectContent>
                </Select>
                <button onClick={aplicarTarifas} className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-4 h-10 text-sm font-medium text-white hover:bg-brand-600 transition-colors">
                    <Wand2 size={15} /> Aplicar catálogo de precios
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-brand-500" /></div>
            ) : !data || data.servicios.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 py-16 text-center anim-fade-in">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                        <Users className="h-6 w-6 text-slate-400" />
                    </div>
                    <p className="text-sm text-slate-500">No hay servicios registrados en {MESES[mes]} {anio}.</p>
                </div>
            ) : (
                <>
                    {/* Totales */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <Stat label="Valor bruto" value={formatCOP(data.valor_bruto_total)} />
                        <Stat label="Retefuente (12%)" value={formatCOP(data.retefuente_total)} />
                        <Stat label="Valor posterior retefuente" value={formatCOP(data.valor_posterior_retefuente_total)} />
                        <Stat label="Pago 70%" value={formatCOP(data.pago_70_total)} accent />
                    </div>

                    {/* Tabla servicios */}
                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm anim-fade-in-up">
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm">
                                <thead>
                                    <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] uppercase tracking-wide text-slate-500">
                                        <th className="px-4 py-3 text-left font-semibold">Terapeuta</th>
                                        <th className="px-4 py-3 text-left font-semibold">Usuario</th>
                                        <th className="px-4 py-3 text-left font-semibold">ARL</th>
                                        <th className="px-4 py-3 text-left font-semibold">Servicio</th>
                                        <th className="px-4 py-3 text-center font-semibold">Cant.</th>
                                        <th className="px-4 py-3 text-right font-semibold">Precio unit.</th>
                                        <th className="px-4 py-3 text-right font-semibold">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {data.servicios.map((s) => (
                                        <tr key={s.id} className="group transition-colors hover:bg-brand-50/40">
                                            <td className="px-4 py-3 text-slate-500">{s.terapeuta_nombre}</td>
                                            <td className="px-4 py-3 font-medium text-slate-800">{s.nombre_usuario}</td>
                                            <td className="px-4 py-3">
                                                <span className="inline-flex items-center rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700">{s.arl}</span>
                                            </td>
                                            <td className="px-4 py-3 text-slate-600">{s.servicio}</td>
                                            <td className="px-4 py-3 text-center">
                                                <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-slate-100 px-2 text-xs font-semibold text-slate-600">{s.cantidad}</span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <input
                                                    value={precioEdit[s.id] !== undefined ? precioEdit[s.id] : (s.precio_unitario ?? '')}
                                                    onChange={(e) => setPrecioEdit((p) => ({ ...p, [s.id]: e.target.value }))}
                                                    onBlur={() => precioEdit[s.id] !== undefined && guardarPrecio(s.id)}
                                                    onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
                                                    placeholder="0"
                                                    className="w-28 h-8 rounded-lg border border-slate-200 px-2 text-right text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                                                />
                                            </td>
                                            <td className="px-4 py-3 text-right font-semibold text-slate-800">{formatCOP(s.total)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Totales por ARL */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm anim-fade-in-up">
                        <h3 className="text-sm font-semibold text-slate-700 mb-3">Totales por ARL</h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm">
                                <thead>
                                    <tr className="border-b border-slate-100 text-[11px] uppercase tracking-wide text-slate-400">
                                        <th className="px-3 py-2 text-left font-medium">ARL</th>
                                        <th className="px-3 py-2 text-center font-medium">Servicios</th>
                                        <th className="px-3 py-2 text-right font-medium">Valor bruto</th>
                                        <th className="px-3 py-2 text-right font-medium">Retefuente (12%)</th>
                                        <th className="px-3 py-2 text-right font-medium">Valor posterior retefuente</th>
                                        <th className="px-3 py-2 text-right font-medium">Pago 70%</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {data.totales_por_arl.map((t) => (
                                        <tr key={t.arl} className="transition-colors hover:bg-slate-50">
                                            <td className="px-3 py-2 font-medium text-slate-700">
                                                <span className="inline-flex items-center rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700">{t.arl}</span>
                                            </td>
                                            <td className="px-3 py-2 text-center text-slate-600">{t.total_servicios}</td>
                                            <td className="px-3 py-2 text-right text-slate-600">{formatCOP(t.valor_bruto)}</td>
                                            <td className="px-3 py-2 text-right text-slate-600">{formatCOP(t.retefuente)}</td>
                                            <td className="px-3 py-2 text-right text-slate-600">{formatCOP(t.valor_posterior_retefuente)}</td>
                                            <td className="px-3 py-2 text-right font-semibold text-slate-800">{formatCOP(t.pago_70)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}

            {showTarifas && <ModalTarifas onClose={() => { setShowTarifas(false); cargar(); }} />}
        </div>
    );
}

const triggerCls = "h-10 rounded-full border-slate-200 bg-white px-4 text-sm shadow-sm";

function Stat({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
    return (
        <div className={`rounded-2xl border p-4 shadow-sm transition-shadow hover:shadow-md anim-fade-in-scale ${accent ? 'border-brand-200 bg-brand-50' : 'border-slate-200 bg-white'}`}>
            <p className="text-xs text-slate-500">{label}</p>
            <p className={`text-xl font-bold ${accent ? 'text-brand-700' : 'text-slate-800'}`}>{value}</p>
        </div>
    );
}

// ── Modal de catálogo de tarifas ─────────────────────────────────────
function ModalTarifas({ onClose }: { onClose: () => void }) {
    const [tarifas, setTarifas] = useState<Tarifa[]>([]);
    const [loading, setLoading] = useState(true);
    const [nueva, setNueva] = useState({ arl: '', servicio: '', precio_unitario: '' });

    const cargar = async () => {
        setLoading(true);
        try {
            setTarifas(await api.get<Tarifa[]>('/cuentas/admin/tarifas'));
        } catch (e: any) {
            toast.error(e.message || 'Error');
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => { cargar(); }, []);

    const agregar = async () => {
        if (!nueva.arl || !nueva.servicio) { toast.error('Seleccione ARL y servicio'); return; }
        try {
            await api.post('/cuentas/admin/tarifas', {
                arl: nueva.arl, servicio: nueva.servicio,
                precio_unitario: parseFloat(nueva.precio_unitario.replace(/[^0-9.]/g, '')) || 0,
            });
            setNueva({ arl: '', servicio: '', precio_unitario: '' });
            cargar();
        } catch (e: any) {
            toast.error(e.message || 'Error');
        }
    };

    const eliminar = async (id: number) => {
        try { await api.delete(`/cuentas/admin/tarifas/${id}`); cargar(); }
        catch (e: any) { toast.error(e.message || 'Error'); }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 anim-backdrop-in" onClick={onClose}>
            <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl anim-modal-in" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-slate-800">Catálogo de tarifas</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
                </div>
                <p className="text-xs text-slate-500 mb-4">Define el precio por ARL + servicio. Luego usa &quot;Aplicar catálogo&quot; para asignarlos automáticamente.</p>

                {/* Nueva tarifa */}
                <div className="grid grid-cols-12 gap-2 mb-4">
                    <div className="col-span-4">
                        <Select value={nueva.arl} onValueChange={(v) => setNueva({ ...nueva, arl: v })}>
                            <SelectTrigger className="h-9 w-full rounded-full border-slate-200 text-sm"><SelectValue placeholder="ARL..." /></SelectTrigger>
                            <SelectContent>
                                {ARLS.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="col-span-4">
                        <Select value={nueva.servicio} onValueChange={(v) => setNueva({ ...nueva, servicio: v })}>
                            <SelectTrigger className="h-9 w-full rounded-full border-slate-200 text-sm"><SelectValue placeholder="Servicio..." /></SelectTrigger>
                            <SelectContent>
                                {SERVICIOS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <input value={nueva.precio_unitario} onChange={(e) => setNueva({ ...nueva, precio_unitario: e.target.value })} placeholder="Precio" className="col-span-3 h-9 rounded-full border border-slate-200 px-3 text-sm text-right" />
                    <button onClick={agregar} className="col-span-1 flex items-center justify-center rounded-full bg-brand-500 text-white hover:bg-brand-600"><Plus size={16} /></button>
                </div>

                {loading ? (
                    <div className="flex justify-center py-6"><Loader2 className="h-6 w-6 animate-spin text-brand-500" /></div>
                ) : tarifas.length === 0 ? (
                    <p className="text-center text-sm text-slate-400 py-6">Sin tarifas configuradas.</p>
                ) : (
                    <div className="overflow-x-auto rounded-lg border border-slate-200">
                        <table className="min-w-full text-sm">
                            <thead className="bg-slate-50 text-slate-600">
                                <tr>
                                    <th className="px-3 py-2 text-left font-semibold">ARL</th>
                                    <th className="px-3 py-2 text-left font-semibold">Servicio</th>
                                    <th className="px-3 py-2 text-right font-semibold">Precio</th>
                                    <th className="px-3 py-2"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {tarifas.map((t) => (
                                    <tr key={t.id}>
                                        <td className="px-3 py-2">{t.arl}</td>
                                        <td className="px-3 py-2">{t.servicio}</td>
                                        <td className="px-3 py-2 text-right">{formatCOP(t.precio_unitario)}</td>
                                        <td className="px-3 py-2 text-right">
                                            <button onClick={() => eliminar(t.id)} className="p-1 text-slate-400 hover:text-red-600"><Trash2 size={14} /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
