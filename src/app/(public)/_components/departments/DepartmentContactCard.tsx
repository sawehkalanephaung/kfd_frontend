"use client";

import { Trees } from "lucide-react";
import { DepartmentData } from "../../departments/types";
import { Building2, User, MapPin, Phone, Mail, Clock, Globe } from "lucide-react";

// Social media icon components
function FacebookIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>;
}
function TwitterIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>;
}
function LinkedInIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>;
}
function YouTubeIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19.1c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.43z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="white"/></svg>;
}
function InstagramIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>;
}
function TikTokIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1 0-5.78 2.92 2.92 0 0 1 .88.13V9a6.34 6.34 0 0 0-1-.05A6.34 6.34 0 0 0 3 15.27a6.34 6.34 0 0 0 6.33 6.34A6.34 6.34 0 0 0 15.66 15V8.79a8.19 8.19 0 0 0 3.93 1v-3.1z"/></svg>;
}

const PLATFORM_CONFIG: Record<string, { icon: React.FC; color: string; label: string }> = {
  facebook: { icon: FacebookIcon, color: 'bg-blue-600', label: 'Facebook' },
  'twitter / x': { icon: TwitterIcon, color: 'bg-sky-500', label: 'Twitter' },
  twitter: { icon: TwitterIcon, color: 'bg-sky-500', label: 'Twitter' },
  linkedin: { icon: LinkedInIcon, color: 'bg-blue-700', label: 'LinkedIn' },
  youtube: { icon: YouTubeIcon, color: 'bg-red-600', label: 'YouTube' },
  instagram: { icon: InstagramIcon, color: 'bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600', label: 'Instagram' },
  tiktok: { icon: TikTokIcon, color: 'bg-black', label: 'TikTok' },
};

export default function DepartmentContactCard({ data }: { data: DepartmentData }) {
  // Read from real contacts API data
  const dbContact = data.contacts && data.contacts.length > 0 ? data.contacts[0] : null;

  // Backward compatibility: also check bodyContent for contact data
  let bodyContact: any = null;
  try {
    if (data.bodyContent) {
      const parsedBody = JSON.parse(data.bodyContent);
      if (parsedBody.contact) bodyContact = parsedBody.contact;
    }
  } catch (e) {}

  const address = dbContact?.address || bodyContact?.address || "";
  const phone = dbContact?.phone || bodyContact?.phone || "";
  const email = dbContact?.email || bodyContact?.email || "";
  const officeHours = dbContact?.officeHours || bodyContact?.officeHours || "";
  const websiteUrl = dbContact?.websiteUrl || bodyContact?.website || "";
  
  const headName = data.headMember ? `${data.headMember.firstName} ${data.headMember.lastName}` : "";

  // Parse social links — supports both new array format and legacy object format
  let socialLinksArray: { platform: string; url: string }[] = [];
  
  if (dbContact?.socialLinks) {
    try {
      const parsed = typeof dbContact.socialLinks === 'string' ? JSON.parse(dbContact.socialLinks) : dbContact.socialLinks;
      if (Array.isArray(parsed)) {
        socialLinksArray = parsed.filter((l: any) => l.url);
      } else if (typeof parsed === 'object') {
        socialLinksArray = Object.entries(parsed)
          .filter(([, url]) => url)
          .map(([platform, url]) => ({ platform, url: url as string }));
      }
    } catch (e) {}
  } else if (bodyContact?.socialMedia) {
    socialLinksArray = Object.entries(bodyContact.socialMedia)
      .filter(([, url]) => url)
      .map(([platform, url]) => ({ platform, url: url as string }));
  }

  // Helper to render a contact row — returns null if value is empty or just a dash
  const ContactRow = ({ icon: Icon, label, value, isLink, href }: { icon: any; label: string; value: string; isLink?: boolean; href?: string }) => {
    if (!value || value.trim() === '-') return null;
    return (
      <div className="flex items-start gap-4 border-b border-gray-100 pb-6">
        <div className="w-48 flex items-center gap-3 text-sm font-bold text-gray-700 shrink-0">
          <Icon size={18} className="text-gray-400" />
          <span>{label}</span>
        </div>
        <div className="text-sm font-bold text-gray-400 shrink-0 mr-4">:</div>
        {isLink ? (
          <a href={href || value} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-blue-600 hover:underline break-all">
            {value}
          </a>
        ) : (
          <div className="text-sm font-medium text-gray-600">{value}</div>
        )}
      </div>
    );
  };

  return (
    <div className="py-8">
      <h2 className="text-xl font-bold text-gray-900 mb-6 border-b pb-4 inline-block border-green-700">
        Contact Details
      </h2>

      <div className="flex flex-col lg:flex-row gap-8 mt-4">
        {/* Contact Info Card */}
        <div className="lg:w-2/3 bg-white border border-gray-100 shadow-sm rounded-lg p-8">
          <div className="flex flex-col gap-6">
            <ContactRow icon={Building2} label="Department Name" value={data.name} />
            <ContactRow icon={User} label="Head of Department" value={headName} />
            <ContactRow icon={MapPin} label="Address" value={address} />
            <ContactRow icon={Phone} label="Phone" value={phone} />
            <ContactRow icon={Mail} label="Email" value={email} isLink href={`mailto:${email}`} />
            <ContactRow icon={Clock} label="Office Hours" value={officeHours} />
            <ContactRow icon={Globe} label="Website" value={websiteUrl} isLink />
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:w-1/3 flex flex-col gap-6">
          {socialLinksArray.length > 0 && (
            <div className="bg-green-50/50 rounded-lg p-8 border border-green-100 relative overflow-hidden">
              <div className="absolute -top-4 -right-4 opacity-20 rotate-45 text-green-600 pointer-events-none">
                <svg width="100" height="100" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17 8C8 10 5.9 16.19 5.82 16.36a1 1 0 0 0 .15 1.15 1 1 0 0 0 1.12.2c.2-.08 6.45-2.73 10.9-11.71a1 1 0 0 0-1-1zm-6 8a4 4 0 0 1 4-4" />
                </svg>
              </div>

              <h3 className="text-sm font-bold text-green-700 mb-3 relative z-10">Connect With Us</h3>
              <p className="text-xs text-gray-600 leading-relaxed mb-8 relative z-10">
                Follow our social media channels to stay updated on our latest activities and news.
              </p>

              <div className="flex items-center justify-around relative z-10 border-b border-green-200 pb-8 flex-wrap gap-4">
                {socialLinksArray.map((link, idx) => {
                  const key = link.platform.toLowerCase();
                  const config = PLATFORM_CONFIG[key] || { icon: Globe, color: 'bg-gray-600', label: link.platform };
                  const IconComp = config.icon;
                  return (
                    <a key={idx} href={link.url} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 group">
                      <div className={`w-10 h-10 rounded-full ${config.color} text-white flex items-center justify-center transform transition-transform group-hover:scale-110 shadow-sm`}>
                        <IconComp />
                      </div>
                      <span className="text-[10px] text-gray-600 font-medium">{config.label}</span>
                    </a>
                  );
                })}
              </div>

              <div className="mt-8 flex items-center gap-4 relative z-10">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center border-2 border-green-200 shrink-0">
                  <Trees size={32} className="text-green-700" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-green-800 mb-1">Together for Our Forests</h4>
                  <p className="text-[10px] text-gray-600 leading-relaxed">
                    Your support and collaboration help us protect and conserve our forests for future generations.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
