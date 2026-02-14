import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription, // Although not used directly, good to have if needed, or remove
    DialogFooter
} from "@/components/ui/dialog";
import { CheckCircle2, Download } from "lucide-react";

interface BlurSuccessModalProps {
    isOpen: boolean;
    onClose: () => void; // Function to handle "Volver a Lista" or closing
    downloadUrl: string;
    title?: string;
    message?: string;
}

export function BlurSuccessModal({
    isOpen,
    onClose,
    downloadUrl,
    title = "¡Prueba Finalizada!",
    message = "El PDF ha sido generado exitosamente."
}: BlurSuccessModalProps) {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            {/* 
               Using the same styling classes as BlurValidationModal for consistency:
               bg-white border-0 shadow-2xl rounded-xl
            */}
            <DialogContent className="sm:max-w-md bg-white border-0 shadow-2xl rounded-xl">
                <DialogHeader className="flex flex-col items-center justify-center pb-2">
                    <div className="p-3 rounded-full bg-green-100 text-green-600 mb-4">
                        <CheckCircle2 className="h-10 w-10" />
                    </div>
                    <DialogTitle className="text-xl font-bold text-gray-900 text-center">{title}</DialogTitle>
                </DialogHeader>

                <div className="py-2 text-center">
                    <p className="text-gray-600 text-base">{message}</p>
                </div>

                <DialogFooter className="flex flex-col sm:flex-row gap-3 sm:justify-center mt-4 w-full">
                    <a
                        href={`${API_URL}${downloadUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
                    >
                        <Download className="h-4 w-4" />
                        Descargar PDF
                    </a>

                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
                    >
                        Volver a Lista
                    </button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
