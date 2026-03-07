import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { FormSection, FormField, FormInput, FormTextarea } from '../prueba-trabajo/FormComponents';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Trash2, Upload } from 'lucide-react';

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */

interface Seccion6Props {
    data: any;
    updateData: (section: string, field: string, value: any) => void;
    readOnly?: boolean;
}

export function Seccion7ComposicionRegistro({ data, updateData, readOnly = false }: Seccion6Props) {

    const handleRegistroChange = (field: string, value: any) => {
        updateData('registro', field, value);
    };

    // Handler para firmas (Simuladas en Base64 por ahora o guardando el path)
    // Usualmente se subiría el archivo a S3/Local y se guardaría URL,
    // o se usaría un componente CanvasSignature
    const handleFirmaUpload = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                handleRegistroChange(field, reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* CONCEPTO Y ORIENTACIÓN */}
            <FormSection title="9. Concepto y Orientación Ocupacional">
                <div className="space-y-6">
                    <Card className="border-slate-200 shadow-sm">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-3">
                            <CardTitle className="text-sm font-bold text-slate-700">Conceptos Individuales</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 grid gap-6">
                            <div className="grid grid-cols-1 gap-6">
                                <FormField label="Concepto Ocupacional">
                                    <FormTextarea
                                        value={data?.registro?.concepto_ocupacional || data?.registro?.concepto_to || ''}
                                        onChange={(e) => handleRegistroChange('concepto_ocupacional', e.target.value)}
                                        disabled={readOnly}
                                        placeholder="Concepto final de la evaluación..."
                                        className="min-h-[120px]"
                                    />
                                </FormField>

                                <FormField label="Orientación Ocupacional">
                                    <FormTextarea
                                        value={data?.registro?.orientacion_ocupacional || ''}
                                        onChange={(e) => handleRegistroChange('orientacion_ocupacional', e.target.value)}
                                        disabled={readOnly}
                                        placeholder="Orientación y recomendaciones..."
                                        className="min-h-[120px]"
                                    />
                                </FormField>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </FormSection>

            {/* REGISTRO Y FIRMAS */}
            <FormSection title="11. Registro">
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
                                <div className="space-y-2 flex-1 flex flex-col">
                                    <div className="flex-1 min-h-[120px]">
                                        {data?.registro?.firma_elaboro ? (
                                            <div className="border rounded p-2 bg-white flex justify-center flex-col items-center h-full">
                                                <img src={data.registro.firma_elaboro} alt="Firma Elaboro" className="max-h-24 object-contain" />
                                                {!readOnly && (
                                                    <Button type="button" variant="ghost" size="sm" onClick={() => handleRegistroChange('firma_elaboro', '')} className="text-red-500 mt-2 h-7">
                                                        Eliminar firma
                                                    </Button>
                                                )}
                                            </div>
                                        ) : (
                                            !readOnly && (
                                                <Label className="flex w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50/50 transition-all py-6 h-full">
                                                    <Upload className="mb-2 h-6 w-6 text-blue-500" />
                                                    <span className="text-xs font-semibold text-slate-600">Insertar Firma</span>
                                                    <Input type="file" className="hidden" accept="image/*" onChange={(e) => handleFirmaUpload(e, 'firma_elaboro')} />
                                                </Label>
                                            )
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-slate-500 uppercase">Nombre y Apellido</Label>
                                    <Input
                                        value={data?.registro?.nombre_elaboro || ''}
                                        onChange={(e) => handleRegistroChange('nombre_elaboro', e.target.value)}
                                        disabled={readOnly}
                                        className="h-9 bg-slate-50/50"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-slate-500 uppercase">Licencia S.O No.</Label>
                                    <Input
                                        value={data?.registro?.licencia_so_elaboro || ''}
                                        onChange={(e) => handleRegistroChange('licencia_so_elaboro', e.target.value)}
                                        disabled={readOnly}
                                        className="h-9 bg-slate-50/50"
                                    />
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-slate-100 text-center">
                                <p className="text-[10px] font-bold text-slate-700 uppercase tracking-wide">Profesionales que realizan la valoración</p>
                            </div>
                        </div>

                        {/* Column 2: REVISIÓN PROVEEDOR */}
                        <div className="border-b md:border-b-0 md:border-r border-slate-200 p-6 flex flex-col justify-between min-h-[300px]">
                            <div className="flex-1 flex flex-col gap-6">
                                <div className="space-y-2 flex-1 flex flex-col">
                                    <div className="flex-1 min-h-[120px]">
                                        {data?.registro?.firma_proveedor ? (
                                            <div className="border rounded p-2 bg-white flex justify-center flex-col items-center h-full">
                                                <img src={data.registro.firma_proveedor} alt="Firma Proveedor" className="max-h-24 object-contain" />
                                                {!readOnly && (
                                                    <Button type="button" variant="ghost" size="sm" onClick={() => handleRegistroChange('firma_proveedor', '')} className="text-red-500 mt-2 h-7">
                                                        Eliminar firma
                                                    </Button>
                                                )}
                                            </div>
                                        ) : (
                                            !readOnly && (
                                                <Label className="flex w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50/50 transition-all py-6 h-full">
                                                    <Upload className="mb-2 h-6 w-6 text-blue-500" />
                                                    <span className="text-xs font-semibold text-slate-600">Insertar Firma</span>
                                                    <Input type="file" className="hidden" accept="image/*" onChange={(e) => handleFirmaUpload(e, 'firma_proveedor')} />
                                                </Label>
                                            )
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-slate-500 uppercase">Nombre y Apellido</Label>
                                    <Input
                                        value={data?.registro?.nombre_proveedor || ''}
                                        onChange={(e) => handleRegistroChange('nombre_proveedor', e.target.value)}
                                        disabled={readOnly}
                                        className="h-9 bg-slate-50/50"
                                    />
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-slate-100 text-center">
                                <p className="text-[10px] font-bold text-slate-700 uppercase tracking-wide">Profesional que revisa la valoración</p>
                            </div>
                        </div>

                        {/* Column 3: EQUIPO RHB */}
                        <div className="p-6 flex flex-col justify-between min-h-[300px] bg-slate-50/30">
                            <div className="flex-1 flex flex-col justify-center items-center gap-4">
                                <Label className="text-xs font-bold text-slate-400 uppercase mb-2">Nombre Proveedor</Label>
                                <Input
                                    value={data?.registro?.nombre_equipo_rhb || ''}
                                    onChange={(e) => handleRegistroChange('nombre_equipo_rhb', e.target.value)}
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
}
