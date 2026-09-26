import type { LeagueBrand, TeamBrand } from '@/lib/brand.js';

export type BrandRecord = LeagueBrand | TeamBrand;

export function BrandLogo({
  brand,
  variant = 'full',
  className,
  imgClassName,
  fallbackText
}: {
  readonly brand: BrandRecord;
  readonly variant?: 'full' | 'mini' | 'mark' | 'primary' | 'alternate';
  readonly className?: string;
  readonly imgClassName?: string;
  readonly fallbackText?: string;
}) {
  const asset =
    brand.assets.find((item) => item.variant === variant && item.isActive) ??
    brand.assets.find((item) => item.isPrimary && item.isActive) ??
    brand.assets[0];

  if (asset === undefined) {
    return fallbackText !== undefined ? (
      <span className={className}>{fallbackText}</span>
    ) : null;
  }

  return (
    <div className={className ?? 'flex items-center justify-center'}>
      <img
        src={asset.filePath}
        alt={asset.altText}
        className={imgClassName ?? 'h-10 w-auto object-contain'}
      />
    </div>
  );
}
