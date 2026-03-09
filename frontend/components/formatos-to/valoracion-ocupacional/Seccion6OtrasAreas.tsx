import { useState } from 'react';
import { FormSection } from '../prueba-trabajo/FormComponents';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

interface Seccion5Props {
    data: any;
    updateData: (section: string, field: string, value: any) => void;
    readOnly?: boolean;
}

// Rating table columns matching the paper format
const DIFFICULTY_LEVELS = [
    'No dificultad\nNo dependencia',
    'Dificultad leve\nNo dependencia',
    'Dificultad moderada\nDependencia moderada',
    'Dificultad severa\nDependencia severa',
    'Dificultad completa\nDependencia grave',
];

const RatingTable = ({
    title,
    items,
    values,
    onChange,
    readOnly,
}: {
    title: string;
    items: string[];
    values: any;
    onChange: (item: string, field: 'valor' | 'observacion', value: any) => void;
    readOnly?: boolean;
}) => {
    return (
        <Card className="mb-6 border-slate-200 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50 border-b border-slate-100 py-3">
                <CardTitle className="text-sm font-bold text-slate-700 uppercase">{title}</CardTitle>
            </CardHeader>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
                        <tr>
                            <th className="px-4 py-3 w-1/4 font-bold">FACTORES A EVALUAR</th>
                            <th className="px-2 py-3 text-center" colSpan={5}>
                                <div className="flex justify-center gap-1">
                                    {DIFFICULTY_LEVELS.map((level, i) => (
                                        <div key={i} className="w-12 text-center text-[9px] leading-tight font-medium">
                                            {i}
                                        </div>
                                    ))}
                                </div>
                            </th>
                            <th className="px-4 py-3 w-1/4">OBSERVACIONES</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, idx) => (
                            <tr key={idx} className="border-b hover:bg-slate-50/50">
                                <td className="px-4 py-2 font-medium text-slate-700">{item}</td>
                                <td className="px-2 py-2" colSpan={5}>
                                    <div className="flex justify-center gap-1">
                                        {Array.from({ length: 5 }).map((_, r) => (
                                            <button
                                                key={r}
                                                type="button"
                                                disabled={readOnly}
                                                onClick={() => onChange(item, 'valor', r)}
                                                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${values[item]?.valor === r
                                                    ? 'bg-brand-600 text-[#ffc600] shadow-md scale-110'
                                                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                                    }`}
                                            >
                                                {r}
                                            </button>
                                        ))}
                                    </div>
                                </td>
                                <td className="px-4 py-2">
                                    <Textarea
                                        value={values[item]?.observacion || ''}
                                        onChange={(e) => onChange(item, 'observacion', e.target.value)}
                                        disabled={readOnly}
                                        placeholder="Observaciones..."
                                        className="min-h-[40px] h-[40px] resize-none text-xs py-2"
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};

// Data definitions for each category (matching paper format exactly)
const cuidadoPersonalItems = [
    'Lavarse', 'Cuidado de partes del cuerpo', 'Higiene personal (procesos excreción)',
    'Vestirse', 'Quitarse la ropa', 'Ponerse calzado', 'Comer', 'Beber',
    'Cuidado de la propia salud', 'Control de la dieta y forma física',
];

const comunicacionItems = [
    'Con recepción de mensajes verbales', 'Con recepción de mensajes no verbales',
    'Con recepción de mensajes en lenguaje de signos', 'Con recepción de mensajes escritos',
    'Habla', 'Producción de mensajes no verbales', 'Mensajes escritos',
    'Conversación', 'Discusión',
    'Utilización de dispositivos y técnicas de comunicación',
];

const movilidadItems = [
    'Cambiar las posturas corporales básicas', 'Mantener la posición del cuerpo',
    'Levantar y llevar objetos', 'Uso fino de la mano', 'Uso de la mano y el brazo',
    'Andar y desplazarse por el entorno', 'Desplazarse por distintos lugares',
    'Desplazarse utilizando algún tipo de equipo', 'Utilizar transporte como pasajero',
    'Conducir',
];

const aprendizajeItems = [
    'Mirar', 'Escuchar', 'Aprender a leer escribir y calcular',
    'Aprender a calcular', 'Pensar', 'Leer', 'Escribir', 'Calcular',
    'Resolver problemas y tomar decisiones',
];

const vidaDomesticaItems = [
    'Adquisición de un lugar para vivir', 'Adquisición de bienes y servicios',
    'Comprar', 'Preparar comidas', 'Realizar quehaceres de la casa',
    'Limpieza de la vivienda', 'Cuidado de los objetos del Hogar',
    'Ayudar a los demás', 'Mantenimiento de dispositivos de ayuda',
    'Cuidado de los animales',
];

export function Seccion6OtrasAreas({ data, updateData, readOnly = false }: Seccion5Props) {
    // The evaluacion_otras_areas now stores nested objects per category
    const getValues = (category: string) => {
        const val = data?.evaluacion_otras_areas?.[category];
        if (!val) return {};
        if (typeof val === 'string') {
            try { return JSON.parse(val); } catch { return {}; }
        }
        return val;
    };

    const handleChange = (category: string, item: string, field: 'valor' | 'observacion', value: any) => {
        // Get the current state of this category
        const currentCategory = getValues(category);
        const updatedCategory = {
            ...currentCategory,
            [item]: {
                ...(currentCategory[item] || {}),
                [field]: value,
            },
        };
        updateData('evaluacion_otras_areas', category, JSON.stringify(updatedCategory));
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <FormSection title="8. Evaluación Otras Áreas Ocupacionales">
                <div className="bg-brand-50/50 p-4 rounded-lg border border-brand-100 mb-6 text-sm text-brand-800">
                    <p>Califique de 0 a 4 cada factor según el nivel de dificultad/dependencia y añada observaciones si es necesario.</p>
                    <div className="grid grid-cols-5 gap-2 mt-3 text-xs text-brand-700">
                        {DIFFICULTY_LEVELS.map((level, i) => (
                            <div key={i} className="text-center">
                                <span className="font-bold">{i}</span> = {level.replace('\n', ' / ')}
                            </div>
                        ))}
                    </div>
                </div>

                <RatingTable
                    title="Cuidado Personal"
                    items={cuidadoPersonalItems}
                    values={getValues('cuidado_personal')}
                    onChange={(item, field, value) => handleChange('cuidado_personal', item, field, value)}
                    readOnly={readOnly}
                />

                <RatingTable
                    title="Comunicación"
                    items={comunicacionItems}
                    values={getValues('comunicacion')}
                    onChange={(item, field, value) => handleChange('comunicacion', item, field, value)}
                    readOnly={readOnly}
                />

                <RatingTable
                    title="Movilidad"
                    items={movilidadItems}
                    values={getValues('movilidad')}
                    onChange={(item, field, value) => handleChange('movilidad', item, field, value)}
                    readOnly={readOnly}
                />

                <RatingTable
                    title="Aprendizaje y aplicación del conocimiento / Sensopercepción"
                    items={aprendizajeItems}
                    values={getValues('aprendizaje_sensopercepcion')}
                    onChange={(item, field, value) => handleChange('aprendizaje_sensopercepcion', item, field, value)}
                    readOnly={readOnly}
                />

                <RatingTable
                    title="Vida Doméstica"
                    items={vidaDomesticaItems}
                    values={getValues('vida_domestica')}
                    onChange={(item, field, value) => handleChange('vida_domestica', item, field, value)}
                    readOnly={readOnly}
                />
            </FormSection>
        </div>
    );
}
