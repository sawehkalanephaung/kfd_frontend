import { Trees } from "lucide-react";
import { DepartmentData } from "../../departments/types";
import { Building2, User, MapPin, Phone, Mail, Clock, Globe } from "lucide-react";


export default function DepartmentContactCard({ data }: { data: DepartmentData }) {
  let parsedContact: any = null;
  try {
    if (data.bodyContent) {
      const parsedBody = JSON.parse(data.bodyContent);
      if (parsedBody.contact) {
        parsedContact = parsedBody.contact;
      }
    }
  } catch (e) {
    // Ignore parse error
  }

  const dbContact = data.contacts && data.contacts.length > 0 ? data.contacts[0] : null;

  const address = parsedContact?.address || dbContact?.address || "Headquarters office, Klo Yaw Lay, Hpa An District, Kawthoolei";
  const phone = parsedContact?.phone || dbContact?.phone || "-";
  const email = parsedContact?.email || dbContact?.email || "ktl1949@gmail.com";
  const officeHours = parsedContact?.officeHours || dbContact?.officeHours || "Monday to Friday, 9:00 AM - 5:00 PM";
  const websiteUrl = parsedContact?.website || dbContact?.websiteUrl || "https://www.knuhq.org/departments/forestry";
  
  const headName = data.headMember ? `${data.headMember.firstName} ${data.headMember.lastName}` : (dbContact?.name || "P'doh Mahn Ba Tun");

  let socialLinks = { facebook: "https://facebook.com", twitter: "https://twitter.com", linkedin: "https://linkedin.com" };
  
  if (parsedContact?.socialMedia) {
    socialLinks = { ...socialLinks, ...parsedContact.socialMedia };
  } else if (dbContact?.socialLinks && typeof dbContact.socialLinks === 'string') {
    try {
      socialLinks = { ...socialLinks, ...JSON.parse(dbContact.socialLinks) };
    } catch (e) {
      // Ignore parse error
    }
  }

  return (
    <div className="py-8">
      <h2 className="text-xl font-bold text-gray-900 mb-6 border-b pb-4 inline-block border-green-700">
        Contact Details
      </h2>

      <div className="flex flex-col lg:flex-row gap-8 mt-4">
        {/* Contact Info Card */}
        <div className="lg:w-2/3 bg-white border border-gray-100 shadow-sm rounded-lg p-8">
          <div className="flex flex-col gap-6">
            
            <div className="flex items-start gap-4 border-b border-gray-100 pb-6">
              <div className="w-48 flex items-center gap-3 text-sm font-bold text-gray-700 shrink-0">
                <Building2 size={18} className="text-gray-400" />
                <span>Department Name</span>
              </div>
              <div className="text-sm font-bold text-gray-400 shrink-0 mr-4">:</div>
              <div className="text-sm font-medium text-gray-600">
                {data.name}
              </div>
            </div>

            <div className="flex items-start gap-4 border-b border-gray-100 pb-6">
              <div className="w-48 flex items-center gap-3 text-sm font-bold text-gray-700 shrink-0">
                <User size={18} className="text-gray-400" />
                <span>Head of Department</span>
              </div>
              <div className="text-sm font-bold text-gray-400 shrink-0 mr-4">:</div>
              <div className="text-sm font-medium text-gray-600">
                {headName}
              </div>
            </div>

            <div className="flex items-start gap-4 border-b border-gray-100 pb-6">
              <div className="w-48 flex items-center gap-3 text-sm font-bold text-gray-700 shrink-0">
                <MapPin size={18} className="text-gray-400" />
                <span>Address</span>
              </div>
              <div className="text-sm font-bold text-gray-400 shrink-0 mr-4">:</div>
              <div className="text-sm font-medium text-gray-600">
                {address}
              </div>
            </div>

            <div className="flex items-start gap-4 border-b border-gray-100 pb-6">
              <div className="w-48 flex items-center gap-3 text-sm font-bold text-gray-700 shrink-0">
                <Phone size={18} className="text-gray-400" />
                <span>Phone</span>
              </div>
              <div className="text-sm font-bold text-gray-400 shrink-0 mr-4">:</div>
              <div className="text-sm font-medium text-gray-600">
                {phone}
              </div>
            </div>

            <div className="flex items-start gap-4 border-b border-gray-100 pb-6">
              <div className="w-48 flex items-center gap-3 text-sm font-bold text-gray-700 shrink-0">
                <Mail size={18} className="text-gray-400" />
                <span>Email</span>
              </div>
              <div className="text-sm font-bold text-gray-400 shrink-0 mr-4">:</div>
              <div className="text-sm font-medium text-blue-600 hover:underline">
                {email}
              </div>
            </div>

            <div className="flex items-start gap-4 border-b border-gray-100 pb-6">
              <div className="w-48 flex items-center gap-3 text-sm font-bold text-gray-700 shrink-0">
                <Clock size={18} className="text-gray-400" />
                <span>Office Hours</span>
              </div>
              <div className="text-sm font-bold text-gray-400 shrink-0 mr-4">:</div>
              <div className="text-sm font-medium text-gray-600">
                {officeHours}
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-48 flex items-center gap-3 text-sm font-bold text-gray-700 shrink-0">
                <Globe size={18} className="text-gray-400" />
                <span>Website</span>
              </div>
              <div className="text-sm font-bold text-gray-400 shrink-0 mr-4">:</div>
              <div className="text-sm font-medium text-blue-600 hover:underline break-all">
                <a href={websiteUrl} target="_blank" rel="noopener noreferrer">{websiteUrl}</a>
              </div>
            </div>

          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:w-1/3 flex flex-col gap-6">
          <div className="bg-green-50/50 rounded-lg p-8 border border-green-100 relative overflow-hidden">
            {/* Leaf decorative icon */}
            <div className="absolute -top-4 -right-4 opacity-20 rotate-45 text-green-600 pointer-events-none">
              <svg width="100" height="100" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17 8C8 10 5.9 16.19 5.82 16.36a1 1 0 0 0 .15 1.15 1 1 0 0 0 1.12.2c.2-.08 6.45-2.73 10.9-11.71a1 1 0 0 0-1-1zm-6 8a4 4 0 0 1 4-4" />
              </svg>
            </div>

            <h3 className="text-sm font-bold text-green-700 mb-3 relative z-10">Connect With Us</h3>
            <p className="text-xs text-gray-600 leading-relaxed mb-8 relative z-10">
              Follow our social media channels to stay updated on our latest activities and news.
            </p>

            <div className="flex items-center justify-around relative z-10 border-b border-green-200 pb-8">
              <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 group">
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center transform transition-transform group-hover:scale-110 shadow-sm">
                  {/* Facebook */}
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                </div>
                <span className="text-[10px] text-gray-600 font-medium">Facebook</span>
              </a>
              <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 group">
                <div className="w-10 h-10 rounded-full bg-sky-500 text-white flex items-center justify-center transform transition-transform group-hover:scale-110 shadow-sm">
                  {/* Twitter / X */}
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
                </div>
                <span className="text-[10px] text-gray-600 font-medium">Twitter</span>
              </a>
              <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 group">
                <div className="w-10 h-10 rounded-full bg-blue-700 text-white flex items-center justify-center transform transition-transform group-hover:scale-110 shadow-sm">
                  {/* LinkedIn */}
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
                </div>
                <span className="text-[10px] text-gray-600 font-medium">LinkedIn</span>
              </a>
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
        </div>
      </div>
    </div>
  );
}
