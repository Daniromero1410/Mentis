declare module 'sileo' {
    import React from 'react';

    export interface ToasterProps {
        position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
        toastOptions?: {
            className?: string;
            style?: React.CSSProperties;
            duration?: number;
        };
    }

    export const Toaster: React.FC<ToasterProps>;

    export interface ToastOptions {
        description?: string | React.ReactNode;
        icon?: React.ReactNode;
        duration?: number;
        className?: string;
        style?: React.CSSProperties;
    }

    export const toast: {
        (message: string | React.ReactNode, options?: ToastOptions): string | number;
        success: (message: string | React.ReactNode, options?: ToastOptions) => string | number;
        error: (message: string | React.ReactNode, options?: ToastOptions) => string | number;
        loading: (message: string | React.ReactNode, options?: ToastOptions) => string | number;
        custom: (jsx: (t: any) => React.ReactElement, options?: ToastOptions) => string | number;
        dismiss: (toastId?: string | number) => void;
    };
}
