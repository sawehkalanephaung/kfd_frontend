import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Source_Code_Pro } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "react-hot-toast";
import { getSiteIdentity } from "@/lib/site-identity";

const jakartaSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const sourceCodePro = Source_Code_Pro({
  variable: "--font-source-code",
  subsets: ["latin"],
  weight: ["400", "500"],
});

/**
 * Site-wide metadata.
 *
 * The organization name is read from the admin-managed site identity so a rename
 * reaches the browser tab and social cards without a code change. Descriptions
 * and keywords stay as authored copy — they are editorial, not branding.
 */
export async function generateMetadata(): Promise<Metadata> {
  const { organizationName } = await getSiteIdentity();

  return {
    title: {
      default: organizationName,
      template: `%s | ${organizationName}`,
    },
    description: "The Kawthoolei Forest Department safeguards the interconnected webs of biodiversity and communities through conservation, enforcement, and community partnership.",
    keywords: ["Kawthoolei", "Forestry Department", "Conservation", "Environment", "Karen", "KFD"],
    openGraph: {
      title: organizationName,
      description: "Safeguarding biodiversity and communities through conservation, enforcement, and community partnership.",
      url: "https://kfd-kawthoolei.org",
      siteName: organizationName,
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: organizationName,
      description: "Safeguarding biodiversity and communities through conservation, enforcement, and community partnership.",
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${jakartaSans.variable} ${sourceCodePro.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-canvas text-ink transition-colors" suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster 
            position="top-center" 
            toastOptions={{ 
              duration: 4000,
              className: 'z-[99999]'
            }} 
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
