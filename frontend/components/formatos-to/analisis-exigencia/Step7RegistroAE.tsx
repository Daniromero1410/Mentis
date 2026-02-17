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
                            REVISÓ
                        </div>
                        <div className="py-3 px-4 text-center font-bold text-slate-700 text-sm uppercase tracking-wide">
                            DATOS DEL USUARIO
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 bg-white">
                        {/* Column 1: ELABORÓ */}
                        <div className="border-b md:border-b-0 md:border-r border-slate-200 p-6 flex flex-col gap-6">

                            {/* Nombre */}
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-slate-500 uppercase">NOMBRE</Label>
                                <Input
                                    value={formData.nombre_elaboro || ''}
                                    onChange={(e) => updateField('nombre_elaboro', e.target.value)}
                                    disabled={readOnly}
                                    className="h-9 bg-slate-50/50"
                                />
                            </div>

                            {/* Firma */}
                            <div className="space-y-2 flex-1 flex flex-col">
                                <Label className="text-xs font-bold text-slate-500 uppercase">FIRMA</Label>
                                <div className="flex-1 min-h-[120px]">
                                    <FileUpload
                                        value={formData.firma_elaboro}
                                        onChange={(url) => updateField('firma_elaboro', url)}
                                        label="Subir firma"
                                        preview={true}
                                        className="h-full w-full"
                                    />
                                </div>
                            </div>

                            {/* Licencia */}
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-slate-500 uppercase">LICENCIA S.O</Label>
                                <Input
                                    value={formData.licencia_elaboro || ''} // Assuming this field exists or needs to be added to state
                                    onChange={(e) => updateField('licencia_elaboro', e.target.value)}
                                    disabled={readOnly}
                                    className="h-9 bg-slate-50/50"
                                />
                            </div>
                        </div>

                        {/* Column 2: REVISÓ */}
                        <div className="border-b md:border-b-0 md:border-r border-slate-200 p-6 flex flex-col gap-6">

                            {/* Nombre */}
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-slate-500 uppercase">NOMBRE</Label>
                                <Input
                                    value={formData.nombre_revisor || ''}
                                    onChange={(e) => updateField('nombre_revisor', e.target.value)}
                                    disabled={readOnly}
                                    className="h-9 bg-slate-50/50"
                                />
                            </div>

                            {/* Firma */}
                            <div className="space-y-2 flex-1 flex flex-col">
                                <Label className="text-xs font-bold text-slate-500 uppercase">FIRMA</Label>
                                <div className="flex-1 min-h-[120px]">
                                    <FileUpload
                                        value={formData.firma_revisor}
                                        onChange={(url) => updateField('firma_revisor', url)}
                                        label="Subir firma"
                                        preview={true}
                                        className="h-full w-full"
                                    />
                                </div>
                            </div>

                            {/* Licencia */}
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-slate-500 uppercase">LICENCIA S.O</Label>
                                <Input
                                    value={formData.licencia_revisor || ''} // Assuming this field exists or needs to be added to state
                                    onChange={(e) => updateField('licencia_revisor', e.target.value)}
                                    disabled={readOnly}
                                    className="h-9 bg-slate-50/50"
                                />
                            </div>
                        </div>

                        {/* Column 3: DATOS DEL USUARIO */}
                        <div className="p-6 flex flex-col gap-6">
                            {/* Nombre */}
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-slate-500 uppercase">NOMBRE</Label>
                                <Input
                                    value={formData.nombre_proveedor || ''} // Mapping 'nombre_proveedor' to User Name based on previous logic
                                    onChange={(e) => updateField('nombre_proveedor', e.target.value)}
                                    disabled={readOnly}
                                    className="h-9 bg-slate-50/50"
                                />
                            </div>

                            {/* Firma */}
                            <div className="space-y-2 flex-1 flex flex-col">
                                <Label className="text-xs font-bold text-slate-500 uppercase">FIRMA DEL TRABAJADOR</Label>
                                <div className="flex-1 min-h-[120px]">
                                    <FileUpload
                                        value={formData.firma_trabajador} // Assuming specific field for worker signature
                                        onChange={(url) => updateField('firma_trabajador', url)}
                                        label="Subir firma"
                                        preview={true}
                                        className="h-full w-full"
                                    />
                                </div>
                            </div>

                            {/* C.C */}
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-slate-500 uppercase">C.C</Label>
                                <Input
                                    value={formData.cedula_trabajador || ''}
                                    onChange={(e) => updateField('cedula_trabajador', e.target.value)}
                                    disabled={readOnly}
                                    className="h-9 bg-slate-50/50"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </FormSection>
        </div>
    );
};
