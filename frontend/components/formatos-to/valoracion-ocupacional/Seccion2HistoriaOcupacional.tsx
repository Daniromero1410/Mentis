import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FormSection, FormField, FormTextarea } from '../prueba-trabajo/FormComponents';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Plus, Trash2 } from 'lucide-react';

interface Seccion2Props {
    data: any;
    updateData: (section: string, field: string, value: any) => void;
    readOnly?: boolean;
}

export function Seccion2HistoriaOcupacional({ data, updateData, readOnly = false }: Seccion2Props) {

    // ===== Historia Ocupacional =====
    const historiaOcupacional = Array.isArray(data?.historia_ocupacional) ? data.historia_ocupacional : [];

    const handleAddHistoria = () => {
        const newArray = [...historiaOcupacional, { empresa: '', cargo_funciones: '', tiempo_duracion: '', motivo_retiro: '', orden: historiaOcupacional.length }];
        updateData('historia_ocupacional', '', newArray);
    };

    const handleUpdateHistoria = (index: number, field: string, value: any) => {
        const newArray = [...historiaOcupacional];
        newArray[index] = { ...newArray[index], [field]: value };
        updateData('historia_ocupacional', '', newArray);
    };

    const handleRemoveHistoria = (index: number) => {
        const newArray = historiaOcupacional.filter((_: any, i: number) => i !== index);
        // Re-assign orden
        const updatedArray = newArray.map((item: any, i: number) => ({ ...item, orden: i }));
        updateData('historia_ocupacional', '', updatedArray);
    };

    // ===== Textos =====
    const handleSeccionesTextoChange = (field: string, value: string) => {
        updateData('secciones_texto', field, value);
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* 3 HISTORIA OCUPACIONAL */}
            <FormSection title="3. Historia Ocupacional">
                <div className="space-y-6">
                    <Card className="border-slate-200 shadow-sm overflow-hidden">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-3 flex flex-row items-center justify-between space-y-0">
                            <div>
                                <CardTitle className="text-sm font-bold text-slate-700">Trabajos Desempeñados</CardTitle>
                                <p className="text-xs text-slate-500 mt-0.5">(comenzando por el primero de su historia laboral)</p>
                            </div>
                            {!readOnly && (
                                <Button type="button" onClick={handleAddHistoria} variant="outline" size="sm" className="gap-2">
                                    <Plus className="h-4 w-4" /> Agregar Fila
                                </Button>
                            )}
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader className="bg-gray-50/80">
                                    <TableRow>
                                        <TableHead className="min-w-[150px] font-semibold text-slate-700">Empresa</TableHead>
                                        <TableHead className="min-w-[200px] font-semibold text-slate-700">Cargo - funciones / tareas</TableHead>
                                        <TableHead className="min-w-[120px] font-semibold text-slate-700">Tiempo/duración</TableHead>
                                        <TableHead className="min-w-[150px] font-semibold text-slate-700">Motivo de retiro</TableHead>
                                        {!readOnly && <TableHead className="w-[60px]"></TableHead>}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {historiaOcupacional.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={readOnly ? 4 : 5} className="text-center text-gray-500 py-6 text-sm">
                                                No hay registros de historia ocupacional. Agregue uno nuevo.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        historiaOcupacional.map((row: any, index: number) => (
                                            <TableRow key={index} className="hover:bg-slate-50/50">
                                                <TableCell className="p-2 align-top">
                                                    <Input
                                                        value={row.empresa || ''}
                                                        onChange={(e) => handleUpdateHistoria(index, 'empresa', e.target.value)}
                                                        disabled={readOnly}
                                                        className="h-9 w-full min-w-[120px]"
                                                    />
                                                </TableCell>
                                                <TableCell className="p-2 align-top">
                                                    <FormTextarea
                                                        value={row.cargo_funciones || ''}
                                                        onChange={(e) => handleUpdateHistoria(index, 'cargo_funciones', e.target.value)}
                                                        disabled={readOnly}
                                                        className="min-h-[60px] resize-none w-full"
                                                    />
                                                </TableCell>
                                                <TableCell className="p-2 align-top">
                                                    <Input
                                                        value={row.tiempo_duracion || ''}
                                                        onChange={(e) => handleUpdateHistoria(index, 'tiempo_duracion', e.target.value)}
                                                        disabled={readOnly}
                                                        className="h-9 w-full min-w-[100px]"
                                                    />
                                                </TableCell>
                                                <TableCell className="p-2 align-top">
                                                    <Input
                                                        value={row.motivo_retiro || ''}
                                                        onChange={(e) => handleUpdateHistoria(index, 'motivo_retiro', e.target.value)}
                                                        disabled={readOnly}
                                                        className="h-9 w-full min-w-[120px]"
                                                    />
                                                </TableCell>
                                                {!readOnly && (
                                                    <TableCell className="p-2 align-top">
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleRemoveHistoria(index)}
                                                            className="h-9 w-9 text-red-500 hover:text-red-700 hover:bg-red-50"
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
                        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField label="Otros Oficios desempeñados">
                                <FormTextarea
                                    value={data?.secciones_texto?.otros_oficios_desempenados || ''}
                                    onChange={(e) => handleSeccionesTextoChange('otros_oficios_desempenados', e.target.value)}
                                    placeholder="Detalle otros oficios desempeñados por el trabajador..."
                                    disabled={readOnly}
                                    className="min-h-[100px]"
                                />
                            </FormField>

                            <FormField label="Oficios de interés">
                                <FormTextarea
                                    value={data?.secciones_texto?.oficios_interes || ''}
                                    onChange={(e) => handleSeccionesTextoChange('oficios_interes', e.target.value)}
                                    placeholder="Detalle los oficios de mayor interés para el trabajador..."
                                    disabled={readOnly}
                                    className="min-h-[100px]"
                                />
                            </FormField>
                        </CardContent>
                    </Card>
                </div>
            </FormSection>
        </div>
    );
}
