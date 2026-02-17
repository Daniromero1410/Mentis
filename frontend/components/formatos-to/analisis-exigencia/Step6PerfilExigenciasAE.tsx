import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FormSection } from '../prueba-trabajo/FormComponents';

interface Step6AEProps {
    perfil: any; // Type this properly if possible
    setPerfil: (data: any) => void;
    readOnly?: boolean;
}

// Helper for the rating tables
const RatingTable = ({
    title,
    items,
    maxRating,
    values,
    onChange,
    readOnly
}: {
    title: string,
    items: string[],
    maxRating: number,
    values: any,
    onChange: (item: string, field: 'valor' | 'observacion', value: any) => void,
    readOnly?: boolean
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
                            <th className="px-4 py-3 w-1/3">FACTORES A EVALUAR</th>
                            <th className="px-4 py-3 w-1/4 text-center">CALIFICACIÓN ({0}-{maxRating})</th>
                            <th className="px-4 py-3">OBSERVACIONES</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, idx) => (
                            <tr key={idx} className="border-b hover:bg-slate-50/50">
                                <td className="px-4 py-2 font-medium text-slate-700">{item}</td>
                                <td className="px-4 py-2">
                                    <div className="flex justify-center gap-1">
                                        {Array.from({ length: maxRating + 1 }).map((_, r) => (
                                            <button
                                                key={r}
                                                type="button"
                                                disabled={readOnly}
                                                onClick={() => onChange(item, 'valor', r)}
                                                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${values[item]?.valor === r
                                                    ? 'bg-blue-600 text-white shadow-md scale-110'
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

export const Step6PerfilExigenciasAE = ({ perfil, setPerfil, readOnly }: Step6AEProps) => {

    // Helper to update state safely
    const updatePerfil = (category: string, item: string, field: 'valor' | 'observacion', value: any) => {
        setPerfil((prev: any) => ({
            ...prev,
            [category]: {
                ...prev[category],
                [item]: {
                    ...(prev[category]?.[item] || {}),
                    [field]: value
                }
            }
        }));
    };

    // Data definitions
    const visionItems = ['Percepción del Color', 'Percepción de Formas', 'Percepción de Tamaño', 'Relaciones Espaciales'];
    const audicionItems = ['Ubicación de Fuentes Sonoras', 'Discriminación Auditiva'];
    const sensibilidadItems = ['Estereognosia', 'Barognosia', 'Tacto Superficial', 'Percepción de Temperatura', 'Propiocepción'];
    const olfatoItems = ['Percepción de olores o sabores', 'Discriminación de olores o sabores'];

    const motricidadGruesaItems = [
        'Postura Bípeda', 'Postura Sedente', 'Posición de rodillas', 'Posición de Cuclillas',
        'Caminar', 'Subir (escaleras, rampas)', 'Bajar (escaleras, rampas)',
        'Levantar pesos', 'Transportar pesos', 'Agacharse', 'Inclinarse',
        'Alcanzar', 'Halar', 'Empujar', 'Rapidez Motriz', 'Equilibrio'
    ];

    const motricidadFinaItems = ['Enganche', 'Agarre', 'Pinza', 'Pinza Fina'];

    const armoniaItems = ['Uso de Ambas Manos', 'Coordinación Ojo - Mano', 'Coordinación Bimanual', 'Coordinación Mano - Pie'];

    const cognitivosItems = [
        'Atención', 'Concentración', 'Creatividad', 'Flexibilidad',
        'Responsabilidad', 'Rapidez de Reacción', 'Percepción Herramientas de Trabajo', 'Percepción Estética'
    ];

    const psicosocialesItems = [
        'Adaptación al Grupo de Trabajo', 'Adaptación al Ambiente', 'Relación con la Autoridad',
        'Relación con Compañeros', 'Liderazgo', 'Enfoque Constructivo',
        'Cooperación', 'Confiabilidad', 'Estabilidad Emocional', 'Confianza en sí mismo'
    ];

    const laboralesItems = [
        'Rendimiento', 'Asistencia', 'Puntualidad', 'Compromiso',
        'Autocontrol', 'Eficiencia', 'Organización y Métodos de Trabajo',
        'Calidad de Trabajo', 'Cuidado con los elementos', 'Higiene', 'Pulcritud'
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <FormSection title="11. PERFIL DE EXIGENCIAS">
                <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100 mb-6 text-sm text-blue-800">
                    <p>Califique de 0 a 4 (o 0 a 3 según corresponda) cada factor y añada observaciones si es necesario.</p>
                </div>

                {/* SENSOPERCEPCIÓN */}
                <h3 className="text-lg font-bold text-slate-800 mb-4 border-l-4 border-blue-500 pl-3">SENSOPERCEPCIÓN</h3>

                <RatingTable
                    title="VISIÓN"
                    items={visionItems}
                    maxRating={4}
                    values={perfil.sensopercepcion || {}}
                    onChange={(i, f, v) => updatePerfil('sensopercepcion', i, f, v)}
                    readOnly={readOnly}
                />
                <RatingTable
                    title="AUDICIÓN"
                    items={audicionItems}
                    maxRating={3}
                    values={perfil.sensopercepcion || {}}
                    onChange={(i, f, v) => updatePerfil('sensopercepcion', i, f, v)}
                    readOnly={readOnly}
                />
                <RatingTable
                    title="SENSIBILIDAD SUPERFICIAL Y PROPIOCEPCIÓN"
                    items={sensibilidadItems}
                    maxRating={3}
                    values={perfil.sensopercepcion || {}}
                    onChange={(i, f, v) => updatePerfil('sensopercepcion', i, f, v)}
                    readOnly={readOnly}
                />
                <RatingTable
                    title="OLFATO GUSTO"
                    items={olfatoItems}
                    maxRating={3}
                    values={perfil.sensopercepcion || {}}
                    onChange={(i, f, v) => updatePerfil('sensopercepcion', i, f, v)}
                    readOnly={readOnly}
                />

                {/* MOTRICIDAD GRUESA */}
                <h3 className="text-lg font-bold text-slate-800 mb-4 mt-8 border-l-4 border-blue-500 pl-3">MOTRICIDAD GRUESA</h3>
                <RatingTable
                    title="FACTORES A EVALUAR"
                    items={motricidadGruesaItems}
                    maxRating={3}
                    values={perfil.motricidad_gruesa || {}}
                    onChange={(i, f, v) => updatePerfil('motricidad_gruesa', i, f, v)}
                    readOnly={readOnly}
                />

                {/* MOTRICIDAD FINA */}
                <h3 className="text-lg font-bold text-slate-800 mb-4 mt-8 border-l-4 border-blue-500 pl-3">MOTRICIDAD FINA</h3>
                <RatingTable
                    title="FACTORES A EVALUAR"
                    items={motricidadFinaItems}
                    maxRating={3}
                    values={perfil.motricidad_fina || {}}
                    onChange={(i, f, v) => updatePerfil('motricidad_fina', i, f, v)}
                    readOnly={readOnly}
                />

                {/* ARMONÍA */}
                <h3 className="text-lg font-bold text-slate-800 mb-4 mt-8 border-l-4 border-blue-500 pl-3">ARMONÍA</h3>
                <RatingTable
                    title="FACTORES A EVALUAR"
                    items={armoniaItems}
                    maxRating={3}
                    values={perfil.armonia || {}}
                    onChange={(i, f, v) => updatePerfil('armonia', i, f, v)}
                    readOnly={readOnly}
                />

                {/* COGNITIVOS */}
                <h3 className="text-lg font-bold text-slate-800 mb-4 mt-8 border-l-4 border-blue-500 pl-3">COGNITIVOS</h3>
                <RatingTable
                    title="FACTORES A EVALUAR"
                    items={cognitivosItems}
                    maxRating={3}
                    values={perfil.cognitivos || {}}
                    onChange={(i, f, v) => updatePerfil('cognitivos', i, f, v)}
                    readOnly={readOnly}
                />

                {/* PSICOSOCIALES */}
                <h3 className="text-lg font-bold text-slate-800 mb-4 mt-8 border-l-4 border-blue-500 pl-3">PSICOSOCIALES</h3>
                <RatingTable
                    title="FACTORES A EVALUAR"
                    items={psicosocialesItems}
                    maxRating={3}
                    values={perfil.psicosociales || {}}
                    onChange={(i, f, v) => updatePerfil('psicosociales', i, f, v)}
                    readOnly={readOnly}
                />

                {/* LABORALES */}
                <h3 className="text-lg font-bold text-slate-800 mb-4 mt-8 border-l-4 border-blue-500 pl-3">LABORALES</h3>
                <RatingTable
                    title="FACTORES A EVALUAR"
                    items={laboralesItems}
                    maxRating={3}
                    values={perfil.laborales || {}}
                    onChange={(i, f, v) => updatePerfil('laborales', i, f, v)}
                    readOnly={readOnly}
                />

            </FormSection>
        </div>
    );
};
