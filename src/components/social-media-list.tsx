'use client';

import React, { useEffect, useState } from 'react';
import { Link as LinkIcon } from 'lucide-react';
import { FaFacebook, FaTwitter, FaInstagram, FaYoutube, FaLinkedin } from 'react-icons/fa';
import api from '@/lib/api';

interface SocialMediaListProps {
  variant: 'footer' | 'contactPage';
  className?: string;
}

export default function SocialMediaList({ variant, className = '' }: SocialMediaListProps) {
  const [links, setLinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLinks = async () => {
      try {
        const res = await api.get('/api/v1/public/social-media');
        setLinks(res.data);
      } catch (err) {
        console.error('Failed to load social media links', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLinks();
  }, []);

  const getIcon = (platformName: string, sizeClass: string) => {
    switch (platformName.toUpperCase()) {
      case 'FACEBOOK': return <FaFacebook className={sizeClass} />;
      case 'TWITTER': return <FaTwitter className={sizeClass} />;
      case 'INSTAGRAM': return <FaInstagram className={sizeClass} />;
      case 'YOUTUBE': return <FaYoutube className={sizeClass} />;
      case 'LINKEDIN': return <FaLinkedin className={sizeClass} />;
      case 'TIKTOK': return <svg className={sizeClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" /></svg>;
      default: return <LinkIcon className={sizeClass} />;
    }
  };

  if (loading || links.length === 0) return null;

  if (variant === 'footer') {
    return (
      <div className={`flex items-center gap-4 ${className}`}>
        {links.map((link) => (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-emerald-500 transition-colors"
            aria-label={link.platformName}
          >
            {getIcon(link.platformName, 'w-5 h-5')}
          </a>
        ))}
      </div>
    );
  }

  // contactPage variant
  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      {links.map((link) => (
        <a
          key={link.id}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-100 rounded-full text-sm font-medium text-gray-700 transition-all"
        >
          {getIcon(link.platformName, 'w-4 h-4 text-emerald-500')}
          {link.platformName}
        </a>
      ))}
    </div>
  );
}
