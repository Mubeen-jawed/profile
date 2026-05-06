import Image from "next/image";

interface BrandLogoMarkProps {
  className?: string;
  iconClassName?: string;
}

export default function BrandLogoMark({
  className = "h-8 w-8 rounded-lg",
  iconClassName = "object-contain",
}: BrandLogoMarkProps) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <Image
        src="/logo.png"
        alt="redditprofile logo"
        fill
        sizes="(max-width: 768px) 24px, 32px"
        className={iconClassName}
      />
    </div>
  );
}
