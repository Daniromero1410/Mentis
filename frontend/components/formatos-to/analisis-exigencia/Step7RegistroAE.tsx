import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormSection } from '../prueba-trabajo/FormComponents';
import { FileUpload } from '@/components/ui/file-upload';

interface Step7AEProps {
    formData: any;
    updateField: (field: string, value: any) => void;
    readOnly?: boolean;
}

export const Step7RegistroAE = ({ formData, updateField, readOnly }: Step7AEProps) => {

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <FormSection title="10. REGISTRO">
                <div className="border border-slate-300 rounded-lg overflow-hidden">
                    {/* Table Header */}
                    <div className="grid grid-cols-1 md:grid-cols-3 bg-orange-100 border-b border-orange-200">
                        <div className="py-2 px-4 text-center font-bold text-slate-800 uppercase text-xs md:text-sm border-b md:border-b-0 md:border-r border-orange-200">
                            Elaboró
                        </div>
                        <div className="py-2 px-4 text-center font-bold text-slate-800 uppercase text-xs md:text-sm border-b md:border-b-0 md:border-r border-orange-200">
                            Revisión por Proveedor
                        </div>
                        <div className="py-2 px-4 text-center font-bold text-slate-800 uppercase text-xs md:text-sm bg-orange-100/50">
                            {/* Empty header for the third column as per image design, or keep title if needed */}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 bg-white">
                        {/* Column 1: ELABORÓ */}
                        <div className="border-b md:border-b-0 md:border-r border-slate-200 p-4 flex flex-col justify-between min-h-[250px]">
                            <div className="flex-1 flex flex-col justify-center items-center py-4">
                                <FileUpload
                                    value={formData.firma_elaboro}
                                    onChange={(url) => updateField('firma_elaboro', url)}
                                    label="Insertar Firma"
                                    preview={true}
                                    className="w-full max-w-[200px]"
                                />
                            </div>
                            <div className="space-y-2 border-t border-slate-100 pt-2">
                                <div>
                                    <Label className="text-[10px] text-slate-500 uppercase font-bold text-center block mb-1">Nombre y Apellido</Label>
                                    <Input
                                        value={formData.nombre_elaboro || ''}
                                        onChange={(e) => updateField('nombre_elaboro', e.target.value)}
                                        disabled={readOnly}
                                        className="text-center font-medium text-xs h-8"
                                        placeholder="Nombre del profesional"
                                    />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-700 text-center uppercase">Profesionales que realizan la valoración</p>
                                </div>
                            </div>
                        </div>

                        {/* Column 2: REVISIÓN */}
                        <div className="border-b md:border-b-0 md:border-r border-slate-200 p-4 flex flex-col justify-between min-h-[250px]">
                            <div className="flex-1 flex flex-col justify-center items-center py-4">
                                <FileUpload
                                    value={formData.firma_revisor}
                                    onChange={(url) => updateField('firma_revisor', url)}
                                    label="Insertar Firma"
                                    preview={true}
                                    className="w-full max-w-[200px]"
                                />
                            </div>
                            <div className="space-y-2 border-t border-slate-100 pt-2">
                                <div>
                                    <Label className="text-[10px] text-slate-500 uppercase font-bold text-center block mb-1">Nombre y Apellido</Label>
                                    <Input
                                        value={formData.nombre_revisor || ''}
                                        onChange={(e) => updateField('nombre_revisor', e.target.value)}
                                        disabled={readOnly}
                                        className="text-center font-medium text-xs h-8"
                                        placeholder="Nombre del revisor"
                                    />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-700 text-center uppercase">Profesional que revisa la valoración</p>
                                </div>
                            </div>
                        </div>

                        {/* Column 3: EQUIPO DE REHABILITACIÓN */}
                        <div className="bg-orange-50/30 p-4 flex flex-col justify-between min-h-[250px]">
                            <div className="text-center pt-4">
                                <p className="font-bold text-slate-800 uppercase text-xs md:text-sm mb-6">
                                    Equipo de<br />Rehabilitación Integral
                                </p>
                                <Input
                                    value={formData.nombre_proveedor || ''}
                                    onChange={(e) => updateField('nombre_proveedor', e.target.value)}
                                    disabled={readOnly}
                                    className="text-center font-bold text-blue-600 border-none bg-transparent text-sm md:text-base placeholder-blue-300"
                                    placeholder="Nombre Proveedor"
                                />
                            </div>
                            <div className="border-t border-slate-300 pt-2 text-center mt-auto">
                                <p className="font-bold text-slate-800 uppercase text-xs">Gerencia Médica</p>
                            </div>
                        </div>
                    </div>
                </div>
            </FormSection>
        </div>
    );
};
