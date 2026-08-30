'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Newspaper, FileText, Image as ImageIcon, Users, BookOpen } from 'lucide-react';

interface GlobalCreateButtonProps {
  userRoles?: string[];
  className?: string;
}

export default function GlobalCreateButton({ userRoles = [], className = '' }: GlobalCreateButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const hasRole = (roles: string[]) => roles.some(role => userRoles.includes(role));

  const canManageContent = hasRole(['manage_content', 'ROLE_SUPER_ADMIN']);
  const canManageUsers = hasRole(['manage_users', 'ROLE_SUPER_ADMIN']);

  const menuItems = [
    {
      label: 'Post',
      href: '/dashboard/posts/create',
      icon: Newspaper,
      show: canManageContent,
    },
    {
      label: 'Page',
      href: '/dashboard/pages/create',
      icon: FileText,
      show: canManageContent,
    },
    {
      label: 'Publication',
      href: '/dashboard/publications/create',
      icon: BookOpen,
      show: canManageContent,
    },
    {
      label: 'Media',
      href: '/dashboard/media/upload',
      icon: ImageIcon,
      show: canManageContent,
    },
    {
      label: 'Team Member',
      href: '/dashboard/team/create',
      icon: Users,
      show: canManageUsers,
    }
  ].filter(item => item.show);

  if (menuItems.length === 0) return null;

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className="group inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-deep text-on-primary font-semibold rounded-full transition-all duration-200 ease-in-out shadow-sm hover:shadow-lg hover:shadow-primary/30 active:scale-95 shrink-0 whitespace-nowrap text-[14px]"
      >
        <Plus className={`w-5 h-5 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-45' : 'group-hover:scale-110'}`} />
        <span>Create</span>
      </button>

      {isOpen && (
        <div 
          className="absolute left-0 mt-2 w-56 bg-canvas rounded-lg shadow-modal border border-hairline overflow-hidden z-50 origin-top-left" 
          style={{ animation: 'slideDown 0.15s ease-out' }}
        >
          <div className="py-2">
            {menuItems.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="dropdown-row-hover flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-ink hover:text-brand-green-dark transition-all duration-200 ease-in-out"
              >
                <item.icon className="w-4 h-4 text-steel" />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
