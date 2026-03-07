import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FormSection, FormField } from '../prueba-trabajo/FormComponents';
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

interface Seccion5Props {
    data: any;
    updateData: (section: string, field: string, value: any) => void;
    readOnly?: boolean;
}

export function Seccion5ComposicionFamiliar({ data, updateData, readOnly = false }: Seccion5Props) {
    const handleComposicionChange = (field: string, value: any) => {
        updateData('composicion_familiar', field, value);
    };

    const handleMiembroChange = (index: number, field: string, value: any) => {
        const arr = Array.isArray(data.miembros_familiares) ? [...data.miembros_familiares] : [];
        if (arr[index]) {
            arr[index] = { ...arr[index], [field]: value };
            updateData('miembros_familiares', '', arr);
        }
    };

    const handleAddMiembro = () => {
        const arr = Array.isArray(data.miembros_familiares) ? [...data.miembros_familiares] : [];
        const nuevoMiembro = {
            composicion_nucleo: '',
            fecha_nacimiento: '',
        };
        updateData('miembros_familiares', '', [...arr, nuevoMiembro]);
    };

    const handleRemoveMiembro = (index: number) => {
        const arr = Array.isArray(data.miembros_familiares) ? [...data.miembros_familiares] : [];
        arr.splice(index, 1);
        updateData('miembros_familiares', '', arr);
    };

    const miembros = Array.isArray(data.miembros_familiares) ? data.miembros_familiares : [];

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <FormSection title="7. Composición Familiar">
                <div className="space-y-6">
                    <Card className="border-slate-200 shadow-sm overflow-hidden">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-3 flex flex-row items-center justify-between space-y-0">
                            <CardTitle className="text-sm font-bold text-slate-700">Composición del núcleo familiar</CardTitle>
                            {!readOnly && (
                                <Button type="button" onClick={handleAddMiembro} variant="outline" size="sm" className="gap-2">
                                    <Plus className="h-4 w-4" /> Agregar Familiar
                                </Button>
                            )}
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader className="bg-gray-50/80">
                                    <TableRow>
                                        <TableHead className="min-w-[150px] font-semibold text-slate-700">Composición del núcleo familiar</TableHead>
                                        <TableHead className="min-w-[150px] font-semibold text-slate-700">Fecha de nacimiento de cada integrante que compone el nucleo familiar</TableHead>
                                        {!readOnly && <TableHead className="w-[60px]"></TableHead>}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {miembros.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={readOnly ? 2 : 3} className="text-center text-gray-500 py-6 text-sm">
                                                No hay registros de familiares. Agregue uno nuevo.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        miembros.map((miembro: any, index: number) => (
                                            <TableRow key={index} className="hover:bg-slate-50/50">
                                                <TableCell className="p-2 align-top">
                                                    <Input
                                                        value={miembro.composicion_nucleo || ''}
                                                        onChange={(e) => handleMiembroChange(index, 'composicion_nucleo', e.target.value)}
                                                        disabled={readOnly}
                                                        className="h-9 w-full"
                                                        placeholder="Nombre y Parentesco..."
                                                    />
                                                </TableCell>
                                                <TableCell className="p-2 align-top">
                                                    <Input
                                                        value={miembro.fecha_nacimiento || ''}
                                                        onChange={(e) => handleMiembroChange(index, 'fecha_nacimiento', e.target.value)}
                                                        disabled={readOnly}
                                                        className="h-9 w-full"
                                                        placeholder="dd/mm/año"
                                                    />
                                                </TableCell>
                                                {!readOnly && (
                                                    <TableCell className="p-2 align-top">
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleRemoveMiembro(index)}
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
                            <FormField label="Persona(s) que sostiene económicamente el hogar:" className="md:col-span-2">
                                <Input
                                    value={data.composicion_familiar?.personas_sostienen_hogar || ''}
                                    onChange={(e) => handleComposicionChange('personas_sostienen_hogar', e.target.value)}
                                    disabled={readOnly}
                                />
                            </FormField>

                            <FormField label="Ingreso Promedio en el hogar:">
                                <Input
                                    value={data.composicion_familiar?.ingreso_promedio || ''}
                                    onChange={(e) => handleComposicionChange('ingreso_promedio', e.target.value)}
                                    disabled={readOnly}
                                />
                            </FormField>

                            <FormField label="Convivencia actual:">
                                <Input
                                    value={data.composicion_familiar?.convivencia_actual || ''}
                                    onChange={(e) => handleComposicionChange('convivencia_actual', e.target.value)}
                                    disabled={readOnly}
                                />
                            </FormField>
                        </CardContent>
                    </Card>
                </div>
            </FormSection>
        </div>
    );
}
