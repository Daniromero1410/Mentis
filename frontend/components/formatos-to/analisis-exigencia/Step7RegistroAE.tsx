import React, { useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormSection } from '../prueba-trabajo/FormComponents';

interface Step7AEProps {
    formData: any;
    updateField: (field: string, value: any) => void;
    readOnly?: boolean;
}

export const Step7RegistroAE = ({ formData, updateField, readOnly }: Step7AEProps) => {

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <FormSection title="12. REGISTRO">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                    {/* ELABORÓ */}
                    <Card className="border-slate-200 shadow-sm h-full">
                        <div className="bg-orange-100 border-b border-orange-200 py-2 px-4 text-center font-bold text-slate-800 uppercase text-sm">
                            Elaboró
                        </div>
                        <CardContent className="p-6 space-y-6 flex flex-col justify-end h-[calc(100%-40px)]">
                            {/* Firma Placeholder */}
                            <div className="border-b border-slate-300 min-h-[80px] flex items-end justify-center pb-2">
                                <span className="text-slate-400 text-sm italic">Insertar Firma</span>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <Label className="text-xs text-slate-500 uppercase font-bold text-center block mb-1">Nombre y Apellido</Label>
                                    <Input
                                        value={formData.nombre_elaboro || ''}
                                        onChange={(e) => updateField('nombre_elaboro', e.target.value)}
                                        disabled={readOnly}
                                        className="text-center font-medium"
                                        placeholder="Nombre del profesional"
                                    />
                                </div>

                                <div className="text-center pt-2 border-t border-slate-100">
                                    <p className="text-sm font-bold text-slate-700">Profesionales que realizan la valoración</p>
                                    <Input
                                        value={formData.licencia_so_elaboro || ''}
                                        onChange={(e) => updateField('licencia_so_elaboro', e.target.value)}
                                        disabled={readOnly}
                                        className="mt-2 text-center text-xs"
                                        placeholder="Licencia S.O."
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* REVISIÓN POR PROVEEDOR */}
                    <Card className="border-slate-200 shadow-sm h-full">
                        <div className="bg-orange-100 border-b border-orange-200 py-2 px-4 text-center font-bold text-slate-800 uppercase text-sm">
                            Revisión por Proveedor
                        </div>
                        <CardContent className="p-6 space-y-6 flex flex-col justify-end h-[calc(100%-40px)]">
                            {/* Firma Placeholder */}
                            <div className="border-b border-slate-300 min-h-[80px] flex items-end justify-center pb-2">
                                <span className="text-slate-400 text-sm italic">Insertar Firma</span>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <Label className="text-xs text-slate-500 uppercase font-bold text-center block mb-1">Nombre y Apellido</Label>
                                    <Input
                                        value={formData.nombre_revisor || ''}
                                        onChange={(e) => updateField('nombre_revisor', e.target.value)}
                                        disabled={readOnly}
                                        className="text-center font-medium"
                                        placeholder="Nombre del revisor"
                                    />
                                </div>

                                <div className="text-center pt-2 border-t border-slate-100">
                                    <p className="text-sm font-bold text-slate-700">Profesional que revisa la valoración</p>
                                    <Input
                                        value={formData.licencia_so_revisor || ''}
                                        onChange={(e) => updateField('licencia_so_revisor', e.target.value)}
                                        disabled={readOnly}
                                        className="mt-2 text-center text-xs"
                                        placeholder="Licencia S.O."
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* EQUIPO DE REHABILITACIÓN INTEGRAL */}
                    <Card className="border-slate-200 shadow-sm md:col-span-2 bg-orange-50/30">
                        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                            <div className="text-center space-y-2">
                                <Label className="text-sm font-bold text-slate-700 uppercase">Equipo de Rehabilitación Integral</Label>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <Input
                                        value={formData.nombre_proveedor || ''}
                                        onChange={(e) => updateField('nombre_proveedor', e.target.value)}
                                        disabled={readOnly}
                                        className="text-center font-bold text-blue-600 border-blue-200 bg-blue-50/50"
                                        placeholder="NOMBRE PROVEEDOR"
                                    />
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-bold text-slate-800 uppercase border-t border-slate-300 pt-1 inline-block min-w-[200px]">Gerencia Médica</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                </div>
            </FormSection>
        </div>
    );
};
