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

    // Helper functions
    const handleComposicionChange = (field: string, value: any) => {
        updateData('composicion_familiar', field, value);
    };

    const handleRegistroChange = (field: string, value: any) => {
        updateData('registro', field, value);
    };

    // ===== Miembros Familiares =====
    const miembrosFamiliares = Array.isArray(data?.miembros_familiares) ? data.miembros_familiares : [];

    const handleAddMiembro = () => {
        const newArray = [...miembrosFamiliares, { composicion_nucleo: '', fecha_nacimiento: '', orden: miembrosFamiliares.length }];
        updateData('miembros_familiares', '', newArray);
    };

    const handleUpdateMiembro = (index: number, field: string, value: any) => {
        const newArray = [...miembrosFamiliares];
        newArray[index] = { ...newArray[index], [field]: value };
        updateData('miembros_familiares', '', newArray);
    };

    const handleRemoveMiembro = (index: number) => {
        const newArray = miembrosFamiliares.filter((_: any, i: number) => i !== index);
        const updatedArray = newArray.map((item: any, i: number) => ({ ...item, orden: i }));
        updateData('miembros_familiares', '', updatedArray);
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
            {/* COMPOSICIÓN FAMILIAR */}
            <FormSection title="9. Concepto Ocupacional">
                <div className="space-y-6">
                    <Card>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader className="bg-gray-50 dark:bg-gray-900/50">
                                    <TableRow>
                                        <TableHead>Composición del núcleo familiar</TableHead>
                                        <TableHead className="w-[200px]">Fecha Nacimiento</TableHead>
                                        {!readOnly && <TableHead className="w-[60px]"></TableHead>}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {miembrosFamiliares.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={readOnly ? 2 : 3} className="text-center text-gray-500 py-6">
                                                No se han ingresado familiares.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        miembrosFamiliares.map((row: any, index: number) => (
                                            <TableRow key={index}>
                                                <TableCell className="p-2">
                                                    <Input
                                                        value={row.composicion_nucleo || ''}
                                                        onChange={(e) => handleUpdateMiembro(index, 'composicion_nucleo', e.target.value)}
                                                        disabled={readOnly}
                                                        className="h-9"
                                                        placeholder="Ej. Esposa, Hijo Mayor..."
                                                    />
                                                </TableCell>
                                                <TableCell className="p-2">
                                                    <Input
                                                        type="date"
                                                        value={row.fecha_nacimiento || ''}
                                                        onChange={(e) => handleUpdateMiembro(index, 'fecha_nacimiento', e.target.value)}
                                                        disabled={readOnly}
                                                        className="h-9"
                                                    />
                                                </TableCell>
                                                {!readOnly && (
                                                    <TableCell className="p-2">
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleRemoveMiembro(index)}
                                                            className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </TableCell>
                                                )}
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200 shadow-sm">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-3">
                            <CardTitle className="text-sm font-bold text-slate-700">Detalles de Convivencia e Ingresos</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <FormField label="No. de Personas que Sostienen el Hogar">
                                <FormInput
                                    value={data?.composicion_familiar?.personas_sostienen_hogar || ''}
                                    onChange={(e) => handleComposicionChange('personas_sostienen_hogar', e.target.value)}
                                    disabled={readOnly}
                                    type="number"
                                    min="0"
                                />
                            </FormField>
                            <FormField label="Ingreso Promedio del Hogar">
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                                    <FormInput
                                        value={data?.composicion_familiar?.ingreso_promedio || ''}
                                        onChange={(e) => handleComposicionChange('ingreso_promedio', e.target.value)}
                                        disabled={readOnly}
                                        className="pl-7"
                                        placeholder="0.00"
                                    />
                                </div>
                            </FormField>
                            <FormField label="Convivencia Actual" className="lg:col-span-3">
                                <FormTextarea
                                    value={data?.composicion_familiar?.convivencia_actual || ''}
                                    onChange={(e) => handleComposicionChange('convivencia_actual', e.target.value)}
                                    disabled={readOnly}
                                    placeholder="Describa con quién convive actualmente..."
                                    className="min-h-[60px]"
                                />
                            </FormField>
                        </CardContent>
                    </Card>
                </div>
            </FormSection >

            {/* CONCEPTO Y ORIENTACIÓN */}
            <FormSection title="10. Orientación Ocupacional">
                <div className="space-y-6">
                    <Card className="border-slate-200 shadow-sm">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-3">
                            <CardTitle className="text-sm font-bold text-slate-700">Conceptos Individuales</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 grid gap-6">
                            <FormField label="Observación de Conducta">
                                <FormTextarea
                                    value={data?.registro?.observacion_conducta || ''}
                                    onChange={(e) => handleRegistroChange('observacion_conducta', e.target.value)}
                                    disabled={readOnly}
                                    placeholder="Describa la observación de conducta..."
                                    className="min-h-[80px]"
                                />
                            </FormField>

                            <FormField label="Aspecto Socio-Familiar">
                                <FormTextarea
                                    value={data?.registro?.aspecto_socio_familiar || ''}
                                    onChange={(e) => handleRegistroChange('aspecto_socio_familiar', e.target.value)}
                                    disabled={readOnly}
                                    placeholder="Describa el aspecto socio-familiar..."
                                    className="min-h-[80px]"
                                />
                            </FormField>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
