import type { Metadata } from "next";
import NotFoundContent from "./_components/NotFoundContent";

export const metadata: Metadata = { title: "Page not found" };

/** `notFound()` called inside a public page - already inside the public layout. */
export default function PublicNotFound() {
  return <NotFoundContent />;
}
