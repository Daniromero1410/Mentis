import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import { AlertCircle, CheckCircle2 } from "lucide-react";

interface BlurValidationModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message?: string;
    errors?: string[];
    type?: 'error' | 'success';
    action?: {
        label: string;
        onClick: () => void;
    };
}

export function BlurValidationModal({ isOpen, onClose, title, message, errors, type = 'error', action }: BlurValidationModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-white border-0 shadow-2xl rounded-xl">
                <DialogHeader className="flex flex-row items-center justify-between border-b pb-4">
                    <DialogTitle className="text-xl font-bold text-gray-900">{title}</DialogTitle>
                    <DialogDescription className="sr-only">
                        {message || "Lista de errores de validación"}
                    </DialogDescription>
                    {/* Close button is handled by Dialog primitive usually, but we can add one if needed or rely on default */}
                </DialogHeader>

                <div className="py-4">
                    {type === 'error' && errors && errors.length > 0 ? (
                        <div className="bg-red-50 border border-red-100 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
                                <div className="text-red-800 text-sm">
                                    <p className="font-semibold mb-2">Por favor complete los siguientes campos:</p>
                                    <ul className="list-disc pl-4 space-y-1">
                                        {errors.map((err, idx) => (
                                            <li key={idx}>{err}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center text-center">
                            <div className={`p-3 rounded-full mb-4 ${type === 'error' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                {type === 'error' ? <AlertCircle className="h-8 w-8" /> : <CheckCircle2 className="h-8 w-8" />}
                            </div>
                            <p className="text-gray-600 text-base">{message}</p>
                        </div>
                    )}
                </div>

                <DialogFooter className="sm:justify-end gap-2">
                    {action && (
                        <button
                            onClick={action.onClick}
                            className="px-6 py-2 rounded-lg font-medium text-white shadow-sm transition-colors bg-green-600 hover:bg-green-700 focus:ring-2 focus:ring-green-600 focus:ring-offset-1"
                        >
                            {action.label}
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        className="px-6 py-2 rounded-lg font-medium text-white shadow-sm transition-colors bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-600 focus:ring-offset-1"
                    >
                        {action ? 'Cerrar' : 'Entendido'}
                    </button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
