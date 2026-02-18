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
    actions?: {
        label: string;
        onClick: () => void;
        variant?: 'primary' | 'secondary' | 'outline';
    }[];
    action?: { // Deprecated but kept for compatibility
        label: string;
        onClick: () => void;
    };
}

export function BlurValidationModal({ isOpen, onClose, title, message, errors, type = 'error', action, actions }: BlurValidationModalProps) {
    const allActions = actions || (action ? [action] : []);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-white border-0 shadow-2xl rounded-xl z-50">
                <DialogHeader className="flex flex-row items-center justify-between border-b pb-4">
                    <DialogTitle className="text-xl font-bold text-gray-900">{title}</DialogTitle>
                    <DialogDescription className="sr-only">
                        {message || "Lista de errores de validación"}
                    </DialogDescription>
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
                            {message && <p className="text-gray-600 text-base">{message}</p>}
                        </div>
                    )}
                </div>

                <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-end">
                    {allActions.map((act, idx) => (
                        <button
                            key={idx}
                            onClick={act.onClick}
                            className={`px-6 py-2 rounded-lg font-medium shadow-sm transition-colors focus:ring-2 focus:ring-offset-1 ${act.variant === 'secondary'
                                    ? 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500'
                                    : 'text-white ' + (type === 'success' ? 'bg-green-600 hover:bg-green-700 focus:ring-green-600' : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-600')
                                }`}
                        >
                            {act.label}
                        </button>
                    ))}

                    <button
                        onClick={onClose}
                        className="px-6 py-2 rounded-lg font-medium text-gray-700 border border-gray-300 bg-white hover:bg-gray-50 focus:ring-2 focus:ring-gray-300 focus:ring-offset-1"
                    >
                        {allActions.length > 0 ? 'Cerrar' : 'Entendido'}
                    </button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
