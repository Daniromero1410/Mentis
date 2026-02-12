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
    message: string;
    type?: 'error' | 'success';
}

export function BlurValidationModal({ isOpen, onClose, title, message, type = 'error' }: BlurValidationModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-white/90 backdrop-blur-md border border-white/20 shadow-2xl">
                <DialogHeader className="flex flex-col items-center text-center">
                    <div className={`p-3 rounded-full mb-4 ${type === 'error' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                        {type === 'error' ? <AlertCircle className="h-8 w-8" /> : <CheckCircle2 className="h-8 w-8" />}
                    </div>
                    <DialogTitle className="text-xl font-bold text-gray-900">{title}</DialogTitle>
                    <DialogDescription className="text-gray-600 mt-2 text-base">
                        {message}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="sm:justify-center mt-4">
                    <button
                        onClick={onClose}
                        className={`px-6 py-2 rounded-lg font-medium text-white shadow-md transition-colors ${type === 'error'
                                ? 'bg-red-600 hover:bg-red-700'
                                : 'bg-green-600 hover:bg-green-700'
                            }`}
                    >
                        Entendido
                    </button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
