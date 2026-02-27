import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Plus, Trash2, Upload } from 'lucide-react';

interface Seccion5Props {
    data: any;
    updateData: (section: string, field: string, value: any) => void;
    readOnly?: boolean;
}

export function Seccion5ComposicionRegistro({ data, updateData, readOnly = false }: Seccion5Props) {

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
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                    <div className="h-6 w-1 bg-indigo-500 rounded-full"></div>
                    9. Composición Familiar
                </h3>

                {/* Tabla de Miembros */}
                <div className="mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <Label className="text-base">Miembros del Núcleo Familiar (Edades)</Label>
                        {!readOnly && (
                            <Button type="button" onClick={handleAddMiembro} variant="outline" size="sm" className="gap-2">
                                <Plus className="h-4 w-4" /> Agregar Familiar
                            </Button>
                        )}
                    </div>

                    <div className="border rounded-md overflow-hidden">
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
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <Label>No. de Personas que Sostienen el Hogar</Label>
                        <Input
                            value={data?.composicion_familiar?.personas_sostienen_hogar || ''}
                            onChange={(e) => handleComposicionChange('personas_sostienen_hogar', e.target.value)}
                            disabled={readOnly}
                            type="number"
                            min="0"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Ingreso Promedio del Hogar</Label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                            <Input
                                value={data?.composicion_familiar?.ingreso_promedio || ''}
                                onChange={(e) => handleComposicionChange('ingreso_promedio', e.target.value)}
                                disabled={readOnly}
                                className="pl-7"
                                placeholder="0.00"
                            />
                        </div>
                    </div>
                    <div className="space-y-2 lg:col-span-3">
                        <Label>Convivencia Actual</Label>
                        <Textarea
                            value={data?.composicion_familiar?.convivencia_actual || ''}
                            onChange={(e) => handleComposicionChange('convivencia_actual', e.target.value)}
                            disabled={readOnly}
                            placeholder="Describa con quién convive actualmente..."
                            className="min-h-[60px]"
                        />
                    </div>
                </div>
            </div>

            {/* REGISTRO Y FIRMAS */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                    <div className="h-6 w-1 bg-indigo-500 rounded-full"></div>
                    10. Registro y Firmas
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Elaborado por */}
                    <div className="space-y-4 p-5 rounded-lg border bg-gray-50 dark:bg-gray-900/50">
                        <h4 className="font-medium text-gray-900 dark:text-gray-100 border-b pb-2">Elaboro</h4>

                        <div className="space-y-2">
                            <Label>Nombre completo del Profesional</Label>
                            <Input
                                value={data?.registro?.nombre_elaboro || ''}
                                onChange={(e) => handleRegistroChange('nombre_elaboro', e.target.value)}
                                disabled={readOnly}
                                placeholder="Nombre de quien elabora..."
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Licencia de S.O No.</Label>
                            <Input
                                value={data?.registro?.licencia_so_elaboro || ''}
                                onChange={(e) => handleRegistroChange('licencia_so_elaboro', e.target.value)}
                                disabled={readOnly}
                            />
                        </div>

                        <div className="space-y-2 pt-2">
                            <Label>Firma del Profesional</Label>
                            {data?.registro?.firma_elaboro ? (
                                <div className="mt-2 border rounded p-2 bg-white flex justify-center flex-col items-center">
                                    <img
                                        src={data.registro.firma_elaboro}
                                        alt="Firma Elaboro"
                                        className="max-h-24 object-contain"
                                    />
                                    {!readOnly && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleRegistroChange('firma_elaboro', '')}
                                            className="text-red-500 mt-2 h-7"
                                        >
                                            Eliminar firma
                                        </Button>
                                    )}
                                </div>
                            ) : (
                                !readOnly && (
                                    <Label className="flex w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white py-6 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:hover:border-gray-500 dark:hover:bg-gray-700">
                                        <div className="flex flex-col items-center justify-center pb-6 pt-5">
                                            <Upload className="mb-4 h-8 w-8 text-gray-500 dark:text-gray-400" />
                                            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                                                <span className="font-semibold">Haga clic para subir</span> o arrastre y suelte
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG (MAX. 2MB)</p>
                                        </div>
                                        <Input type="file" className="hidden" accept="image/*" onChange={(e) => handleFirmaUpload(e, 'firma_elaboro')} />
                                    </Label>
                                )
                            )}
                        </div>
                    </div>

                    {/* Trabajador */}
                    <div className="space-y-4 p-5 rounded-lg border bg-gray-50 dark:bg-gray-900/50">
                        <h4 className="font-medium text-gray-900 dark:text-gray-100 border-b pb-2">Trabajador</h4>

                        <div className="space-y-2">
                            <Label>Nombre completo</Label>
                            <Input
                                value={data?.registro?.nombre_trabajador || ''}
                                onChange={(e) => handleRegistroChange('nombre_trabajador', e.target.value)}
                                disabled={readOnly}
                                placeholder="Nombre del trabajador..."
                            />
                        </div>

                        <div className="space-y-2 pt-[76px]">
                            <Label>Firma del Trabajador</Label>
                            {data?.registro?.firma_trabajador ? (
                                <div className="mt-2 border rounded p-2 bg-white flex justify-center flex-col items-center">
                                    <img
                                        src={data.registro.firma_trabajador}
                                        alt="Firma Trabajador"
                                        className="max-h-24 object-contain"
                                    />
                                    {!readOnly && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleRegistroChange('firma_trabajador', '')}
                                            className="text-red-500 mt-2 h-7"
                                        >
                                            Eliminar firma
                                        </Button>
                                    )}
                                </div>
                            ) : (
                                !readOnly && (
                                    <Label className="flex w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white py-6 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:hover:border-gray-500 dark:hover:bg-gray-700">
                                        <div className="flex flex-col items-center justify-center pb-6 pt-5">
                                            <Upload className="mb-4 h-8 w-8 text-gray-500 dark:text-gray-400" />
                                            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                                                <span className="font-semibold">Haga clic para subir</span> o arrastre y suelte
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG (MAX. 2MB)</p>
                                        </div>
                                        <Input type="file" className="hidden" accept="image/*" onChange={(e) => handleFirmaUpload(e, 'firma_trabajador')} />
                                    </Label>
                                )
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
