import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
        updateData('historia_ocupacional', '', newArray); // The root wizard will handle whole array updates
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

    // ===== Eventos No Laborales =====
    const eventosNoLaborales = Array.isArray(data?.eventos_nolaborales) ? data.eventos_nolaborales : [];

    const handleAddEvento = () => {
        const newArray = [...eventosNoLaborales, { si_no: '', fecha: '', diagnostico: '', orden: eventosNoLaborales.length }];
        updateData('eventos_nolaborales', '', newArray);
    };

    const handleUpdateEvento = (index: number, field: string, value: any) => {
        const newArray = [...eventosNoLaborales];
        newArray[index] = { ...newArray[index], [field]: value };
        updateData('eventos_nolaborales', '', newArray);
    };

    const handleRemoveEvento = (index: number) => {
        const newArray = eventosNoLaborales.filter((_: any, i: number) => i !== index);
        const updatedArray = newArray.map((item: any, i: number) => ({ ...item, orden: i }));
        updateData('eventos_nolaborales', '', updatedArray);
    };

    // ===== Textos =====
    const handleSeccionesTextoChange = (field: string, value: string) => {
        updateData('secciones_texto', field, value);
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* HISTORIA OCUPACIONAL */}
            <FormSection title="4. Historia Ocupacional (Cronológico Inverso)">
                <div className="mb-6 overflow-hidden">
                    <div className="border-b border-slate-100 py-3 flex flex-row items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Registros Laborales</h3>
                        {!readOnly && (
                            <Button type="button" onClick={handleAddHistoria} variant="outline" size="sm" className="gap-2">
                                <Plus className="h-4 w-4" /> Agregar Fila
                            </Button>
                        )}
                    </div>
                    <div className="p-0">
                        <Table>
                            <TableHeader className="bg-gray-50 dark:bg-gray-900/50">
                                <TableRow>
                                    <TableHead className="min-w-[150px]">Empresa</TableHead>
                                    <TableHead className="min-w-[200px]">Cargo y Funciones / Área</TableHead>
                                    <TableHead className="min-w-[120px]">Tiempo Duración</TableHead>
                                    <TableHead className="min-w-[150px]">Motivo Retiro</TableHead>
                                    {!readOnly && <TableHead className="w-[60px]"></TableHead>}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {historiaOcupacional.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={readOnly ? 4 : 5} className="text-center text-gray-500 py-6">
                                            No hay registros de historia ocupacional. Agregue uno nuevo.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    historiaOcupacional.map((row: any, index: number) => (
                                        <TableRow key={index}>
                                            <TableCell className="p-2">
                                                <Input
                                                    value={row.empresa || ''}
                                                    onChange={(e) => handleUpdateHistoria(index, 'empresa', e.target.value)}
                                                    disabled={readOnly}
                                                    className="h-9"
                                                />
                                            </TableCell>
                                            <TableCell className="p-2">
                                                <Textarea
                                                    value={row.cargo_funciones || ''}
                                                    onChange={(e) => handleUpdateHistoria(index, 'cargo_funciones', e.target.value)}
                                                    disabled={readOnly}
                                                    className="min-h-[40px] h-9 py-1.5 resize-none"
                                                />
                                            </TableCell>
                                            <TableCell className="p-2">
                                                <Input
                                                    value={row.tiempo_duracion || ''}
                                                    onChange={(e) => handleUpdateHistoria(index, 'tiempo_duracion', e.target.value)}
                                                    disabled={readOnly}
                                                    className="h-9"
                                                />
                                            </TableCell>
                                            <TableCell className="p-2">
                                                <Input
                                                    value={row.motivo_retiro || ''}
                                                    onChange={(e) => handleUpdateHistoria(index, 'motivo_retiro', e.target.value)}
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
                                                        onClick={() => handleRemoveHistoria(index)}
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
                    </div>
                </div>
            </FormSection>

            {/* EVENTOS NO LABORALES */}
            <FormSection title="5. Reporte de Eventos No Laborales (ENL)">
                <div className="mb-6 overflow-hidden">
                    <div className="border-b border-slate-100 py-3 flex flex-row items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Registros de Eventos</h3>
                        {!readOnly && (
                            <Button type="button" onClick={handleAddEvento} variant="outline" size="sm" className="gap-2">
                                <Plus className="h-4 w-4" /> Agregar Evento
                            </Button>
                        )}
                    </div>
                    <div className="p-0">
                        <Table>
                            <TableHeader className="bg-gray-50 dark:bg-gray-900/50">
                                <TableRow>
                                    <TableHead className="w-[120px]">SI/NO</TableHead>
                                    <TableHead className="w-[180px]">Fecha</TableHead>
                                    <TableHead>Diagnóstico y/o Especialidad</TableHead>
                                    {!readOnly && <TableHead className="w-[60px]"></TableHead>}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {eventosNoLaborales.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={readOnly ? 3 : 4} className="text-center text-gray-500 py-6">
                                            No hay registros de eventos no laborales. Agregue uno nuevo si corresponde.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    eventosNoLaborales.map((row: any, index: number) => (
                                        <TableRow key={index}>
                                            <TableCell className="p-2">
                                                <Input
                                                    value={row.si_no || ''}
                                                    onChange={(e) => handleUpdateEvento(index, 'si_no', e.target.value)}
                                                    disabled={readOnly}
                                                    className="h-9 uppercase text-center"
                                                    maxLength={2}
                                                    placeholder="SI/NO"
                                                />
                                            </TableCell>
                                            <TableCell className="p-2">
                                                <Input
                                                    value={row.fecha || ''}
                                                    onChange={(e) => handleUpdateEvento(index, 'fecha', e.target.value)}
                                                    disabled={readOnly}
                                                    className="h-9"
                                                    placeholder="DD/MM/AAAA"
                                                />
                                            </TableCell>
                                            <TableCell className="p-2">
                                                <Input
                                                    value={row.diagnostico || ''}
                                                    onChange={(e) => handleUpdateEvento(index, 'diagnostico', e.target.value)}
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
                                                        onClick={() => handleRemoveEvento(index)}
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
                    </div>
                </div>
            </FormSection>

            {/* OTROS OFICIOS Y OFICIOS DE MAYOR INTERÉS */}
            <FormSection title="6. Otros Oficios y Oficios de Mayor Interés">
                <div className="mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField label="Otros Oficios Desempeñados">
                            <FormTextarea
                                value={data?.secciones_texto?.otros_oficios_desempenados || ''}
                                onChange={(e) => handleSeccionesTextoChange('otros_oficios_desempenados', e.target.value)}
                                placeholder="Detalle otros oficios desempeñados por el trabajador..."
                                disabled={readOnly}
                                className="min-h-[120px]"
                            />
                        </FormField>

                        <FormField label="Oficios de Mayor Interés">
                            <FormTextarea
                                value={data?.secciones_texto?.oficios_interes || ''}
                                onChange={(e) => handleSeccionesTextoChange('oficios_interes', e.target.value)}
                                placeholder="Detalle los oficios de mayor interés para el trabajador..."
                                disabled={readOnly}
                                className="min-h-[120px]"
                            />
                        </FormField>
                    </div>
                </div>
            </FormSection>
        </div>
    );
}
