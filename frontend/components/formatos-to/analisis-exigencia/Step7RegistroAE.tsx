import React from 'react';
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
            <FormSection title="9. REGISTRO">
                <div className="border border-slate-200 rounded-lg overflow-hidden shadow-sm">
                    {/* Table Header */}
                    <div className="grid grid-cols-1 md:grid-cols-3 bg-slate-50 border-b border-slate-200">
                        <div className="py-3 px-4 text-center font-bold text-slate-700 text-sm border-b md:border-b-0 md:border-r border-slate-200 uppercase tracking-wide">
                            ELABORÓ
                        </div>
                        <div className="py-3 px-4 text-center font-bold text-slate-700 text-sm border-b md:border-b-0 md:border-r border-slate-200 uppercase tracking-wide">
                            REVISIÓN POR PROVEEDOR
                        </div>
                        <div className="py-3 px-4 text-center font-bold text-slate-700 text-sm uppercase tracking-wide">
                            EQUIPO DE REHABILITACIÓN INTEGRAL
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 bg-white">
                        {/* Column 1: ELABORÓ */}
                        <div className="border-b md:border-b-0 md:border-r border-slate-200 p-6 flex flex-col justify-between min-h-[300px]">
                            <div className="flex-1 flex flex-col gap-6">
                                {/* Firma */}
                                <div className="space-y-2 flex-1 flex flex-col">
                                    <div className="flex-1 min-h-[120px]">
                                        <FileUpload
                                            value={formData.firma_elaboro}
                                            onChange={(url) => updateField('firma_elaboro', url)}
                                            label="Insertar Firma"
                                            preview={true}
                                            className="h-full w-full"
                                        />
                                    </div>
                                </div>
                                {/* Nombre */}
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-slate-500 uppercase">Nombre y Apellido</Label>
                                    <Input
                                        value={formData.nombre_elaboro || ''}
                                        onChange={(e) => updateField('nombre_elaboro', e.target.value)}
                                        disabled={readOnly}
                                        className="h-9 bg-slate-50/50"
                                    />
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-slate-100 text-center">
                                <p className="text-[10px] font-bold text-slate-700 uppercase tracking-wide">Profesionales que realizan la valoración</p>
                            </div>
                        </div>

                        {/* Column 2: REVISIÓN */}
                        <div className="border-b md:border-b-0 md:border-r border-slate-200 p-6 flex flex-col justify-between min-h-[300px]">
                            <div className="flex-1 flex flex-col gap-6">
                                {/* Firma */}
                                <div className="space-y-2 flex-1 flex flex-col">
                                    <div className="flex-1 min-h-[120px]">
                                        <FileUpload
                                            value={formData.firma_revisor}
                                            onChange={(url) => updateField('firma_revisor', url)}
                                            label="Insertar Firma"
                                            preview={true}
                                            className="h-full w-full"
                                        />
                                    </div>
                                </div>
                                {/* Nombre */}
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-slate-500 uppercase">Nombre y Apellido</Label>
                                    <Input
                                        value={formData.nombre_revisor || ''}
                                        onChange={(e) => updateField('nombre_revisor', e.target.value)}
                                        disabled={readOnly}
                                        className="h-9 bg-slate-50/50"
                                    />
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-slate-100 text-center">
                                <p className="text-[10px] font-bold text-slate-700 uppercase tracking-wide">Profesional que revisa la valoración</p>
                            </div>
                        </div>

                        {/* Column 3: EQUIPO DE REHABILITACIÓN */}
                        <div className="p-6 flex flex-col justify-between min-h-[300px] bg-slate-50/30">
                            <div className="flex-1 flex flex-col justify-center items-center gap-4">
                                <Label className="text-xs font-bold text-slate-400 uppercase mb-2">Nombre Proveedor</Label>
                                <Input
                                    value={formData.nombre_proveedor || ''}
                                    onChange={(e) => updateField('nombre_proveedor', e.target.value)}
                                    disabled={readOnly}
                                    className="h-10 text-center font-bold text-blue-600 border-dashed border-blue-200 bg-blue-50/50 hover:bg-blue-50 placeholder:text-blue-300"
                                    placeholder="Nombre del Proveedor"
                                />
                            </div>
                            <div className="mt-4 pt-4 border-t border-slate-100 text-center">
                                <p className="text-[10px] font-bold text-slate-700 uppercase tracking-wide">Gerencia Médica</p>
                            </div>
                        </div>
                    </div>
                </div>
            </FormSection>
        </div>
    );
};
