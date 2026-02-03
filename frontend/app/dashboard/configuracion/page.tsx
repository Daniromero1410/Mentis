'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { api } from '@/app/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Loader2, User, Lock, Save, Shield, Settings } from 'lucide-react';
import { DashboardLayout } from '@/app/components/layout/DashboardLayout';

export default function ConfiguracionPage() {
    const { user } = useAuth();
    const [savingProfile, setSavingProfile] = useState(false);
    const [savingPassword, setSavingPassword] = useState(false);

    // Estados del perfil
    const [profileData, setProfileData] = useState({
        nombre: '',
        apellido: '',
        email: ''
    });

    // Estados de contraseña
    const [passwordData, setPasswordData] = useState({
        newPassword: '',
        confirmPassword: ''
    });

    useEffect(() => {
        if (user) {
            setProfileData({
                nombre: user.nombre || '',
                apellido: user.apellido || '',
                email: user.email || ''
            });
        }
    }, [user]);

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSavingProfile(true);
        try {
            await api.put('/usuarios/me', {
                nombre: profileData.nombre,
                apellido: profileData.apellido
            });
            toast.success('Perfil actualizado correctamente');
        } catch (error: any) {
            toast.error('Error al actualizar el perfil');
            console.error(error);
        } finally {
            setSavingProfile(false);
        }
    };

    const handlePasswordUpdate = async (e: React.FormEvent) => {
        e.preventDefault();

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error('Las contraseñas no coinciden');
            return;
        }

        if (passwordData.newPassword.length < 6) {
            toast.error('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        setSavingPassword(true);
        try {
            await api.put('/usuarios/me', {
                password: passwordData.newPassword
            });
            toast.success('Contraseña actualizada correctamente');
            setPasswordData({ newPassword: '', confirmPassword: '' });
        } catch (error: any) {
            toast.error('Error al actualizar la contraseña');
            console.error(error);
        } finally {
            setSavingPassword(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-8 max-w-4xl mx-auto py-6">
                {/* Header Centrado */}
                <div className="text-center space-y-2 mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center justify-center gap-3">
                        <Settings className="h-8 w-8 text-indigo-500" />
                        Configuración
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 max-w-lg mx-auto">
                        Administra tu información personal y fortalece la seguridad de tu cuenta desde este panel centralizado.
                    </p>
                </div>

                <div className="space-y-8">
                    {/* Perfil Card */}
                    <Card className="border shadow-md bg-white dark:bg-gray-900 overflow-hidden">
                        <CardHeader className="bg-gray-50/80 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 pb-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                                    <User className="h-6 w-6 text-indigo-500" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl">Información Personal</CardTitle>
                                    <CardDescription className="mt-1">
                                        Actualiza tus datos de identificación básicos.
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-8">
                            <form onSubmit={handleProfileUpdate} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2.5">
                                        <Label htmlFor="nombre" className="text-gray-700 dark:text-gray-300">Nombre</Label>
                                        <Input
                                            id="nombre"
                                            value={profileData.nombre}
                                            onChange={(e) => setProfileData({ ...profileData, nombre: e.target.value })}
                                            className="h-11 bg-gray-50/50 dark:bg-gray-900 border-gray-200 focus:border-indigo-500 transition-colors"
                                        />
                                    </div>
                                    <div className="space-y-2.5">
                                        <Label htmlFor="apellido" className="text-gray-700 dark:text-gray-300">Apellido</Label>
                                        <Input
                                            id="apellido"
                                            value={profileData.apellido}
                                            onChange={(e) => setProfileData({ ...profileData, apellido: e.target.value })}
                                            className="h-11 bg-gray-50/50 dark:bg-gray-900 border-gray-200 focus:border-indigo-500 transition-colors"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2.5">
                                    <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">Correo Electrónico</Label>
                                    <div className="relative">
                                        <Input
                                            id="email"
                                            value={profileData.email}
                                            disabled
                                            className="h-11 bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 border-dashed"
                                        />
                                        <Shield className="absolute right-4 top-3.5 h-4 w-4 text-gray-400" />
                                    </div>
                                    <p className="text-xs text-muted-foreground flex items-center gap-1.5 px-1">
                                        <Shield className="h-3 w-3" /> Este campo no se puede modificar por seguridad.
                                    </p>
                                </div>
                                <div className="pt-4 flex justify-end">
                                    <Button
                                        type="submit"
                                        disabled={savingProfile}
                                        className="h-11 px-8 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20"
                                    >
                                        {savingProfile ? (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        ) : (
                                            <Save className="mr-2 h-4 w-4" />
                                        )}
                                        Guardar Cambios
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Seguridad Card */}
                    <Card className="border shadow-md bg-white dark:bg-gray-900 overflow-hidden">
                        <CardHeader className="bg-gray-50/80 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 pb-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                                    <Lock className="h-6 w-6 text-orange-500" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl">Seguridad</CardTitle>
                                    <CardDescription className="mt-1">
                                        Gestiona tu contraseña y acceso.
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-8">
                            <form onSubmit={handlePasswordUpdate} className="space-y-6">
                                <div className="space-y-2.5">
                                    <Label htmlFor="new-password">Nueva Contraseña</Label>
                                    <Input
                                        id="new-password"
                                        type="password"
                                        value={passwordData.newPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                        placeholder="Mínimo 6 caracteres"
                                        className="h-11 bg-gray-50/50 dark:bg-gray-900 border-gray-200 focus:border-orange-500 transition-colors"
                                    />
                                </div>
                                <div className="space-y-2.5">
                                    <Label htmlFor="confirm-password">Confirmar Contraseña</Label>
                                    <Input
                                        id="confirm-password"
                                        type="password"
                                        value={passwordData.confirmPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                        placeholder="Repetir contraseña"
                                        className="h-11 bg-gray-50/50 dark:bg-gray-900 border-gray-200 focus:border-orange-500 transition-colors"
                                    />
                                </div>
                                <div className="pt-4 flex justify-end">
                                    <Button
                                        type="submit"
                                        disabled={savingPassword || !passwordData.newPassword}
                                        className="h-11 px-8 bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/20"
                                    >
                                        {savingPassword ? (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        ) : (
                                            <Lock className="mr-2 h-4 w-4" />
                                        )}
                                        Actualizar Contraseña
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}
