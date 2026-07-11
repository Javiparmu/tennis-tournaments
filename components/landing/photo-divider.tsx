import Image from "next/image";
import courtLineBall from "@/public/landing/court-line-ball.webp";

// Full-bleed photographic breather between the light bento and the sections
// below — purely decorative, so the image carries an empty alt.
export function PhotoDivider() {
  return (
    <div aria-hidden className="relative h-48 w-full overflow-hidden md:h-64">
      <Image src={courtLineBall} alt="" fill placeholder="blur" sizes="100vw" className="object-cover" />
    </div>
  );
}
