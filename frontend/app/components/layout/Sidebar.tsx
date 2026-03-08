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
  FileText,
  Activity,
  X,
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
          { title: 'Lista', href: '/dashboard/valoraciones', icon: List, exact: true },
          { title: 'Nueva Valoración', href: '/dashboard/valoraciones/nueva', icon: PlusCircle },
        ],
      },
      {
        title: 'Pruebas de Trabajo',
        icon: Briefcase,
        href: '/dashboard/pruebas-trabajo',
        requiresAccess: 'pruebas_trabajo' as const,
        children: [
          { title: 'Lista', href: '/dashboard/pruebas-trabajo', icon: List, exact: true },
          { title: 'Nueva Prueba', href: '/dashboard/pruebas-trabajo/nueva', icon: PlusCircle },
        ],
      },
      {
        title: 'Análisis de Exigencias (M)',
        icon: ClipboardList,
        href: '/dashboard/analisis-exigencias-mental',
        requiresAccess: 'analisis_exigencias_mental' as const,
        children: [
          { title: 'Lista', href: '/dashboard/analisis-exigencias-mental', icon: List, exact: true },
          { title: 'Nuevo Análisis', href: '/dashboard/analisis-exigencias-mental/nueva', icon: PlusCircle },
        ],
      },
      {
        title: 'Formatos TO',
        icon: FileText,
        href: '#',
        requiresAccess: 'formatos_to' as const,
        children: [
          {
            title: 'Prueba de Trabajo TO',
            href: '/dashboard/formatos-to/pruebas-trabajo',
            icon: Briefcase,
            children: [
              { title: 'Lista', href: '/dashboard/formatos-to/pruebas-trabajo', icon: List, exact: true },
              { title: 'Nueva', href: '/dashboard/formatos-to/pruebas-trabajo/nueva', icon: PlusCircle },
            ]
          },
          {
            title: 'Análisis de Exigencia',
            href: '/dashboard/formatos-to/analisis-exigencia',
            icon: Activity,
            children: [
              { title: 'Lista', href: '/dashboard/formatos-to/analisis-exigencia', icon: List, exact: true },
              { title: 'Nueva', href: '/dashboard/formatos-to/analisis-exigencia/nueva', icon: PlusCircle },
            ]
          },
          {
            title: 'Valoración Ocupacional',
            href: '/dashboard/formatos-to/valoracion-ocupacional',
            icon: FileText,
            requiresAccess: 'valoracion_ocupacional' as const,
            children: [
              { title: 'Lista', href: '/dashboard/formatos-to/valoracion-ocupacional', icon: List, exact: true },
              { title: 'Nueva', href: '/dashboard/formatos-to/valoracion-ocupacional/nueva', icon: PlusCircle },
            ]
          },
        ],
      },
    ],
  },
  {
    title: 'REPORTES',
    items: [
      { title: 'Descargas', icon: Download, href: '/dashboard/reportes' },
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

const hasModuleAccess = (user: any, accessType?: 'valoraciones' | 'pruebas_trabajo' | 'formatos_to' | 'analisis_exigencias_mental' | 'valoracion_ocupacional') => {
  if (!accessType) return true;
  if (!user) return false;
  if (user.rol === 'admin') return true;
  if (accessType === 'valoraciones') return user.acceso_valoraciones !== false;
  if (accessType === 'pruebas_trabajo') return user.acceso_pruebas_trabajo !== false;
  if (accessType === 'formatos_to') return user.acceso_formatos_to !== false;
  if (accessType === 'analisis_exigencias_mental') return user.acceso_analisis_exigencias_mental !== false;
  if (accessType === 'valoracion_ocupacional') return user.acceso_formatos_to !== false;
  return true;
};

export function Sidebar({ collapsed, setCollapsed }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const [expandedItems, setExpandedItems] = useState<string[]>(['Valoraciones', 'Formatos TO']);

  const toggleExpand = (title: string) => {
    setExpandedItems((prev) =>
      prev.includes(title) ? prev.filter((item) => item !== title) : [...prev, title]
    );
  };

  const isActive = (href: string, exact = false) => {
    if (href === '#' || href === '') return false;
    if (href === '/dashboard') return pathname === href;
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(href + '/');
  };

  const closeMobileSidebar = () => {
    if (window.innerWidth < 768 && setCollapsed) {
      setCollapsed(true);
    }
  };

  const renderMenuItem = (item: any, depth = 0) => {
    if (item.adminOnly && user?.rol !== 'admin') return null;
    if (item.requiresAccess && !hasModuleAccess(user, item.requiresAccess)) return null;

    const Icon = item.icon;
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.title);
    const active = item.href && item.href !== '#'
      ? isActive(item.href, item.exact)
      : item.children?.some((child: any) => isActive(child.href, child.exact) || child.children?.some((grandChild: any) => isActive(grandChild.href, grandChild.exact)));

    const key = item.title + depth;
    const isNested = depth > 0;

    return (
      <li key={key}>
        {hasChildren ? (
          <>
            <button
              onClick={() => toggleExpand(item.title)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 font-medium transition-all duration-200 ${active
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-600 hover:bg-blue-50/50 hover:text-blue-600'
                } ${collapsed ? 'justify-center px-2' : ''} ${isNested ? 'text-xs py-2' : 'text-sm'}`}
              style={{ paddingLeft: depth > 0 ? `${depth * 0.75 + 0.75}rem` : '' }}
            >
              <Icon className={`${isNested ? 'h-4 w-4' : 'h-[18px] w-[18px]'} shrink-0 ${active ? 'text-blue-600' : 'text-gray-400'}`} />
              {!collapsed && (
                <>
                  <span className="flex-1 text-left truncate">{item.title}</span>
                  <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                </>
              )}
            </button>
            {!collapsed && (
              <div className={`overflow-hidden transition-all duration-200 ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                <ul className="mt-0.5 space-y-0.5 ml-3 border-l-2 border-blue-100 pl-0">
                  {item.children.map((child: any) => renderMenuItem(child, depth + 1))}
                </ul>
              </div>
            )}
          </>
        ) : (
          <Link
            href={item.href}
            onClick={closeMobileSidebar}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 font-medium transition-all duration-200 ${active
              ? 'bg-blue-50 text-blue-600'
              : 'text-gray-600 hover:bg-blue-50/50 hover:text-blue-600'
              } ${collapsed ? 'justify-center px-2' : ''} ${isNested ? 'text-xs py-2' : 'text-sm'}`}
            style={{ paddingLeft: depth > 0 ? `${depth * 0.75 + 0.75}rem` : '' }}
          >
            <Icon className={`${isNested ? 'h-4 w-4' : 'h-[18px] w-[18px]'} shrink-0 ${active ? 'text-blue-600' : 'text-gray-400'}`} />
            {!collapsed && <span className="truncate">{item.title}</span>}
            {!collapsed && active && (
              <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600" />
            )}
          </Link>
        )}
      </li>
    );
  };

  return (
    <aside
      className={`fixed left-0 top-0 z-40 h-screen bg-white border-r border-gray-200 flex flex-col transition-all duration-300 
        ${collapsed ? '-translate-x-full md:translate-x-0 md:w-20' : 'translate-x-0 w-[280px] md:w-64'}
      `}
    >
      {/* Logo + Mobile Close */}
      <div className="flex h-16 items-center border-b border-gray-100 px-4 shrink-0">
        <Link href="/dashboard" className="flex items-center gap-3 flex-1 min-w-0" onClick={closeMobileSidebar}>
          <div className={`relative ${collapsed ? 'w-10 h-10' : 'w-52 h-14'} transition-all duration-300 flex items-center justify-center overflow-hidden`}>
            {collapsed ? (
              <div className="relative w-8 h-8">
                <Image src="/images/mentis-mini.svg" alt="M" fill className="object-contain" priority />
              </div>
            ) : (
              <Image src="/images/mentis-logo.svg" alt="Mentis" fill className="object-contain scale-[1.8]" priority sizes="(max-width: 768px) 100vw" />
            )}
          </div>
        </Link>
        {/* Mobile close button */}
        {!collapsed && (
          <button
            onClick={() => setCollapsed?.(true)}
            className="md:hidden p-2 -mr-1 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {menuItems.map((section, sectionIndex) => (
          <div key={section.title} className={sectionIndex > 0 ? 'mt-5' : ''}>
            {!collapsed && (
              <h3 className="mb-2 px-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                {section.title}
              </h3>
            )}
            <ul className="space-y-0.5">
              {section.items.map((item) => renderMenuItem(item))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Bottom section - Role badge only */}
      {!collapsed && (
        <div className="p-3 border-t border-gray-100 shrink-0">
          <div className="flex items-center justify-center px-3 py-2.5 rounded-xl bg-blue-50/50">
            {user?.rol && (
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold ${{
                admin: 'bg-blue-100 text-blue-700',
                psicologo: 'bg-green-100 text-green-700',
                terapeuta_ocupacional: 'bg-violet-100 text-violet-700',
                supervisor: 'bg-amber-100 text-amber-700',
              }[user.rol] ?? 'bg-gray-100 text-gray-600'}`}>
                {{ admin: 'Administrador', psicologo: 'Psicólogo', terapeuta_ocupacional: 'Ter. Ocupacional', supervisor: 'Supervisor' }[user.rol] ?? user.rol}
              </span>
            )}
          </div>
        </div>
      )}
    </aside>
  );
}