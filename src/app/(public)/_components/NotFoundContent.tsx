import Link from "next/link";
import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";

const SUGGESTIONS = [
  { href: "/news", label: "News & Announcements" },
  { href: "/departments", label: "Department Branches" },
  { href: "/resources", label: "Publications" },
  { href: "/contact", label: "Contact us" },
];

/**
 * Body of the public 404 page. Plain-language, says what happened, and
 * offers ways forward - a citizen who follows an old or mistyped link should
 * never be left at a dead end.
 */
export default function NotFoundContent() {
  return (
    <div className="min-h-[60vh] bg-canvas flex items-center justify-center px-4 py-20">
      <div className="max-w-lg w-full text-center">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-surface-feature">
          <SearchX className="h-7 w-7 text-brand-green-dark" aria-hidden="true" />
        </div>

        <p className="text-sm font-semibold text-steel mb-2">Error 404</p>
        <h1 className="text-2xl sm:text-3xl font-bold text-ink mb-3 text-balance">
          We couldn&apos;t find that page
        </h1>
        <p className="text-slate leading-relaxed mb-8">
          The page may have moved, been removed, or the address may have been typed
          incorrectly. Check the address, or use one of the links below.
        </p>

        <Button href="/">Back to home</Button>

        <nav aria-label="Helpful pages" className="mt-10 border-t border-hairline pt-6">
          <p className="text-sm font-semibold text-ink mb-3">Looking for something else?</p>
          <ul className="flex flex-wrap justify-center gap-x-6 gap-y-1">
            {SUGGESTIONS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="inline-block py-2 pointer-coarse:py-3 text-sm font-medium text-brand-green-dark underline underline-offset-4 hover:no-underline rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}
