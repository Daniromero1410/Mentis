'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, Trash2, Info, Loader2 } from 'lucide-react';

type Variant = 'danger' | 'warning' | 'info';

interface ConfirmModalProps {
    open: boolean;
    title: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
    variant?: Variant;
    loading?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

const variantStyles: Record<Variant, { icon: React.ElementType; iconBg: string; iconColor: string; confirmBg: string }> = {
    danger: { icon: Trash2, iconBg: 'bg-red-100', iconColor: 'text-red-600', confirmBg: 'bg-red-500 hover:bg-red-600' },
    warning: { icon: AlertTriangle, iconBg: 'bg-amber-100', iconColor: 'text-amber-600', confirmBg: 'bg-green-600 hover:bg-green-700' },
    info: { icon: Info, iconBg: 'bg-brand-100', iconColor: 'text-brand-600', confirmBg: 'bg-brand-500 hover:bg-brand-600' },
};

export function ConfirmModal({
    open, title, message, confirmText = 'Confirmar', cancelText = 'Cancelar',
    variant = 'info', loading = false, onConfirm, onCancel,
}: ConfirmModalProps) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => { setMounted(true); }, []);

    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel(); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [open, onCancel]);

    if (!open || !mounted) return null;

    const v = variantStyles[variant];
    const Icon = v.icon;

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm anim-backdrop-in" onClick={loading ? undefined : onCancel} />
            <div className="relative w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl anim-modal-in">
                <div className="p-6">
                    <div className="flex flex-col items-center text-center">
                        <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-full ${v.iconBg}`}>
                            <Icon className={`h-7 w-7 ${v.iconColor}`} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                        {message && <p className="mt-2 text-sm text-gray-500">{message}</p>}
                    </div>
                    <div className="mt-6 flex gap-3">
                        <button
                            onClick={onCancel}
                            disabled={loading}
                            className="flex-1 h-11 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={loading}
                            className={`flex-1 h-11 rounded-xl text-sm font-medium text-white transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2 ${v.confirmBg}`}
                        >
                            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}
