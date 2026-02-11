import React from 'react';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';

// Colores del PDF (Beige/Peach para headers)
const HEADER_BG = "bg-[#FCE4D6]";
const BORDER_COLOR = "border-gray-800"; // Bordes oscuros para look de formato

interface FormSectionProps {
    title: string;
    children: React.ReactNode;
    className?: string;
}

export const FormSection = ({ title, children, className }: FormSectionProps) => {
    return (
        <div className={cn("border-2 border-gray-800 mb-6", className)}>
            <div className={cn("w-full px-2 py-1 font-bold text-sm uppercase border-b-2 border-gray-800", HEADER_BG)}>
                {title}
            </div>
            <div className="bg-white">
                {children}
            </div>
        </div>
    );
};

interface FormRowProps {
    children: React.ReactNode;
    className?: string;
    noBorderBottom?: boolean;
}

export const FormRow = ({ children, className, noBorderBottom = false }: FormRowProps) => {
    return (
        <div className={cn("flex w-full", !noBorderBottom && "border-b border-gray-800", className)}>
            {children}
        </div>
    );
};

interface FormFieldProps {
    label?: string;
    children?: React.ReactNode;
    className?: string;
    width?: string;
    noBorderRight?: boolean;
    col?: boolean; // Label arriba, input abajo
    center?: boolean;
    header?: boolean; // Si es true, actúa como un header de columna
}

export const FormField = ({ label, children, className, width, noBorderRight = false, col = false, center = false, header = false }: FormFieldProps) => {
    return (
        <div className={cn(
            "flex p-1 relative min-h-[1.5rem]", // Reduced min-height
            !noBorderRight && "border-r border-gray-800",
            col ? "flex-col justify-center" : "items-center gap-2", // Added justify-center for col
            center && "justify-center text-center",
            header && HEADER_BG + " font-bold justify-center items-center text-center",
            width,
            className
        )}>
            {label && (
                <span className={cn(
                    "text-[10px] font-bold uppercase leading-tight text-gray-700 select-none", // Added select-none
                    col ? "mb-0.5 text-center w-full" : "whitespace-nowrap mr-1", // Centered col label
                    header && "text-xs"
                )}>
                    {label}
                </span>
            )}
            {children}
        </div>
    );
};

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    transparent?: boolean;
}

export const FormInput = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, transparent = true, ...props }, ref) => {
        return (
            <input
                className={cn(
                    "flex h-full w-full px-1 py-0 text-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
                    // REMOVED border and ring for transparent inputs to make them blend in
                    transparent ? "bg-transparent border-none shadow-none focus:ring-0 focus:outline-none" : "rounded-md border border-input bg-background shadow-sm focus-visible:ring-1 focus-visible:ring-ring",
                    className
                )}
                ref={ref}
                {...props}
            />
        );
    }
);
FormInput.displayName = "FormInput";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    transparent?: boolean;
}

export const FormTextarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, transparent = true, ...props }, ref) => {
        return (
            <textarea
                className={cn(
                    "flex min-h-[40px] w-full px-1 py-1 text-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 resize-none",
                    transparent ? "bg-transparent border-none shadow-none focus:ring-0 focus:outline-none" : "rounded-md border border-input bg-background shadow-sm focus-visible:ring-1 focus-visible:ring-ring",
                    className
                )}
                ref={ref}
                {...props}
            />
        );
    }
);
FormTextarea.displayName = "FormTextarea";

export const DateInputs = ({
    dateString,
    onChange
}: {
    dateString: string,
    onChange: (date: string) => void
}) => {
    // Helper to split date YYYY-MM-DD into discrete boxes
    // Not implementing full separated inputs for now to keep it simple, but styled to look integrated
    return (
        <FormInput
            type="date"
            value={dateString}
            onChange={(e) => onChange(e.target.value)}
            className="font-mono text-center"
        />
    )
}
