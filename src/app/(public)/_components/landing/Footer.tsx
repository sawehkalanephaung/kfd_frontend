import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin, Phone, Mail, Clock } from "lucide-react";
import logoImg from "@/assets/logo-2.png";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaYoutube } from "react-icons/fa";
import NewsletterForm from "./NewsletterForm";
import { getSiteIdentity } from "@/lib/site-identity";

export default async function Footer() {
  const { organizationName, organizationNameKaren, footerCopyright, resolvedLogoUrl } = await getSiteIdentity();
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
    <footer className="bg-teal-deep text-white pt-16 pb-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-8 mb-16">

          {/* Brand & Description */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-3">
              <div className="relative w-12 h-12  p-1 flex-shrink-0">
                {resolvedLogoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={resolvedLogoUrl}
                    alt={`${organizationName} Logo`}
                    className="absolute inset-0 w-full h-full object-contain"
                  />
                ) : (
                  <Image
                    src={logoImg}
                    alt={`${organizationName} Logo`}
                    fill
                    sizes="48px"
                    className="object-contain"
                  />
                )}
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-bold text-lg leading-tight tracking-tight text-white">{organizationName}</span>
                {organizationNameKaren && (
                  <span lang="ksw" className="font-medium mt-1 mb-1 text-sm text-white">{organizationNameKaren}</span>
                )}
              </div>
            </Link>
            {socialMediaLinks && socialMediaLinks.length > 0 && (
              <div className="flex flex-wrap items-center gap-4">
                {socialMediaLinks.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Visit our ${link.platformName} page`}
                    className="w-8 h-8 rounded-full bg-canvas/10 flex items-center justify-center hover:bg-canvas/20 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-canvas/60"
                  >
                    {renderSocialIcon(link.platformName)}
                  </a>
                ))}
              </div>
            )}
            {(contactSettings?.phoneNumbers?.[0] || contactSettings?.contactEmail || contactSettings?.physicalAddress || contactSettings?.officeHours) && (
              <div className="flex flex-col gap-5 text-sm text-on-dark-muted pt-2">
                {contactSettings?.phoneNumbers?.[0] && (
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span>{contactSettings.phoneNumbers[0]}</span>
                  </div>
                )}
                {contactSettings?.contactEmail && (
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span>{contactSettings.contactEmail}</span>
                  </div>
                )}
                {contactSettings?.physicalAddress && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{contactSettings.physicalAddress}</span>
                  </div>
                )}
                {contactSettings?.officeHours && (
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span className="leading-relaxed whitespace-pre-line">{contactSettings.officeHours}</span>
                  </div>
                )}
              </div>
            )}

          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-lg mb-6">QUICK LINKS</h3>
            <ul className="space-y-4">
              <li><Link href="/" className="interactive-link-dark text-sm">Home</Link></li>
              <li><Link href="/about" className="interactive-link-dark text-sm">About Us</Link></li>
              <li><Link href="/departments" className="interactive-link-dark text-sm">Department Branches</Link></li>
              <li><Link href="/news" className="interactive-link-dark text-sm">News & Announcements</Link></li>
              <li><Link href="/resources" className="interactive-link-dark text-sm">Resources</Link></li>
              <li><Link href="/contact" className="interactive-link-dark text-sm">Contact Us</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-bold text-lg mb-6">NEWSLETTER</h3>
            <p className="text-sm text-on-dark-muted mb-4">
              Stay updated with the latest news, conservation efforts, and reports from KFD.
            </p>
            <NewsletterForm />
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <p className="text-sm text-on-dark-muted">
            {footerCopyright
              || `Copyright © ${new Date().getFullYear()} ${organizationName}, All rights reserved.`}
          </p>
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-x-6 gap-y-3">
            <Link href="/privacy-policy" className="interactive-link-dark text-sm py-2 md:py-0">Privacy Policy</Link>
            <Link href="/terms-of-use" className="interactive-link-dark text-sm py-2 md:py-0">Terms of Use</Link>
            <Link href="/accessibility" className="interactive-link-dark text-sm py-2 md:py-0">Accessibility</Link>
            <Link href="/contact" className="interactive-link-dark text-sm py-2 md:py-0">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
