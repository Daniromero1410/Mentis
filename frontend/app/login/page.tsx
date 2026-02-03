'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { api } from '@/app/services/api';
import Image from 'next/image';
import { toast } from 'sonner';
import { Eye, EyeOff, Loader2, Mail, Lock, CheckCircle2, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Password Reset State
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  const { login } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await login(email, password);
      toast.success('¡Bienvenido al sistema!');
    } catch (error: any) {
      toast.error(error.message || 'Credenciales incorrectas');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) {
      toast.error('Por favor ingresa tu correo electrónico');
      return;
    }

    setIsResetting(true);

    try {
      await api.post('/auth/password-reset-request', { email: resetEmail });

      toast.success('Solicitud enviada correctamente', {
        description: 'Se ha notificado al administrador para gestionar el restablecimiento de tu contraseña.',
        icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
        duration: 5000,
      });

      setResetModalOpen(false);
      setResetEmail('');
    } catch (error: any) {
      toast.error(error.message || 'Error al procesar la solicitud');
    } finally {
      setIsResetting(false);
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-slate-100 to-indigo-50 relative overflow-hidden transition-colors duration-500">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Animated Gradient Orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-fuchsia-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-cyan-400/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-pink-400/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2.5s' }}></div>
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-white/80 dark:bg-[#2a2a2a]/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 dark:border-[#333333]/50 overflow-hidden">
          {/* Header */}
          <div className="px-8 pt-12 pb-8 text-center bg-white dark:bg-[#2a2a2a] relative">
            <div className="flex justify-center mb-6">
              <div className="relative w-64 h-24">
                <Image
                  src="/images/mentis-logo.svg"
                  alt="Mentis - Sistema Integral de Psicología Ocupacional"
                  fill
                  className="object-contain scale-[1.8]"
                  priority
                />
              </div>
            </div>
          </div>

          <div className="px-8 pb-8">
            {/* Email/Password Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Input */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="correo@ejemplo.com"
                    required
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-gray-50 dark:bg-[#1a1a1a] border-2 border-gray-200 dark:border-[#333333] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-[#6b6b6b] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-12 pr-12 py-3.5 rounded-xl bg-gray-50 dark:bg-[#1a1a1a] border-2 border-gray-200 dark:border-[#333333] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-[#6b6b6b] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 disabled:from-indigo-400 disabled:to-indigo-500 text-white font-bold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Ingresando...</span>
                  </>
                ) : (
                  <span>Iniciar Sesión</span>
                )}
              </button>
            </form>

            {/* Lost Password Link */}
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setResetModalOpen(true)}
                className="text-sm text-gray-600 dark:text-[#b0b0b0] hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="px-8 py-6 bg-gray-50/50 dark:bg-[#1a1a1a]/50 border-t border-gray-200 dark:border-[#333333]">
            <p className="text-center text-xs text-gray-500 dark:text-[#6b6b6b]">
              © 2026 Mentis. Sistema Integral de Psicología Ocupacional
            </p>
          </div>
        </div>
      </div>

      {/* Recover Password Modal */}
      <Dialog open={resetModalOpen} onOpenChange={setResetModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-indigo-600">
              <AlertCircle className="h-5 w-5" />
              Restablecer Contraseña
            </DialogTitle>
            <DialogDescription>
              Ingresa tu correo electrónico y notificaremos al administrador el sistema para que te ayude a restablecer tu acceso.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleResetPassword} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reset-email">Correo Electrónico</Label>
              <Input
                id="reset-email"
                type="email"
                placeholder="correo@ejemplo.com"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                required
                className="pl-10"
              />
              <Mail className="absolute left-8 top-[118px] h-4 w-4 text-gray-400 pointer-events-none" />
              {/* Note: Absolute positioning might be tricky inside Dialog with padding, simplified approach below */}
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => setResetModalOpen(false)}>
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isResetting}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                {isResetting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  'Notificar al Administrador'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}