'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/app/services/api';
import { toast } from '@/components/ui/sileo-toast';
import { Plus, Trash2, Save, Lock, Loader2, CheckCircle2, Pencil, X } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { ARLS, SERVICIOS, TIPOS_DOCUMENTO, MESES } from './constants';

interface Servicio {
    id?: number;
    nombre_usuario: string;
    tipo_documento: string;
    numero_documento: string;
    arl: string;
    servicio: string;
    numero_autorizacion: string;
    fecha_realizacion: string;
    fecha_autorizacion: string;
    carpeta_cargue: string;
    cantidad: number;
    recomendaciones: string;
    en_pleno: string;
    pcl: string;
}

const emptyServicio = (): Servicio => ({
    nombre_usuario: '', tipo_documento: '', numero_documento: '', arl: '',
    servicio: '', numero_autorizacion: '', fecha_realizacion: '', fecha_autorizacion: '',
    carpeta_cargue: '', cantidad: 1, recomendaciones: '', en_pleno: '', pcl: '',
});

const hoy = new Date();

export function VistaTerapeuta() {
    const [mes, setMes] = useState(hoy.getMonth() + 1);
    const [anio, setAnio] = useState(hoy.getFullYear());
    const [servicios, setServicios] = useState<Servicio[]>([]);
    const [estadoCierre, setEstadoCierre] = useState<string>('abierto');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);
    const [form, setForm] = useState<Servicio>(emptyServicio());
    const [confirmCerrar, setConfirmCerrar] = useState(false);
    const [confirmEliminar, setConfirmEliminar] = useState<{ open: boolean; id: number | null }>({ open: false, id: null });
    const [procesando, setProcesando] = useState(false);
    const [serviciosCatalogo, setServiciosCatalogo] = useState<string[]>(SERVICIOS);
    const [cupsPorServicio, setCupsPorServicio] = useState<{ [nombre: string]: string }>({});

    const cerrado = estadoCierre === 'cerrado' || estadoCierre === 'revisado';

    useEffect(() => {
        api.get<{ id: number; nombre: string; cups: string | null }[]>('/cuentas/servicios-catalogo')
            .then((items) => {
                if (items.length) {
                    setServiciosCatalogo(items.map((s) => s.nombre));
                    const map: { [nombre: string]: string } = {};
                    items.forEach((s) => { if (s.cups) map[s.nombre] = s.cups; });
                    setCupsPorServicio(map);
                }
            })
            .catch(() => {});
    }, []);

    const cargar = useCallback(async () => {
        setLoading(true);
        try {
            const [serviciosData, cierreData] = await Promise.all([
                api.get<Servicio[]>(`/cuentas/mis-servicios?mes=${mes}&anio=${anio}`),
                api.get<any>(`/cuentas/mi-cierre?mes=${mes}&anio=${anio}`),
            ]);
            setServicios(serviciosData);
            setEstadoCierre(cierreData.estado);
        } catch (e: any) {
            toast.error(e.message || 'Error al cargar');
        } finally {
            setLoading(false);
        }
    }, [mes, anio]);

    useEffect(() => { cargar(); }, [cargar]);

    const abrirNuevo = () => {
        setForm(emptyServicio());
        setEditId(null);
        setShowForm(true);
    };

    const abrirEditar = (s: Servicio) => {
        setForm({ ...s });
        setEditId(s.id ?? null);
        setShowForm(true);
    };

    const guardar = async () => {
        if (!form.nombre_usuario.trim()) { toast.error('Ingrese el nombre del usuario'); return; }
        if (!form.servicio) { toast.error('Seleccione el servicio'); return; }
        setSaving(true);
        try {
            const payload = {
                ...form,
                cantidad: Number(form.cantidad) || 1,
                // Las fechas vacías deben ir como null (no como string vacío)
                fecha_realizacion: form.fecha_realizacion || null,
                fecha_autorizacion: form.fecha_autorizacion || null,
            };
            if (editId) {
                await api.put(`/cuentas/mis-servicios/${editId}`, payload);
                toast.success('Servicio actualizado');
            } else {
                await api.post(`/cuentas/mis-servicios?mes=${mes}&anio=${anio}`, payload);
                toast.success('Servicio agregado');
            }
            setShowForm(false);
            cargar();
        } catch (e: any) {
            toast.error(e.message || 'Error al guardar');
        } finally {
            setSaving(false);
        }
    };

    const ejecutarEliminar = async () => {
        const id = confirmEliminar.id;
        if (!id) return;
        setProcesando(true);
        try {
            await api.delete(`/cuentas/mis-servicios/${id}`);
            toast.success('Servicio eliminado');
            cargar();
        } catch (e: any) {
            toast.error(e.message || 'Error al eliminar');
        } finally {
            setProcesando(false);
            setConfirmEliminar({ open: false, id: null });
        }
    };

    const ejecutarCerrarMes = async () => {
        setProcesando(true);
        try {
            await api.post(`/cuentas/cerrar-mes?mes=${mes}&anio=${anio}`, {});
            toast.success('Mes cerrado y enviado al administrador');
            cargar();
        } catch (e: any) {
            toast.error(e.message || 'Error al cerrar el mes');
        } finally {
            setProcesando(false);
            setConfirmCerrar(false);
        }
    };

    const anios = [hoy.getFullYear() - 1, hoy.getFullYear(), hoy.getFullYear() + 1];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Mis Servicios</h1>
                    <p className="text-sm text-slate-500">Registra los servicios prestados durante el mes</p>
                </div>
                <div className="flex items-center gap-2">
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
                </div>
            </div>

            {/* Estado del mes */}
            <div className={`flex items-center justify-between rounded-xl border p-4 ${cerrado ? 'border-green-200 bg-green-50' : 'border-amber-200 bg-amber-50'}`}>
                <div className="flex items-center gap-2 text-sm">
                    {cerrado ? <Lock className="h-4 w-4 text-green-600" /> : <Pencil className="h-4 w-4 text-amber-600" />}
                    <span className={cerrado ? 'text-green-700 font-medium' : 'text-amber-700 font-medium'}>
                        {cerrado
                            ? `Mes cerrado (${estadoCierre === 'revisado' ? 'revisado por admin' : 'pendiente de revisión'})`
                            : 'Mes abierto — puedes agregar y editar servicios'}
                    </span>
                </div>
                <span className="text-sm text-slate-500">{servicios.length} servicio(s)</span>
            </div>

            {/* Acciones */}
            {!cerrado && (
                <div className="flex gap-2">
                    <button onClick={abrirNuevo}
                        className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 transition-colors">
                        <Plus size={16} /> Agregar servicio
                    </button>
                    {servicios.length > 0 && (
                        <button onClick={() => setConfirmCerrar(true)}
                            className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 transition-colors">
                            <CheckCircle2 size={16} /> Cerrar mes
                        </button>
                    )}
                </div>
            )}

            {/* Tabla */}
            {loading ? (
                <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-brand-500" /></div>
            ) : servicios.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 py-16 text-center anim-fade-in">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                        <Plus className="h-6 w-6 text-slate-400" />
                    </div>
                    <p className="text-sm text-slate-500">No hay servicios registrados en {MESES[mes]} {anio}.</p>
                    {!cerrado && <p className="text-xs text-slate-400 mt-1">Usa &quot;Agregar servicio&quot; para empezar.</p>}
                </div>
            ) : (
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm anim-fade-in-up">
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] uppercase tracking-wide text-slate-500">
                                    <th className="px-4 py-3 text-left font-semibold">Usuario</th>
                                    <th className="px-4 py-3 text-left font-semibold">Documento</th>
                                    <th className="px-4 py-3 text-left font-semibold">ARL</th>
                                    <th className="px-4 py-3 text-left font-semibold">Servicio</th>
                                    <th className="px-4 py-3 text-left font-semibold">Autorización</th>
                                    <th className="px-4 py-3 text-left font-semibold">F. Realización</th>
                                    <th className="px-4 py-3 text-left font-semibold">Carpeta</th>
                                    <th className="px-4 py-3 text-center font-semibold">Cant.</th>
                                    {!cerrado && <th className="px-4 py-3 text-center font-semibold">Acciones</th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {servicios.map((s) => (
                                    <tr key={s.id} className="group transition-colors hover:bg-brand-50/40">
                                        <td className="px-4 py-3 font-medium text-slate-800">{s.nombre_usuario}</td>
                                        <td className="px-4 py-3 text-slate-600">{s.tipo_documento} {s.numero_documento}</td>
                                        <td className="px-4 py-3">
                                            <span className="inline-flex items-center rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700">{s.arl}</span>
                                        </td>
                                        <td className="px-4 py-3 text-slate-600">{s.servicio}</td>
                                        <td className="px-4 py-3 text-slate-600">{s.numero_autorizacion}</td>
                                        <td className="px-4 py-3 text-slate-600">{s.fecha_realizacion}</td>
                                        <td className="px-4 py-3 text-slate-600">{s.carpeta_cargue}</td>
                                        <td className="px-4 py-3 text-center">
                                            <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-slate-100 px-2 text-xs font-semibold text-slate-600">{s.cantidad}</span>
                                        </td>
                                        {!cerrado && (
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-center gap-1 opacity-60 transition-opacity group-hover:opacity-100">
                                                    <button onClick={() => abrirEditar(s)} className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors">
                                                        <Pencil size={14} />
                                                    </button>
                                                    <button onClick={() => setConfirmEliminar({ open: true, id: s.id ?? null })} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal form */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 anim-backdrop-in" onClick={() => setShowForm(false)}>
                    <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl anim-modal-in" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-slate-800">{editId ? 'Editar servicio' : 'Nuevo servicio'}</h2>
                            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Field label="Nombre del usuario" className="md:col-span-2">
                                <input value={form.nombre_usuario} onChange={(e) => setForm({ ...form, nombre_usuario: e.target.value })} className={inputCls} />
                            </Field>
                            <Field label="Tipo de documento">
                                <Select value={form.tipo_documento} onValueChange={(v) => setForm({ ...form, tipo_documento: v })}>
                                    <SelectTrigger className={modalTriggerCls}><SelectValue placeholder="Seleccione..." /></SelectTrigger>
                                    <SelectContent>
                                        {TIPOS_DOCUMENTO.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </Field>
                            <Field label="N° de documento">
                                <input value={form.numero_documento} onChange={(e) => setForm({ ...form, numero_documento: e.target.value })} className={inputCls} />
                            </Field>
                            <Field label="ARL">
                                <Select value={form.arl} onValueChange={(v) => setForm({ ...form, arl: v })}>
                                    <SelectTrigger className={modalTriggerCls}><SelectValue placeholder="Seleccione..." /></SelectTrigger>
                                    <SelectContent>
                                        {ARLS.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </Field>
                            <Field label="Servicio">
                                <Select value={form.servicio} onValueChange={(v) => setForm({ ...form, servicio: v })}>
                                    <SelectTrigger className={modalTriggerCls}><SelectValue placeholder="Seleccione..." /></SelectTrigger>
                                    <SelectContent>
                                        {serviciosCatalogo.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </Field>
                            <Field label="CUPS (automático)">
                                <div className="flex h-10 items-center rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-600">
                                    {form.servicio && cupsPorServicio[form.servicio]
                                        ? cupsPorServicio[form.servicio]
                                        : <span className="text-slate-400">{form.servicio ? 'Sin CUPS asignado' : 'Seleccione un servicio'}</span>}
                                </div>
                            </Field>
                            <Field label="N° de autorización">
                                <input value={form.numero_autorizacion} onChange={(e) => setForm({ ...form, numero_autorizacion: e.target.value })} className={inputCls} />
                            </Field>
                            <Field label="Cantidad">
                                <input type="number" min={1} value={form.cantidad} onChange={(e) => setForm({ ...form, cantidad: Number(e.target.value) })} className={inputCls} />
                            </Field>
                            <Field label="Fecha de realización">
                                <DatePicker value={form.fecha_realizacion} onChange={(v) => setForm({ ...form, fecha_realizacion: v })} />
                            </Field>
                            <Field label="Fecha de autorización">
                                <DatePicker value={form.fecha_autorizacion} onChange={(v) => setForm({ ...form, fecha_autorizacion: v })} />
                            </Field>
                            <Field label="Carpeta de cargue" className="md:col-span-2">
                                <input value={form.carpeta_cargue} onChange={(e) => setForm({ ...form, carpeta_cargue: e.target.value })} placeholder="Ej: CI - 49306697 ó RHB" className={inputCls} />
                            </Field>
                        </div>
                        <div className="flex justify-end gap-2 mt-6">
                            <button onClick={() => setShowForm(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">Cancelar</button>
                            <button onClick={guardar} disabled={saving}
                                className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50">
                                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Guardar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirmar cerrar mes */}
            <ConfirmModal
                open={confirmCerrar}
                variant="warning"
                title={`¿Cerrar el mes de ${MESES[mes]} ${anio}?`}
                message="No podrás editar los servicios después y se notificará al administrador."
                confirmText="Sí, cerrar mes"
                loading={procesando}
                onConfirm={ejecutarCerrarMes}
                onCancel={() => setConfirmCerrar(false)}
            />

            {/* Confirmar eliminar servicio */}
            <ConfirmModal
                open={confirmEliminar.open}
                variant="danger"
                title="¿Eliminar este servicio?"
                message="Esta acción no se puede deshacer."
                confirmText="Eliminar"
                loading={procesando}
                onConfirm={ejecutarEliminar}
                onCancel={() => setConfirmEliminar({ open: false, id: null })}
            />
        </div>
    );
}

const inputCls = "h-10 w-full rounded-xl border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400";
const triggerCls = "h-10 rounded-full border-slate-200 bg-white px-4 text-sm shadow-sm";
const modalTriggerCls = "h-10 w-full rounded-xl border-slate-200 text-sm";

function Field({ label, children, className = '' }: { label: string; children: React.ReactNode; className?: string }) {
    return (
        <div className={className}>
            <label className="block text-xs font-medium text-slate-500 mb-1">{label}</label>
            {children}
        </div>
    );
}
