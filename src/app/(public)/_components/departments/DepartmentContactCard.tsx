import { DepartmentData } from "../../../departments/types";
import { Building2, User, MapPin, Phone, Mail, Clock, Globe, Facebook, Twitter, Linkedin } from "lucide-react";
import Image from "next/image";

export default function DepartmentContactCard({ data }: { data: DepartmentData }) {
  const contact = data.contacts && data.contacts.length > 0 ? data.contacts[0] : null;

  const address = contact?.address || "Headquarters office, Klo Yaw Lay, Hpa An District, Kawthoolei";
  const phone = contact?.phone || "-";
  const email = contact?.email || "ktl1949@gmail.com";
  const officeHours = contact?.officeHours || "Monday to Friday, 9:00 AM - 5:00 PM";
  const websiteUrl = contact?.websiteUrl || "https://www.knuhq.org/departments/forestry";
  
  const headName = data.headMember ? `${data.headMember.firstName} ${data.headMember.lastName}` : (contact?.name || "P'doh Mahn Ba Tun");

  let socialLinks = { facebook: "https://facebook.com", twitter: "https://twitter.com", linkedin: "https://linkedin.com" };
  if (contact?.socialLinks && typeof contact.socialLinks === 'string') {
    try {
      socialLinks = { ...socialLinks, ...JSON.parse(contact.socialLinks) };
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
              <a href={socialLinks.facebook} className="flex flex-col items-center gap-2 group">
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center transform transition-transform group-hover:scale-110 shadow-sm">
                  <Facebook size={18} fill="currentColor" />
                </div>
                <span className="text-[10px] text-gray-600 font-medium">Facebook</span>
              </a>
              <a href={socialLinks.twitter} className="flex flex-col items-center gap-2 group">
                <div className="w-10 h-10 rounded-full bg-sky-500 text-white flex items-center justify-center transform transition-transform group-hover:scale-110 shadow-sm">
                  <Twitter size={18} fill="currentColor" />
                </div>
                <span className="text-[10px] text-gray-600 font-medium">Twitter</span>
              </a>
              <a href={socialLinks.linkedin} className="flex flex-col items-center gap-2 group">
                <div className="w-10 h-10 rounded-full bg-blue-700 text-white flex items-center justify-center transform transition-transform group-hover:scale-110 shadow-sm">
                  <Linkedin size={18} fill="currentColor" />
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
