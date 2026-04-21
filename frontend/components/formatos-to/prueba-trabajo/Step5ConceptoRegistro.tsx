import { FormSection, FormField, FormTextarea } from './FormComponents';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileUpload } from '@/components/ui/file-upload';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2 } from 'lucide-react';

interface Step5Props {
    formData: any;
    updateField: (field: string, value: any) => void;
    readOnly?: boolean;
    onGenerarRecomendaciones?: () => void;
    generandoRecomendaciones?: boolean;
}

export const Step5ConceptoRegistro = ({ formData, updateField, readOnly, onGenerarRecomendaciones, generandoRecomendaciones }: Step5Props) => {
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
                {!readOnly && onGenerarRecomendaciones && (
                    <div className="flex justify-end mb-4">
                        <Button
                            type="button"
                            onClick={onGenerarRecomendaciones}
                            disabled={generandoRecomendaciones}
                            className="bg-purple-600 hover:bg-purple-700 text-white"
                            size="sm"
                        >
                            {generandoRecomendaciones
                                ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generando...</>
                                : <><Sparkles className="mr-2 h-4 w-4 text-yellow-300" />Enriquecer con IA</>
                            }
                        </Button>
                    </div>
                )}
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
                <div className="border border-slate-200 rounded-lg overflow-hidden shadow-sm">
                    {/* Cabeceras */}
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
                        {/* Columna 1: ELABORÓ */}
                        <div className="border-b md:border-b-0 md:border-r border-slate-200 p-6 flex flex-col justify-between min-h-[300px]">
                            <div className="flex-1 flex flex-col gap-6">
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
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-slate-500 uppercase">Nombre y Apellido</Label>
                                    <Input
                                        value={formData.nombre_elaboro || ''}
                                        onChange={(e) => updateField('nombre_elaboro', e.target.value)}
                                        disabled={readOnly}
                                        className="h-9 bg-slate-50/50"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-slate-500 uppercase">Licencia S.O No.</Label>
                                    <Input
                                        value={formData.licencia_so_elaboro || ''}
                                        onChange={(e) => updateField('licencia_so_elaboro', e.target.value)}
                                        disabled={readOnly}
                                        className="h-9 bg-slate-50/50"
                                    />
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-slate-100 text-center">
                                <p className="text-[10px] font-bold text-slate-700 uppercase tracking-wide">Profesionales que realizan la valoración</p>
                            </div>
                        </div>

                        {/* Columna 2: REVISIÓN POR PROVEEDOR */}
                        <div className="border-b md:border-b-0 md:border-r border-slate-200 p-6 flex flex-col justify-between min-h-[300px]">
                            <div className="flex-1 flex flex-col gap-6">
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

                        {/* Columna 3: EQUIPO DE REHABILITACIÓN INTEGRAL */}
                        <div className="p-6 flex flex-col justify-between min-h-[300px] bg-slate-50/30">
                            <div className="flex-1 flex flex-col justify-center items-center gap-4">
                                <Label className="text-xs font-bold text-slate-400 uppercase mb-2">Nombre Proveedor</Label>
                                <Input
                                    value={formData.nombre_proveedor || ''}
                                    onChange={(e) => updateField('nombre_proveedor', e.target.value)}
                                    disabled={readOnly}
                                    className="h-10 text-center font-bold text-brand-600 border-dashed border-brand-200 bg-brand-50/50 hover:bg-brand-50 placeholder:text-brand-300"
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
