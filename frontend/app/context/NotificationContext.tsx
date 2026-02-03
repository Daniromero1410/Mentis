'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Notification {
    id: string;
    title: string;
    message: string;
    time: string;
    read: boolean;
    type?: 'success' | 'info' | 'warning' | 'error';
}

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    addNotification: (title: string, message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    // Cargar notificaciones del localStorage al iniciar - opcional si queremos persistencia entre recargas
    useEffect(() => {
        const saved = localStorage.getItem('notifications');
        if (saved) {
            try {
                setNotifications(JSON.parse(saved));
            } catch (e) {
                console.error('Error parsing notifications', e);
            }
        }
    }, []);

    // Guardar en localStorage cuando cambien
    useEffect(() => {
        localStorage.setItem('notifications', JSON.stringify(notifications));
    }, [notifications]);

    const addNotification = (title: string, message: string, type: 'success' | 'info' | 'warning' | 'error' = 'info') => {
        const newNotification: Notification = {
            id: Date.now().toString(),
            title,
            message,
            time: new Date().toISOString(),
            read: false,
            type
        };
        setNotifications(prev => [newNotification, ...prev]);
    };

    const markAsRead = (id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const clearNotifications = () => {
        setNotifications([]);
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <NotificationContext.Provider value={{
            notifications,
            unreadCount,
            addNotification,
            markAsRead,
            markAllAsRead,
            clearNotifications
        }}>
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotification() {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
}
