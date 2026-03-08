'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { api } from '@/app/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/sileo-toast';
import { Loader2, User, Lock, Save, Shield, Settings } from 'lucide-react';
import { DashboardLayout } from '@/app/components/layout/DashboardLayout';

export default function ConfiguracionPage() {
    const { user } = useAuth();
    const [savingProfile, setSavingProfile] = useState(false);
    const [savingPassword, setSavingPassword] = useState(false);

    const [profileData, setProfileData] = useState({
        nombre: '',
        apellido: '',
        email: ''
    });

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
            <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8">
                {/* Header */}
                <div className="flex items-center gap-3 sm:gap-4 anim-fade-in-up">
                    <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/25 shrink-0">
                        <Settings className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Configuración</h1>
                        <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Administra tu información personal y seguridad de cuenta</p>
                    </div>
                </div>

                {/* Perfil Card */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden anim-fade-in-up delay-1">
                    <div className="px-4 py-4 sm:px-6 sm:py-5 border-b border-gray-100 flex items-center gap-3 sm:gap-4 bg-gray-50/60">
                        <div className="p-2 sm:p-2.5 bg-white rounded-xl shadow-sm border border-gray-100">
                            <User className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-sm sm:text-base font-semibold text-gray-900">Información Personal</h2>
                            <p className="text-xs text-gray-500 mt-0.5">Actualiza tus datos de identificación básicos.</p>
                        </div>
                    </div>
                    <div className="p-4 sm:p-6">
                        <form onSubmit={handleProfileUpdate} className="space-y-4 sm:space-y-5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                                <div className="space-y-2">
                                    <Label htmlFor="nombre" className="text-gray-700 font-medium">Nombre</Label>
                                    <Input
                                        id="nombre"
                                        value={profileData.nombre}
                                        onChange={(e) => setProfileData({ ...profileData, nombre: e.target.value })}
                                        className="h-11 bg-gray-50/50 border-gray-200 rounded-xl focus:border-blue-500 transition-colors"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="apellido" className="text-gray-700 font-medium">Apellido</Label>
                                    <Input
                                        id="apellido"
                                        value={profileData.apellido}
                                        onChange={(e) => setProfileData({ ...profileData, apellido: e.target.value })}
                                        className="h-11 bg-gray-50/50 border-gray-200 rounded-xl focus:border-blue-500 transition-colors"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-gray-700 font-medium">Correo Electrónico</Label>
                                <div className="relative">
                                    <Input
                                        id="email"
                                        value={profileData.email}
                                        disabled
                                        className="h-11 bg-gray-100 text-gray-500 border-dashed rounded-xl pr-10"
                                    />
                                    <Shield className="absolute right-3.5 top-3.5 h-4 w-4 text-gray-400" />
                                </div>
                                <p className="text-xs text-gray-400 flex items-center gap-1.5 px-1">
                                    <Shield className="h-3 w-3" /> Este campo no se puede modificar por seguridad.
                                </p>
                            </div>
                            <div className="flex justify-end pt-2">
                                <Button
                                    type="submit"
                                    disabled={savingProfile}
                                    className="h-11 px-6 sm:px-8 bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 rounded-xl w-full sm:w-auto"
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
                    </div>
                </div>

                {/* Seguridad Card */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden anim-fade-in-up delay-2">
                    <div className="px-4 py-4 sm:px-6 sm:py-5 border-b border-gray-100 flex items-center gap-3 sm:gap-4 bg-gray-50/60">
                        <div className="p-2 sm:p-2.5 bg-white rounded-xl shadow-sm border border-gray-100">
                            <Lock className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-sm sm:text-base font-semibold text-gray-900">Seguridad</h2>
                            <p className="text-xs text-gray-500 mt-0.5">Gestiona tu contraseña y acceso.</p>
                        </div>
                    </div>
                    <div className="p-4 sm:p-6">
                        <form onSubmit={handlePasswordUpdate} className="space-y-4 sm:space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="new-password" className="text-gray-700 font-medium">Nueva Contraseña</Label>
                                <Input
                                    id="new-password"
                                    type="password"
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                    placeholder="Mínimo 6 caracteres"
                                    className="h-11 bg-gray-50/50 border-gray-200 rounded-xl focus:border-blue-500 transition-colors"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirm-password" className="text-gray-700 font-medium">Confirmar Contraseña</Label>
                                <Input
                                    id="confirm-password"
                                    type="password"
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                    placeholder="Repetir contraseña"
                                    className="h-11 bg-gray-50/50 border-gray-200 rounded-xl focus:border-blue-500 transition-colors"
                                />
                            </div>
                            <div className="flex justify-end pt-2">
                                <Button
                                    type="submit"
                                    disabled={savingPassword || !passwordData.newPassword}
                                    className="h-11 px-6 sm:px-8 bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 rounded-xl w-full sm:w-auto"
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
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
