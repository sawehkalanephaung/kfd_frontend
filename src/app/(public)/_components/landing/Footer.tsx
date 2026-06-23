import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin, Phone, Mail, Clock } from "lucide-react";
import logoImg from "@/assets/logo-2.png";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaYoutube } from "react-icons/fa";

export default async function Footer() {
  let contactSettings: any = null;
  let socialMediaLinks: any[] = [];

  try {
    const [contactRes, socialRes] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/v1/public/contact-settings`, {
        cache: "no-store"
      }),
      fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/v1/public/social-media`, {
        cache: "no-store"
      })
    ]);

    if (contactRes.ok) contactSettings = await contactRes.json();
    if (socialRes.ok) socialMediaLinks = await socialRes.json();
  } catch (error) {
    console.error("Failed to fetch footer data", error);
  }

  const renderSocialIcon = (platform: string, size = 16) => {
    const p = platform.toLowerCase();
    if (p.includes('facebook')) return <FaFacebook size={size} />;
    if (p.includes('twitter') || p.includes('x')) return <FaTwitter size={size} />;
    if (p.includes('instagram')) return <FaInstagram size={size} />;
    if (p.includes('linkedin')) return <FaLinkedin size={size} />;
    if (p.includes('youtube')) return <FaYoutube size={size} />;
    return <FaFacebook size={size} />;
  };

  return (
    <footer className="bg-[#1a3626] text-white pt-16 pb-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-8 mb-16">

          {/* Brand & Description */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-3">
              <div className="relative w-12 h-12  p-1 flex-shrink-0">
                <Image
                  src={logoImg}
                  alt="KFD Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg leading-none tracking-tight">Kawthoolei Forestry Department</span>
              </div>
            </Link>
            <div className="flex flex-wrap items-center gap-4">
              {socialMediaLinks && socialMediaLinks.map((link) => (
                <a 
                  key={link.id} 
                  href={link.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                >
                  {renderSocialIcon(link.platformName)}
                </a>
              ))}
              {(!socialMediaLinks || socialMediaLinks.length === 0) && (
                <a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                  <FaFacebook size={16} />
                </a>
              )}
            </div>
            <div className="flex flex-col gap-5 text-sm text-green-100 pt-2">
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{contactSettings?.phoneNumbers?.[0] || "+66 123 456 789"}</span>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{contactSettings?.contactEmail || "info@kfd-kawthoolei.org"}</span>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed">{contactSettings?.physicalAddress || "KNU Headquarters"}</span>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed whitespace-pre-line">{contactSettings?.officeHours || "Monday - Friday:\n8:00 am - 5:00 pm"}</span>
              </div>
            </div>

            </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-lg mb-6">QUICK LINKS</h3>
            <ul className="space-y-4">
              <li><Link href="/" className="text-sm text-green-100 hover:text-white transition-colors">Home</Link></li>
              <li><Link href="/about" className="text-sm text-green-100 hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/departments" className="text-sm text-green-100 hover:text-white transition-colors">Departments</Link></li>
              <li><Link href="/news" className="text-sm text-green-100 hover:text-white transition-colors">News & Announcements</Link></li>
              <li><Link href="/resources" className="text-sm text-green-100 hover:text-white transition-colors">Resources</Link></li>
              <li><Link href="/contact" className="text-sm text-green-100 hover:text-white transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-bold text-lg mb-6">NEWSLETTER</h3>
            <p className="text-sm text-green-100 mb-4">
              Stay updated with the latest news, conservation efforts, and reports from KFD.
            </p>
            <form className="flex flex-col gap-3">
              <input
                type="email"
                placeholder="Your email address"
                className="w-full bg-white/10 border border-white/20 rounded-md px-4 py-2.5 text-sm text-white placeholder:text-green-200 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
                required
              />
              <button
                type="submit"
                className="w-full bg-[#2a563c] hover:bg-[#326949] text-white font-medium py-2.5 rounded-md flex items-center justify-center gap-2 transition-colors"
              >
                Subscribe <ArrowRight size={16} />
              </button>
            </form>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-green-200">
            © {new Date().getFullYear()} KFD. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="text-sm text-green-200 hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="text-sm text-green-200 hover:text-white transition-colors">Terms of Use</Link>
            <Link href="/accessibility" className="text-sm text-green-200 hover:text-white transition-colors">Accessibility</Link>
            <Link href="/contact" className="text-sm text-green-200 hover:text-white transition-colors">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
