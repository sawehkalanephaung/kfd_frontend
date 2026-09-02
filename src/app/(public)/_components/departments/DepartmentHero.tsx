import { MapPin, Clock, User, ImageIcon } from "lucide-react";
import { DepartmentData } from "../../departments/types";
import { getMediaUrl } from "@/lib/api";

export default function DepartmentHero({ data }: { data: DepartmentData }) {
  // Try to find the primary contact to get address and office hours
  const primaryContact = data.contacts && data.contacts.length > 0 ? data.contacts[0] : null;
  
  // Also check bodyContent for backward compatibility
  let bodyContact: any = null;
  try {
    if (data.bodyContent) {
      const parsed = JSON.parse(data.bodyContent);
      if (parsed.contact) bodyContact = parsed.contact;
    }
  } catch (e) {}

  const address = primaryContact?.address || bodyContact?.address || "";
  const officeHours = primaryContact?.officeHours || bodyContact?.officeHours || "";
  
  // Head member name
  const headName = data.headMember ? `${data.headMember.firstName} ${data.headMember.lastName}` : "";

  // Resolve hero image from heroImageUrl
  const heroImageUrl = data.heroImageUrl ? getMediaUrl(data.heroImageUrl) : "";

  // Resolve logo from logoUrl
  const logoUrl = data.logoUrl ? getMediaUrl(data.logoUrl) : "";

  return (
    <div className="relative w-full bg-canvas overflow-hidden border-b border-hairline">
      {/* Background Image/Gradient overlay */}
      <div 
        className="absolute right-0 top-0 w-2/3 h-full opacity-60 pointer-events-none bg-surface flex items-center justify-center overflow-hidden"
        style={{
          WebkitMaskImage: 'linear-gradient(to left, black 50%, transparent 100%)',
          maskImage: 'linear-gradient(to left, black 50%, transparent 100%)',
        }}
      >
        {heroImageUrl ? (
          <img src={heroImageUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <ImageIcon size={64} className="text-gray-300 ml-32" />
        )}
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 relative z-10 flex flex-col sm:flex-row items-center sm:items-center gap-6 sm:gap-8 text-center sm:text-left">
        {/* Logo */}
        <div className="w-20 sm:w-24 shrink-0 flex items-center justify-center relative">
          {logoUrl ? (
            <img src={logoUrl} alt={`${data.name} logo`} className="w-full h-auto object-contain" />
          ) : (
            <div className="flex flex-col items-center justify-center text-center text-[8px] font-bold text-muted">
              <ImageIcon size={24} className="text-gray-300 mb-1" />
              <span>No Logo</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col gap-4 max-w-2xl min-w-0">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-ink tracking-tight wrap-break-word">{data.name}</h1>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-sm font-medium text-brand-text">
            {headName && (
              <div className="flex items-center gap-1.5 bg-green-50 dark:bg-surface px-3 py-1.5 rounded-full border border-green-100 dark:border-hairline">
                <User size={14} />
                <span>{headName}</span>
              </div>
            )}

            {address && (
              <div className="flex items-center gap-1.5 bg-green-50 dark:bg-surface px-3 py-1.5 rounded-full border border-green-100 dark:border-hairline">
                <MapPin size={14} />
                <span className="truncate max-w-50">{address}</span>
              </div>
            )}

            {officeHours && (
              <div className="flex items-center gap-1.5 bg-green-50 dark:bg-surface px-3 py-1.5 rounded-full border border-green-100 dark:border-hairline">
                <Clock size={14} />
                <span>{officeHours}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
