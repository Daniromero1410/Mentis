'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/context/AuthContext';
import { api } from '@/app/services/api';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { Menu, Search, Bell, Settings, LogOut, UserCircle, Check, X, Loader2 } from 'lucide-react';
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
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [loadingResolve, setLoadingResolve] = useState<number | null>(null);

  useEffect(() => {
    // Solo fetching si el usuario es admin
    if (user?.rol === 'admin') {
      const fetchPendingRequests = async () => {
        try {
          // console.log("Fetching pending requests...");
          const response = await api.get('/auth/password-reset-requests?pending_only=true') as any[];
          // console.log("Pending requests response:", response);
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
    logout();
    setShowLogoutModal(false);
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
                  <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-violet-600 text-white text-sm font-semibold">
                    {user ? getInitials(user.nombre, user.apellido) : 'U'}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden md:block text-sm font-medium text-gray-700">
                  {user?.nombre}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-white border border-gray-200">
              <div className="px-3 py-3 border-b border-gray-100">
                <p className="font-semibold text-gray-900">{user?.nombre} {user?.apellido}</p>
                <p className="text-xs text-gray-500 mt-0.5">{user?.email}</p>
              </div>
              <div className="py-1">
                <DropdownMenuItem
                  onClick={() => setShowProfileModal(true)}
                  className="gap-2 cursor-pointer text-gray-700 hover:bg-gray-100"
                >
                  <UserCircle className="h-4 w-4" />
                  Mi Perfil
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link
                    href="/dashboard/configuracion"
                    className="gap-2 cursor-pointer text-gray-700 hover:bg-gray-100 w-full flex items-center"
                  >
                    <Settings className="h-4 w-4" />
                    Configuración
                  </Link>
                </DropdownMenuItem>
              </div>
              <DropdownMenuSeparator className="bg-gray-100" />
              <DropdownMenuItem
                onClick={() => setShowLogoutModal(true)}
                className="gap-2 text-red-600 cursor-pointer hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
                Cerrar Sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Modal de Cerrar Sesión */}
      <Modal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        title="Cerrar Sesión"
        size="sm"
        footer={
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowLogoutModal(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleLogout}
              className="bg-[#ff4444] hover:bg-red-600"
            >
              Cerrar Sesión
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            ¿Estás seguro que deseas cerrar sesión?
          </p>
        </div>
      </Modal>

      {/* Modal de Mi Perfil (Antes Configuración) */}
      <Modal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        title="Mi Perfil"
        size="md"
        footer={
          <div className="flex justify-end gap-2">
            <Button
              onClick={() => setShowProfileModal(false)}
              className="bg-indigo-500 hover:bg-indigo-600"
            >
              Cerrar
            </Button>
          </div>
        }
      >
        <div className="space-y-6">
          {/* Usuario */}
          <div className="space-y-2">
            <h4 className="font-semibold text-gray-900">Información del Usuario</h4>
            <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-gray-500">Nombre</p>
                  <p className="font-medium text-gray-900">{user?.nombre} {user?.apellido}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium text-gray-900">{user?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Rol</p>
                  <p className="font-medium text-gray-900 capitalize">{user?.rol}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </header>
  );
}