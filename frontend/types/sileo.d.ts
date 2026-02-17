declare module 'sileo' {
    export const Toaster: React.FC<{ position?: string }>;
    export const toast: {
        success: (message: string) => void;
        error: (message: string) => void;
        loading: (message: string) => void;
        dismiss: (id?: string) => void;
        (message: string): void;
    };
}
