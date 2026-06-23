import Link from "next/link";
import { Trees, ArrowRight } from "lucide-react";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaYoutube } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-[#1a3626] text-white pt-16 pb-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-8 mb-16">
          
          {/* Brand & Description */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-3">
              <div className="bg-white text-[#1a3626] p-2 rounded-md">
                <Trees size={24} />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg leading-none tracking-tight">Kawthoolei Forestry Department</span>
                <span className="text-xs text-green-100 font-medium">Protecting Nature, Empowering Communities</span>
              </div>
            </Link>
            <p className="text-sm text-green-100 leading-relaxed max-w-xs">
              Dedicated to the protection, sustainable management, and flourishing of Kawthoolei's forests and biodiversity.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                <FaFacebook size={16} />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                <FaTwitter size={16} />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                <FaInstagram size={16} />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                <FaLinkedin size={16} />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                <FaYoutube size={16} />
              </a>
            </div>
            <div className="text-sm text-green-100 space-y-2 pt-2">
              <p>📍 KNU Headquarters</p>
              <p>📞 +66 123 456 789</p>
              <p>✉️ info@kfd-kawthoolei.org</p>
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
