'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { api } from '@/app/services/api';
import Image from 'next/image';
import { toast } from '../../components/ui/sileo-toast';
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
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

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
      await login(email, password, false);
      setLoginSuccess(true);
      toast.success('¡Bienvenido al sistema!');

      setTimeout(() => {
        router.push('/dashboard');
      }, 1500); // Wait for animations to finish
    } catch (error: any) {
      toast.error(error.message || 'Credenciales incorrectas');
      setIsSubmitting(false); // Only reset on error
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-slate-100 to-brand-50 relative overflow-hidden transition-colors duration-500">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Animated Gradient Orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-fuchsia-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-cyan-400/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-pink-400/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2.5s' }}></div>
      </div>

      {/* Success Overlay Animation */}
      <div
        className={`fixed inset-0 z-50 flex flex-col items-center justify-center transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${loginSuccess ? 'opacity-100 scale-100 rounded-none' : 'opacity-0 scale-0 rounded-full pointer-events-none'
          }`}
        style={{ backgroundColor: '#ffc600' }}
      >
        <div className={`flex flex-col items-center justify-center transition-all duration-500 delay-300 ${loginSuccess ? 'opacity-100 scale-110' : 'opacity-0 scale-90'}`}>
          <div className="relative">
            <div className="absolute inset-0 rounded-full blur-xl animate-pulse" style={{ backgroundColor: 'rgba(109,29,42,0.2)' }}></div>
            <CheckCircle2 className="h-24 w-24 mb-6 relative z-10 drop-shadow-md" style={{ color: '#6d1d2a' }} />
          </div>
          <h2 className="text-4xl font-bold tracking-tight mb-3" style={{ color: '#6d1d2a' }}>¡Bienvenido!</h2>
          <p className="text-lg flex items-center gap-2" style={{ color: '#6d1d2a' }}>
            <Loader2 className="h-5 w-5 animate-spin" />
            Preparando tu entorno...
          </p>
        </div>
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 overflow-hidden">
          {/* Header */}
          <div className="px-8 pt-12 pb-8 text-center bg-white relative">
            <div className="flex justify-center mb-6">
              <div className="relative w-64 h-24">
                <Image
                  src="/images/mentis-logo.svg"
                  alt="Mentis - Sistema Integral de Gestión de Reintegro Laboral Efectivo"
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
                <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
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
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-gray-50 border-2 border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6d1d2a] focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
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
                    className="w-full pl-12 pr-12 py-3.5 rounded-xl bg-gray-50 border-2 border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6d1d2a] focus:border-transparent transition-all duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl text-white font-bold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:opacity-90 disabled:opacity-60" style={{ background: 'linear-gradient(to right, #8a2535, #6d1d2a)' }}
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
                className="text-sm text-gray-600 hover:text-[#6d1d2a] font-medium transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="px-8 py-6 bg-gray-50/50 border-t border-gray-200">
            <p className="text-center text-xs text-gray-500">
              © 2026 Mentis. Sistema Integral de Gestión de Reintegro Laboral Efectivo
            </p>
          </div>
        </div>
      </div>

      {/* Recover Password Modal */}
      <Dialog open={resetModalOpen} onOpenChange={setResetModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2" style={{ color: '#6d1d2a' }}>
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
                className="text-white" style={{ backgroundColor: '#6d1d2a' }}
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