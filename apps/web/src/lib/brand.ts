export type HexColor = string;

export type BrandColors = {
  readonly primaryColor: HexColor;
  readonly secondaryColor: HexColor;
  readonly accentColor: HexColor;
  readonly textColor: HexColor;
};

export type LogoVariant = 'full' | 'mini' | 'icon' | 'mark' | 'primary' | 'alternate';
export type AssetKind = 'logo' | 'mark' | 'banner' | 'hero';

export interface BrandAsset {
  readonly id: string;
  readonly kind: AssetKind;
  readonly variant: LogoVariant;
  readonly filePath: string;
  readonly altText: string;
  readonly width?: number;
  readonly height?: number;
  readonly isPrimary?: boolean;
  readonly isActive: boolean;
}

export interface LeagueBrand {
  readonly id: string;
  readonly organizationId: string;
  readonly name: string;
  readonly shortName: string;
  readonly colors: BrandColors;
  readonly assets: readonly BrandAsset[];
}

export interface TeamBrand {
  readonly id: string;
  readonly organizationId: string;
  readonly name: string;
  readonly shortName: string;
  readonly colors: BrandColors;
  readonly assets: readonly BrandAsset[];
}

export interface SponsorBrand {
  readonly id: string;
  readonly organizationId: string;
  readonly name: string;
  readonly websiteUrl?: string;
  readonly colors: BrandColors;
  readonly assets: readonly BrandAsset[];
  readonly isFeatured: boolean;
  readonly sponsorTier: 'title' | 'featured' | 'supporting';
}

export interface BrandUsageRule {
  readonly context:
    | 'landing-page-header'
    | 'league-header'
    | 'team-card'
    | 'standings-row'
    | 'avatar'
    | 'sponsor-banner'
    | 'matchup-card';
  readonly preferredVariant: 'full' | 'mini' | 'icon' | 'mark';
  readonly preferredAspect: 'horizontal' | 'square';
}

export const brandUsageRules: readonly BrandUsageRule[] = [
  { context: 'landing-page-header', preferredVariant: 'full', preferredAspect: 'horizontal' },
  { context: 'league-header', preferredVariant: 'full', preferredAspect: 'horizontal' },
  { context: 'team-card', preferredVariant: 'full', preferredAspect: 'horizontal' },
  { context: 'standings-row', preferredVariant: 'mini', preferredAspect: 'horizontal' },
  { context: 'avatar', preferredVariant: 'icon', preferredAspect: 'square' },
  { context: 'sponsor-banner', preferredVariant: 'full', preferredAspect: 'horizontal' },
  { context: 'matchup-card', preferredVariant: 'mini', preferredAspect: 'horizontal' }
];
