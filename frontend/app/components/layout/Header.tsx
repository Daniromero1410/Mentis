'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useAuth } from '@/app/context/AuthContext';
import { api } from '@/app/services/api';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from '@/components/ui/input';
import { Menu, Search, Bell, Settings, LogOut, UserCircle, Check, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from '@/components/ui/sileo-toast';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export function Header({ onToggleSidebar }: HeaderProps) {

  const { user, logout } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [loadingResolve, setLoadingResolve] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Solo fetching si el usuario es admin
    if (user?.rol === 'admin') {
      const fetchPendingRequests = async () => {
        try {
          const response = await api.get('/auth/password-reset-requests?pending_only=true') as any[];
          setPendingRequests(response);
        } catch (error) {
          console.error("Error fetching requests", error);
        }
      };

      fetchPendingRequests();
      // Polling cada 30 segundos
      const interval = setInterval(fetchPendingRequests, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleResolveRequest = async (id: number) => {
    setLoadingResolve(id);
    try {
      await api.post(`/auth/password-reset-requests/${id}/resolve`, {});
      setPendingRequests(prev => prev.filter(req => req.id !== id));
      toast.success('Solicitud marcada como resuelta');
    } catch (error) {
      console.error('Error resolving request', error);
      toast.error('Error al resolver la solicitud');
    } finally {
      setLoadingResolve(null);
    }
  };

  const getInitials = (nombre: string, apellido: string) => {
    return `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase();
  };

  const handleLogout = () => {
    setShowLogoutModal(false);
    logout();
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-gray-200 transition-colors duration-300">
      <div className="flex h-full items-center justify-between px-4 lg:px-6">
        {/* Left Side */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            className="hover:bg-gray-100 rounded-lg"
          >
            <Menu className="h-5 w-5 text-gray-600" />
          </Button>

          {/* Search */}
          <div className="hidden md:flex relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              type="search"
              placeholder="Buscar valoraciones..."
              className="w-72 pl-10 h-10 bg-gray-100 border-0 rounded-lg text-gray-900 placeholder-gray-500"
            />
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="relative hover:bg-gray-100 rounded-lg">
                <Bell className="h-5 w-5 text-gray-600" />
                {pendingRequests.length > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-1 ring-white">
                    {pendingRequests.length}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0 bg-white shadow-xl border border-gray-200" align="end">
              <div className="p-4 border-b border-gray-100">
                <h4 className="font-semibold text-sm">Notificaciones</h4>
                <p className="text-xs text-gray-500">Solicitudes de acceso pendientes</p>
              </div>
              <div className="max-h-[300px] overflow-y-auto">
                {pendingRequests.length === 0 ? (
                  <div className="p-4 text-center text-sm text-gray-500">
                    No hay notificaciones nuevas
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {pendingRequests.map((req) => (
                      <div key={req.id} className="p-4 flex items-start gap-3 hover:bg-gray-50 transition-colors">
                        <div className="bg-indigo-100 p-2 rounded-full">
                          <UserCircle className="h-4 w-4 text-indigo-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            Restablecer Contraseña
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {req.email}
                          </p>
                          <p className="text-[10px] text-gray-400 mt-1">
                            {formatDistanceToNow(new Date(req.created_at), { addSuffix: true, locale: es })}
                          </p>
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                          onClick={() => handleResolveRequest(req.id)}
                          disabled={loadingResolve === req.id}
                        >
                          {loadingResolve === req.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Check className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>

          {/* Divider */}
          <div className="hidden md:block w-px h-8 bg-gray-200"></div>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-3 h-10 px-3 hover:bg-gray-100 rounded-lg">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-white text-sm font-semibold" style={{ background: 'linear-gradient(135deg, #8a2535, #6d1d2a)' }}>
                    {user ? getInitials(user.nombre, user.apellido) : 'U'}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden md:block text-sm font-medium text-gray-700">
                  {user?.nombre}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 bg-white border border-gray-200 shadow-xl p-2 rounded-2xl">
              {/* Profile Header */}
              <div className="flex items-center gap-3 px-3 py-3 mb-2 rounded-xl" style={{ backgroundColor: '#fdf2f4' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold" style={{ background: 'linear-gradient(135deg, #8a2535, #6d1d2a)' }}>
                  {user ? getInitials(user.nombre, user.apellido) : 'U'}
                </div>
                <div className="flex-1 overflow-hidden">
                  <h4 className="text-sm font-semibold text-gray-900 truncate">{user?.nombre} {user?.apellido}</h4>
                  <p className="text-[11px] text-gray-500 truncate mt-0.5">{user?.email}</p>
                </div>
              </div>

              {/* Navigation Links */}
              <div className="space-y-1 mb-2">
                <DropdownMenuItem asChild>
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer text-gray-700 hover:text-[#6d1d2a] hover:bg-[#fdf2f4] transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500">
                      <Menu className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Inicio</p>
                      <p className="text-[10px] text-gray-400">Panel principal</p>
                    </div>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link
                    href="/dashboard/configuracion"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer text-gray-700 hover:text-[#6d1d2a] hover:bg-[#fdf2f4] transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500">
                      <Settings className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Configuración</p>
                      <p className="text-[10px] text-gray-400">Ajustes de cuenta</p>
                    </div>
                  </Link>
                </DropdownMenuItem>
              </div>

              <div className="h-px bg-gray-100 my-2 mx-1" />

              {/* Logout Button */}
              <DropdownMenuItem
                onClick={() => setShowLogoutModal(true)}
                className="w-full flex items-center justify-center gap-2 mt-1 px-4 py-2.5 rounded-xl text-red-500 hover:text-red-600 hover:bg-red-50 cursor-pointer font-medium transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Cerrar Sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Modal de Cerrar Sesión */}
      {showLogoutModal && mounted && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          {/* Backdrop blur - vinotinto */}
          <div className="absolute inset-0 backdrop-blur-md transition-all duration-300" style={{ backgroundColor: 'rgba(109,29,42,0.75)' }} onClick={() => setShowLogoutModal(false)} />

          {/* Modal card */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Top accent */}
            <div className="h-1.5" style={{ backgroundColor: '#6d1d2a' }} />

            <div className="p-6">
              {/* Avatar + info */}
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold mb-3 shadow-lg" style={{ backgroundColor: '#6d1d2a' }}>
                  {user ? getInitials(user.nombre, user.apellido) : 'U'}
                </div>
                <h3 className="text-lg font-bold text-gray-900">{user?.nombre} {user?.apellido}</h3>
                <p className="text-sm text-gray-500 mt-0.5">{user?.email}</p>
                <span className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize" style={{ backgroundColor: '#fdf2f4', color: '#6d1d2a', border: '1px solid #f5c6ce' }}>
                  {user?.rol}
                </span>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-100 pt-4 mb-4">
                <p className="text-sm text-gray-600 text-center">
                  ¿Estás seguro que deseas cerrar sesión?
                </p>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1 h-11 rounded-xl border-gray-200 text-gray-700 hover:bg-gray-50 font-medium"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleLogout}
                  className="flex-1 h-11 rounded-xl bg-red-500 hover:bg-red-600 text-white font-medium shadow-sm transition-colors"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Cerrar Sesión
                </Button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </header>
  );
}
