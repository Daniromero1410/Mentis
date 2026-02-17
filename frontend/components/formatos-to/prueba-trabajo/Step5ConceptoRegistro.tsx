import React, { useState } from 'react';
import { FormSection, FormRow, FormField, FormTextarea, FormInput } from './FormComponents';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, X, Loader2 } from 'lucide-react';
import { toast } from 'sileo';

interface Step5Props {
    formData: any;
    updateField: (field: string, value: any) => void;
    readOnly?: boolean;
}

import { useAuth } from '@/app/context/AuthContext';

export const Step5ConceptoRegistro = ({ formData, updateField, readOnly }: Step5Props) => {
    const { token } = useAuth();
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    const [uploading, setUploading] = useState<string | null>(null);

    const handleImageUpload = async (field: string, e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        const file = e.target.files[0];
        const formDataUpload = new FormData();
        formDataUpload.append('file', file);

        setUploading(field);
        try {
            const res = await fetch(`${API_URL}/uploads/firma`, { // Use dedicated signature endpoint
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formDataUpload
            });

            if (!res.ok) throw new Error('Error subiendo imagen');

            const data = await res.json();
            updateField(field, data.url);
            toast.success('Firma subida correctamente');
        } catch (error) {
            console.error('Error uploading image:', error);
            toast.error('Error al subir la imagen');
        } finally {
            setUploading(null);
        }
    };

    const removeImage = (field: string) => {
        updateField(field, '');
    };

    const renderSignatureField = (field: string, label: string) => {
        const value = formData[field];
        return (
            <div className="space-y-2">
                <label className="text-xs font-medium text-slate-500">{label}</label>
                {value ? (
                    <div className="relative group border border-slate-200 rounded-md overflow-hidden bg-white h-24 flex items-center justify-center">
                        <img
                            src={`${API_URL}${value}`}
                            alt="Firma"
                            className="h-full object-contain"
                        />
                        {!readOnly && (
                            <button
                                onClick={() => removeImage(field)}
                                className="absolute top-1 right-1 p-1 bg-red-100 text-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Eliminar firma"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="h-24 border border-dashed border-slate-300 rounded-md flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors">
                        {!readOnly ? (
                            <>
                                {uploading === field ? (
                                    <Loader2 className="h-6 w-6 text-indigo-500 animate-spin" />
                                ) : (
                                    <label className="cursor-pointer flex flex-col items-center justify-center w-full h-full">
                                        <Upload className="h-6 w-6 text-slate-400 mb-1" />
                                        <span className="text-xs text-slate-500">Subir firma</span>
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={(e) => handleImageUpload(field, e)}
                                        />
                                    </label>
                                )}
                            </>
                        ) : (
                            <span className="text-xs text-slate-400 italic">Sin firma registrada</span>
                        )}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <FormSection title="7. CONCEPTO PARA PRUEBA DE TRABAJO">
                <FormField label="COMPETENCIA, SEGURIDAD, CONFORT, RELACIONES SOCIALES, OTROS ASPECTOS">
                    <FormTextarea
                        className="min-h-[120px]"
                        value={formData.concepto_prueba_trabajo}
                        onChange={(e) => updateField('concepto_prueba_trabajo', e.target.value)}
                        disabled={readOnly}
                    />
                </FormField>
            </FormSection>

            <FormSection title="8. RECOMENDACIONES">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="border-slate-200 shadow-sm">
                        <CardHeader className="py-3 border-b border-slate-100 bg-slate-50/50">
                            <CardTitle className="text-sm font-bold text-slate-700">PARA EL TRABAJADOR</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4">
                            <FormTextarea
                                className="min-h-[150px] border-none focus-visible:ring-0 p-0 resize-none shadow-none"
                                placeholder="Escriba aquí las recomendaciones..."
                                value={formData.recomendaciones_trabajador}
                                onChange={(e) => updateField('recomendaciones_trabajador', e.target.value)}
                                disabled={readOnly}
                            />
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200 shadow-sm">
                        <CardHeader className="py-3 border-b border-slate-100 bg-slate-50/50">
                            <CardTitle className="text-sm font-bold text-slate-700">PARA LA EMPRESA</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4">
                            <FormTextarea
                                className="min-h-[150px] border-none focus-visible:ring-0 p-0 resize-none shadow-none"
                                placeholder="Escriba aquí las recomendaciones..."
                                value={formData.recomendaciones_empresa}
                                onChange={(e) => updateField('recomendaciones_empresa', e.target.value)}
                                disabled={readOnly}
                            />
                        </CardContent>
                    </Card>
                </div>
            </FormSection>

            <FormSection title="9. REGISTRO">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Elaboró */}
                    <Card className="border-slate-200 shadow-sm">
                        <CardHeader className="py-2 border-b border-slate-100 bg-slate-50 text-center">
                            <CardTitle className="text-xs font-bold text-slate-700 uppercase">ELABORÓ</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-4">
                            <FormField label="NOMBRE">
                                <FormInput
                                    value={formData.nombre_elaboro}
                                    onChange={(e) => updateField('nombre_elaboro', e.target.value)}
                                    disabled={readOnly}
                                />
                            </FormField>
                            {renderSignatureField('firma_elaboro', 'FIRMA')}
                            <FormField label="Licencia S.O">
                                <FormInput
                                    value={formData.licencia_so_elaboro}
                                    onChange={(e) => updateField('licencia_so_elaboro', e.target.value)}
                                    disabled={readOnly}
                                />
                            </FormField>
                        </CardContent>
                    </Card>

                    {/* Revisó */}
                    <Card className="border-slate-200 shadow-sm">
                        <CardHeader className="py-2 border-b border-slate-100 bg-slate-50 text-center">
                            <CardTitle className="text-xs font-bold text-slate-700 uppercase">REVISÓ</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-4">
                            <FormField label="NOMBRE">
                                <FormInput
                                    value={formData.nombre_revisor}
                                    onChange={(e) => updateField('nombre_revisor', e.target.value)}
                                    disabled={readOnly}
                                />
                            </FormField>
                            {renderSignatureField('firma_revisor', 'FIRMA')}
                            <FormField label="Licencia S.O">
                                <FormInput
                                    value={formData.licencia_so_revisor}
                                    onChange={(e) => updateField('licencia_so_revisor', e.target.value)}
                                    disabled={readOnly}
                                />
                            </FormField>
                        </CardContent>
                    </Card>

                    {/* Datos del Usuario */}
                    <Card className="border-slate-200 shadow-sm">
                        <CardHeader className="py-2 border-b border-slate-100 bg-slate-50 text-center">
                            <CardTitle className="text-xs font-bold text-slate-700 uppercase">DATOS DEL USUARIO</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-4">
                            <FormField label="NOMBRE">
                                <FormInput
                                    value={formData.nombre_trabajador}
                                    disabled={true}
                                />
                            </FormField>
                            {/* Reordered: Signature then Document */}
                            {renderSignatureField('firma_trabajador', 'FIRMA DEL TRABAJADOR')}
                            <FormField label="C.C">
                                <FormInput
                                    value={formData.numero_documento}
                                    disabled={true}
                                />
                            </FormField>
                        </CardContent>
                    </Card>
                </div>
            </FormSection>
        </div>
    );
};
