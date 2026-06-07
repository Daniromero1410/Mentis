'use client';

import { useState, useMemo } from 'react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarDays, ChevronLeft, ChevronRight, X } from 'lucide-react';

const MESES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];
const DIAS = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];

interface DatePickerProps {
    value?: string;                 // 'YYYY-MM-DD'
    onChange: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
    yearRange?: number;             // años hacia atrás/adelante desde hoy (default 80 atrás, 5 adelante)
}

function parseISO(value?: string): Date | null {
    if (!value) return null;
    const [y, m, d] = value.split('-').map(Number);
    if (!y || !m || !d) return null;
    return new Date(y, m - 1, d);
}

function toISO(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

function formatDisplay(date: Date): string {
    return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
}

export function DatePicker({ value, onChange, placeholder = 'Seleccione fecha', disabled, className, yearRange }: DatePickerProps) {
    const selected = parseISO(value);
    const hoy = new Date();
    const [open, setOpen] = useState(false);
    const [viewMonth, setViewMonth] = useState((selected ?? hoy).getMonth());
    const [viewYear, setViewYear] = useState((selected ?? hoy).getFullYear());

    const anios = useMemo(() => {
        const back = yearRange ?? 80;
        const fwd = 5;
        const start = hoy.getFullYear() - back;
        const end = hoy.getFullYear() + fwd;
        const arr: number[] = [];
        for (let y = end; y >= start; y--) arr.push(y);
        return arr;
    }, [yearRange]);

    // Construir matriz de días
    const semanas = useMemo(() => {
        const primerDia = new Date(viewYear, viewMonth, 1);
        const inicioSemana = primerDia.getDay(); // 0=domingo
        const diasEnMes = new Date(viewYear, viewMonth + 1, 0).getDate();
        const celdas: (number | null)[] = [];
        for (let i = 0; i < inicioSemana; i++) celdas.push(null);
        for (let d = 1; d <= diasEnMes; d++) celdas.push(d);
        while (celdas.length % 7 !== 0) celdas.push(null);
        const filas: (number | null)[][] = [];
        for (let i = 0; i < celdas.length; i += 7) filas.push(celdas.slice(i, i + 7));
        return filas;
    }, [viewMonth, viewYear]);

    const irMes = (delta: number) => {
        let m = viewMonth + delta;
        let y = viewYear;
        if (m < 0) { m = 11; y--; }
        if (m > 11) { m = 0; y++; }
        setViewMonth(m);
        setViewYear(y);
    };

    const seleccionar = (dia: number) => {
        onChange(toISO(new Date(viewYear, viewMonth, dia)));
        setOpen(false);
    };

    const esSeleccionado = (dia: number) =>
        selected && selected.getDate() === dia && selected.getMonth() === viewMonth && selected.getFullYear() === viewYear;

    const esHoy = (dia: number) =>
        hoy.getDate() === dia && hoy.getMonth() === viewMonth && hoy.getFullYear() === viewYear;

    return (
        <Popover open={open} onOpenChange={(o) => {
            setOpen(o);
            if (o) { // al abrir, posicionar en la fecha seleccionada
                const base = selected ?? hoy;
                setViewMonth(base.getMonth());
                setViewYear(base.getFullYear());
            }
        }}>
            <PopoverTrigger asChild disabled={disabled}>
                <button
                    type="button"
                    disabled={disabled}
                    className={`flex h-10 w-full items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm text-left transition-colors hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-400 disabled:opacity-50 ${className ?? ''}`}
                >
                    <span className={selected ? 'text-slate-800' : 'text-slate-400'}>
                        {selected ? formatDisplay(selected) : placeholder}
                    </span>
                    <span className="flex items-center gap-1">
                        {selected && !disabled && (
                            <X size={14} className="text-slate-300 hover:text-slate-500" onClick={(e) => { e.stopPropagation(); onChange(''); }} />
                        )}
                        <CalendarDays size={16} className="text-slate-400" />
                    </span>
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-[290px] p-3 bg-white shadow-xl border border-slate-200 rounded-xl" align="start">
                {/* Header: navegación + selectores mes/año */}
                <div className="flex items-center gap-1.5 mb-3">
                    <button type="button" onClick={() => irMes(-1)} className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100">
                        <ChevronLeft size={16} />
                    </button>
                    <div className="flex flex-1 gap-1.5">
                        <Select value={String(viewMonth)} onValueChange={(v) => setViewMonth(Number(v))}>
                            <SelectTrigger className="h-8 flex-1 rounded-lg border-slate-200 text-xs"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {MESES.map((m, i) => <SelectItem key={i} value={String(i)}>{m}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <Select value={String(viewYear)} onValueChange={(v) => setViewYear(Number(v))}>
                            <SelectTrigger className="h-8 w-[78px] rounded-lg border-slate-200 text-xs"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {anios.map((y) => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <button type="button" onClick={() => irMes(1)} className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100">
                        <ChevronRight size={16} />
                    </button>
                </div>

                {/* Días de la semana */}
                <div className="grid grid-cols-7 mb-1">
                    {DIAS.map((d, i) => (
                        <div key={i} className="text-center text-[11px] font-semibold text-slate-400 py-1">{d}</div>
                    ))}
                </div>

                {/* Grilla de días */}
                <div className="grid grid-cols-7 gap-0.5">
                    {semanas.map((fila, fi) => fila.map((dia, di) => (
                        <div key={`${fi}-${di}`} className="aspect-square">
                            {dia && (
                                <button
                                    type="button"
                                    onClick={() => seleccionar(dia)}
                                    className={`h-full w-full rounded-lg text-sm transition-colors
                                        ${esSeleccionado(dia)
                                            ? 'bg-brand-500 text-white font-semibold'
                                            : esHoy(dia)
                                                ? 'bg-brand-50 text-brand-700 font-medium'
                                                : 'text-slate-700 hover:bg-slate-100'}`}
                                >
                                    {dia}
                                </button>
                            )}
                        </div>
                    )))}
                </div>

                {/* Acción rápida: hoy */}
                <div className="mt-2 flex justify-between border-t border-slate-100 pt-2">
                    <button type="button" onClick={() => { onChange(''); setOpen(false); }} className="text-xs text-slate-400 hover:text-slate-600">
                        Limpiar
                    </button>
                    <button type="button" onClick={() => { onChange(toISO(hoy)); setOpen(false); }} className="text-xs font-medium text-brand-600 hover:text-brand-700">
                        Hoy
                    </button>
                </div>
            </PopoverContent>
        </Popover>
    );
}
