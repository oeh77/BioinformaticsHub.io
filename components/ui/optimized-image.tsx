"use client";

/**
 * Optimized Image Component
 * 
 * Production-ready image component with:
 * - Lazy loading with blur placeholder
 * - Responsive srcset
 * - WebP format support
 * - Proper aspect ratio to prevent CLS
 */

import Image, { ImageProps } from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface OptimizedImageProps extends Omit<ImageProps, "onError"> {
  fallbackSrc?: string;
  aspectRatio?: "square" | "video" | "wide" | "auto";
  showPlaceholder?: boolean;
}

const aspectRatioClasses = {
  square: "aspect-square",
  video: "aspect-video",
  wide: "aspect-[21/9]",
  auto: "",
};

export function OptimizedImage({
  src,
  alt,
  fallbackSrc = "/images/placeholder.svg",
  aspectRatio = "auto",
  showPlaceholder = true,
  className,
  ...props
}: OptimizedImageProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(fallbackSrc);
    }
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-muted",
        aspectRatioClasses[aspectRatio],
        className
      )}
    >
      {/* Loading skeleton */}
      {isLoading && showPlaceholder && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-muted via-muted-foreground/10 to-muted" />
      )}

      <Image
        {...props}
        src={imgSrc}
        alt={alt}
        className={cn(
          "object-cover transition-opacity duration-300",
          isLoading ? "opacity-0" : "opacity-100"
        )}
        onError={handleError}
        onLoad={handleLoad}
        loading="lazy"
        quality={85}
      />
    </div>
  );
}

/**
 * Hero Image with priority loading
 */
export function HeroImage({
  src,
  alt,
  className,
  ...props
}: Omit<OptimizedImageProps, "priority">) {
  return (
    <OptimizedImage
      {...props}
      src={src}
      alt={alt}
      className={className}
      priority
      showPlaceholder={false}
      loading="eager"
    />
  );
}

/**
 * Avatar Image with fallback initials
 */
export function AvatarImage({
  src,
  alt,
  size = 40,
  fallbackInitials,
  className,
}: {
  src?: string | null;
  alt: string;
  size?: number;
  fallbackInitials?: string;
  className?: string;
}) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    const initials = fallbackInitials || alt.charAt(0).toUpperCase();
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-full bg-primary text-primary-foreground font-medium",
          className
        )}
        style={{ width: size, height: size, fontSize: size * 0.4 }}
      >
        {initials}
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={cn("rounded-full object-cover", className)}
      onError={() => setHasError(true)}
    />
  );
}
