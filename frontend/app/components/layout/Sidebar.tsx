'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  Settings,
  ChevronDown,
  Download,
  PlusCircle,
  List,
  Briefcase,
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed?: (collapsed: boolean) => void;
}

const menuItems = [
  {
    title: 'NAVEGACIÓN',
    items: [
      { title: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
      {
        title: 'Val. Psicológicas',
        icon: ClipboardList,
        href: '/dashboard/valoraciones',
        requiresAccess: 'valoraciones' as const,
        children: [
          { title: 'Lista', href: '/dashboard/valoraciones', icon: List },
          { title: 'Nueva Valoración', href: '/dashboard/valoraciones/nueva', icon: PlusCircle },
        ],
      },
      {
        title: 'Pruebas de Trabajo',
        icon: Briefcase,
        href: '/dashboard/pruebas-trabajo',
        requiresAccess: 'pruebas_trabajo' as const,
        children: [
          { title: 'Lista', href: '/dashboard/pruebas-trabajo', icon: List },
          { title: 'Nueva Prueba', href: '/dashboard/pruebas-trabajo/nueva', icon: PlusCircle },
        ],
      },
    ],
  },
  {
    title: 'REPORTES',
    items: [
      {
        title: 'Descargas',
        icon: Download,
        href: '/dashboard/reportes',
      },
    ],
  },
  {
    title: 'ADMINISTRACIÓN',
    items: [
      { title: 'Usuarios', icon: Users, href: '/dashboard/usuarios', adminOnly: true },
      { title: 'Configuración', icon: Settings, href: '/dashboard/configuracion' },
    ],
  },
];

// Función para verificar si el usuario tiene acceso a un módulo
const hasModuleAccess = (user: any, accessType?: 'valoraciones' | 'pruebas_trabajo') => {
  if (!accessType) return true; // Sin restricción
  if (!user) return false;
  if (user.rol === 'admin') return true; // Admin tiene acceso a todo

  if (accessType === 'valoraciones') return user.acceso_valoraciones !== false;
  if (accessType === 'pruebas_trabajo') return user.acceso_pruebas_trabajo !== false;

  return true;
};

export function Sidebar({ collapsed, setCollapsed }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const [expandedItems, setExpandedItems] = useState<string[]>(['Valoraciones']);

  const toggleExpand = (title: string) => {
    setExpandedItems((prev) =>
      prev.includes(title) ? prev.filter((item) => item !== title) : [...prev, title]
    );
  };

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === href;
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <aside
      className={`fixed left-0 top-0 z-40 h-screen bg-white border-r border-gray-200 transition-all duration-300
        ${collapsed ? '-translate-x-full md:translate-x-0 md:w-20' : 'translate-x-0 w-64'}
      `}
    >
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-gray-200 px-4">
        <Link href="/dashboard" className="flex items-center gap-3 w-full">
          <div className={`relative ${collapsed ? 'w-10 h-10' : 'w-52 h-14'} transition-all duration-300 flex items-center justify-center overflow-hidden`}>
            {collapsed ? (
              <div className="relative w-8 h-8">
                <Image
                  src="/images/mentis-mini.svg"
                  alt="M"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            ) : (
              <Image
                src="/images/mentis-logo.svg"
                alt="Mentis"
                fill
                className="object-contain scale-[1.8]"
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            )}
          </div>
        </Link>
      </div >

      {/* Navigation */}
      < nav className="flex-1 overflow-y-auto p-3" >
        {
          menuItems.map((section, sectionIndex) => (
            <div key={section.title} className={sectionIndex > 0 ? 'mt-6' : ''}>
              {!collapsed && (
                <h3 className="mb-2 px-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  {section.title}
                </h3>
              )}
              <ul className="space-y-1">
                {section.items.map((item) => {
                  // Verificar permisos de admin
                  if ('adminOnly' in item && item.adminOnly && user?.rol !== 'admin') {
                    return null;
                  }

                  // Verificar permisos de acceso a módulos
                  if ('requiresAccess' in item && !hasModuleAccess(user, item.requiresAccess)) {
                    return null;
                  }

                  const Icon = item.icon;
                  const hasChildren = 'children' in item && item.children;
                  const isExpanded = expandedItems.includes(item.title);
                  const active = isActive(item.href);

                  return (
                    <li key={item.title}>
                      {hasChildren ? (
                        <>
                          <button
                            onClick={() => toggleExpand(item.title)}
                            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${active
                              ? 'bg-indigo-500/10 text-indigo-600 shadow-sm'
                              : 'text-gray-600 hover:bg-gray-100'
                              } ${collapsed ? 'justify-center px-2' : ''}`}
                          >
                            <Icon className={`h-5 w-5 flex-shrink-0 ${active ? 'text-indigo-600' : ''}`} />
                            {!collapsed && (
                              <>
                                <span className="flex-1 text-left">{item.title}</span>
                                <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                              </>
                            )}
                          </button>
                          {!collapsed && isExpanded && (
                            <ul className="mt-1 ml-4 space-y-1 border-l-2 border-gray-200 pl-3">
                              {item.children?.map((child) => {
                                const ChildIcon = child.icon;
                                const childActive = pathname === child.href;
                                return (
                                  <li key={child.href}>
                                    <Link
                                      href={child.href}
                                      className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all duration-200 ${childActive
                                        ? 'bg-indigo-500/10 text-indigo-600 font-medium shadow-sm'
                                        : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                                        }`}
                                    >
                                      <ChildIcon className="h-4 w-4" />
                                      {child.title}
                                    </Link>
                                  </li>
                                );
                              })}
                            </ul>
                          )}
                        </>
                      ) : (
                        <Link
                          href={item.href}
                          className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${active
                            ? 'bg-indigo-500/10 text-indigo-600 shadow-sm'
                            : 'text-gray-600 hover:bg-gray-100'
                            } ${collapsed ? 'justify-center px-2' : ''}`}
                        >
                          <Icon className={`h-5 w-5 flex-shrink-0 ${active ? 'text-indigo-600' : ''}`} />
                          {!collapsed && <span>{item.title}</span>}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))
        }
      </nav >
    </aside >
  );
}