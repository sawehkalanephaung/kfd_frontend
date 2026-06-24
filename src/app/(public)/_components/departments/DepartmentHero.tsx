import { MapPin, Clock, User, ImageIcon } from "lucide-react";
import { DepartmentData } from "../../departments/types";

export default function DepartmentHero({ data }: { data: DepartmentData }) {
  // Try to find the primary contact to get address and office hours
  const primaryContact = data.contacts && data.contacts.length > 0 ? data.contacts[0] : null;
  const address = primaryContact?.address || "Headquarters office, Klo Yaw Lay, Hpa An District, Kawthoolei";
  const officeHours = primaryContact?.officeHours || "Mon - Fri, 9:00 AM - 5:00 PM";
  
  // Head member name
  const headName = data.headMember ? `${data.headMember.firstName} ${data.headMember.lastName}` : "Director";

  // Use a fallback nature background if heroImageId is not resolved to a URL yet
  // In a full implementation, you'd fetch the actual image URL from Media endpoint
  const bgImage = "/nature-bg.jpg"; // We assume a dummy nature background exists or use a CSS gradient

  return (
    <div className="relative w-full bg-white overflow-hidden border-b border-gray-100">
      {/* Background Image/Gradient overlay */}
      <div 
        className="absolute right-0 top-0 w-2/3 h-full opacity-60 pointer-events-none bg-gray-100 flex items-center justify-center"
        style={{
          WebkitMaskImage: 'linear-gradient(to left, black 50%, transparent 100%)',
          maskImage: 'linear-gradient(to left, black 50%, transparent 100%)',
        }}
      >
        <ImageIcon size={64} className="text-gray-300 ml-32" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10 flex items-center gap-8">
        {/* Logo */}
        <div className="w-24 h-32 flex-shrink-0 flex items-center justify-center bg-white shadow-sm rounded-md border border-gray-100 overflow-hidden relative">
          {/* Logo placeholder if no logo available, using an image tag to simulate the KFD logo */}
          <div className="absolute inset-0 flex flex-col items-center justify-center p-2 text-center text-[8px] font-bold text-red-700 bg-blue-50/20">
            <div className="w-full h-8 bg-red-600 rounded-t-sm mb-1 text-white flex items-center justify-center">KNU</div>
            <span>Department Logo</span>
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-col gap-4 max-w-2xl">
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">{data.name}</h1>
          
          <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-[#1a3626]">
            <div className="flex items-center gap-1.5 bg-green-50 px-3 py-1.5 rounded-full border border-green-100">
              <User size={14} />
              <span>{headName}</span>
            </div>
            
            <div className="flex items-center gap-1.5 bg-green-50 px-3 py-1.5 rounded-full border border-green-100">
              <MapPin size={14} />
              <span className="truncate max-w-[200px]">{address}</span>
            </div>
            
            <div className="flex items-center gap-1.5 bg-green-50 px-3 py-1.5 rounded-full border border-green-100">
              <Clock size={14} />
              <span>{officeHours}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
