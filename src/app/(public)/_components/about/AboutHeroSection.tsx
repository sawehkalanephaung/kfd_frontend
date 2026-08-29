import { getMediaUrl } from "@/lib/api";
import { PageHero } from "@/components/ui/page-hero";

export default function AboutHeroSection({
  title,
  tagline,
  bgImage
}: {
  title?: string,
  tagline?: string,
  bgImage?: string
}) {
  const displayImage = bgImage ? getMediaUrl(bgImage) : null;
  const sanitizedTagline = tagline ? tagline.replace(/&nbsp;/ig, ' ') : '';

  return (
    <PageHero
      title={title || "About KFD"}
      titleHtml={title || "About KFD"}
      subtitleHtml={sanitizedTagline || undefined}
      align="left"
      imageUrl={displayImage}
    />
  );
}
