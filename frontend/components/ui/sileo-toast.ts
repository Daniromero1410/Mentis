import { sileo } from 'sileo';

export const toast = {
    success: (message: string, options?: any) => sileo.success({ title: message, ...options }),
    error: (message: string, options?: any) => sileo.error({ title: message, ...options }),
    warning: (message: string, options?: any) => sileo.warning({ title: message, ...options }),
    info: (message: string, options?: any) => sileo.info({ title: message, ...options }),
    action: (message: string, options?: any) => sileo.action({ title: message, ...options }),
    dismiss: (id: string) => sileo.dismiss(id),
}
