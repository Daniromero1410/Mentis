import React from 'react';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// ==========================================
// Modern UI Components (Shadcn/Tailwind)
// ==========================================

interface FormSectionProps {
    title: string;
    children: React.ReactNode;
    className?: string;
}

export const FormSection = ({ title, children, className }: FormSectionProps) => {
    return (
        <Card className={cn("mb-6 shadow-sm border-slate-200", className)}>
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-3 pt-3">
                <CardTitle className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4 pt-4">
                {children}
            </CardContent>
        </Card>
    );
};

interface FormRowProps {
    children: React.ReactNode;
    className?: string;
    noBorderBottom?: boolean; // Kept for type compatibility but ignored in usage
}

export const FormRow = ({ children, className, noBorderBottom = false }: FormRowProps) => {
    return (
        <div className={cn("flex flex-col md:flex-row gap-4 w-full", className)}>
            {children}
        </div>
    );
};

interface FormFieldProps {
    label?: string;
    children?: React.ReactNode;
    className?: string;
    width?: string;
    noBorderRight?: boolean; // Kept for compatibility, ignored
    col?: boolean; // Kept for compatibility
    center?: boolean; // Kept for compatibility
    header?: boolean; // Kept for compatibility
}

export const FormField = ({ label, children, className, width, noBorderRight, col, center, header }: FormFieldProps) => {
    // If it's a "header" field (old table headers), render as a simple div or label
    if (header) {
        return (
            <div className={cn("font-semibold text-sm text-slate-700 uppercase", className)}>
                {label}
            </div>
        );
    }

    return (
        <div className={cn("flex flex-col space-y-1.5 w-full", width, className)}>
            {label && (
                <Label className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                    {label}
                </Label>
            )}
            <div className={cn("flex-1", center && "flex justify-center")}>
                {children}
            </div>
        </div>
    );
};

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    transparent?: boolean; // Deprecated, kept for compatibility
}

export const FormInput = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, transparent, ...props }, ref) => {
        return (
            <Input
                ref={ref}
                className={cn("bg-white", className)}
                {...props}
            />
        );
    }
);
FormInput.displayName = "FormInput";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    transparent?: boolean; // Deprecated
}

export const FormTextarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, transparent, ...props }, ref) => {
        return (
            <Textarea
                ref={ref}
                className={cn("bg-white min-h-[80px]", className)}
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
    return (
        <div className="w-full">
            <Input
                type="date"
                value={dateString}
                onChange={(e) => onChange(e.target.value)}
                className="w-full"
            />
        </div>
    )
}
