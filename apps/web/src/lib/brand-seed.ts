import type { LeagueBrand, SponsorBrand, TeamBrand } from './brand';

export const leagueBrandSeed: LeagueBrand = {
  id: 'league-fli-golf',
  organizationId: 'fgl',
  name: 'FLI Golf League',
  shortName: 'FLI',
  colors: {
    primaryColor: '#0f172a',
    secondaryColor: '#0ea5e9',
    accentColor: '#f59e0b',
    textColor: '#f8fafc'
  },
  assets: [
    {
      id: 'league-full-logo',
      kind: 'logo',
      variant: 'full',
      filePath: '/brand/fli_logo.png',
      altText: 'FLI Golf League shield logo',
      width: 640,
      height: 220,
      isPrimary: true,
      isActive: true
    },
    {
      id: 'league-mini-logo',
      kind: 'logo',
      variant: 'mini',
      filePath: '/brand/fli_logo.png',
      altText: 'FLI Golf League shield logo',
      width: 220,
      height: 80,
      isPrimary: false,
      isActive: true
    },
    {
      id: 'league-mark',
      kind: 'mark',
      variant: 'mark',
      filePath: '/brand/fli_logo.png',
      altText: 'FLI Golf League shield mark',
      width: 200,
      height: 200,
      isPrimary: false,
      isActive: true
    }
  ]
};

export const teamBrandSeed: readonly TeamBrand[] = [
  {
    id: 'team-huk-a-mania',
    organizationId: 'fgl',
    name: 'Huk A Mania',
    shortName: 'HUK',
    colors: {
      primaryColor: '#0f172a',
      secondaryColor: '#f8fafc',
      accentColor: '#f59e0b',
      textColor: '#ffffff'
    },
    assets: [
      {
        id: 'team-huk-a-mania-full',
        kind: 'logo',
        variant: 'full',
        filePath: '/brand/huk_a_mania_regular_sxes4d19q0.png',
        altText: 'Huk A Mania regular logo',
        width: 420,
        height: 160,
        isPrimary: true,
        isActive: true
      },
      {
        id: 'team-huk-a-mania-mini',
        kind: 'logo',
        variant: 'mini',
        filePath: '/brand/huk_a_mania_mini_vodl4e5l5d.png',
        altText: 'Huk A Mania mini logo',
        width: 180,
        height: 80,
        isActive: true
      }
    ]
  },
  {
    id: 'team-hyzer-heroes',
    organizationId: 'fgl',
    name: 'Hyzer Heroes',
    shortName: 'HZZ',
    colors: {
      primaryColor: '#123c30',
      secondaryColor: '#dff7d8',
      accentColor: '#56c596',
      textColor: '#f8fafc'
    },
    assets: [
      {
        id: 'team-hyzer-heroes-full',
        kind: 'logo',
        variant: 'full',
        filePath: '/brand/hyzer_heroes_regular_lbgsqscswl.png',
        altText: 'Hyzer Heroes regular logo',
        width: 420,
        height: 160,
        isPrimary: true,
        isActive: true
      },
      {
        id: 'team-hyzer-heroes-mini',
        kind: 'logo',
        variant: 'mini',
        filePath: '/brand/hyzer_heroes_mini_o02iyinjze.png',
        altText: 'Hyzer Heroes mini logo',
        width: 180,
        height: 80,
        isActive: true
      }
    ]
  },
  {
    id: 'team-birdie-storm',
    organizationId: 'fgl',
    name: 'Birdie Storm',
    shortName: 'BST',
    colors: {
      primaryColor: '#2147a8',
      secondaryColor: '#dfeeff',
      accentColor: '#7dd3fc',
      textColor: '#eff6ff'
    },
    assets: [
      {
        id: 'team-birdie-storm-full',
        kind: 'logo',
        variant: 'full',
        filePath: '/brand/birdie_storm_regular_5841iuf45s.png',
        altText: 'Birdie Storm regular logo',
        width: 420,
        height: 160,
        isPrimary: true,
        isActive: true
      },
      {
        id: 'team-birdie-storm-mini',
        kind: 'logo',
        variant: 'mini',
        filePath: '/brand/birdie_storm_mini_01_pkgmimvsue.jpg',
        altText: 'Birdie Storm mini logo',
        width: 180,
        height: 80,
        isActive: true
      }
    ]
  },
  {
    id: 'team-flight-squad',
    organizationId: 'fgl',
    name: 'Flight Squad',
    shortName: 'FLT',
    colors: {
      primaryColor: '#4c1d95',
      secondaryColor: '#efe2ff',
      accentColor: '#f59e0b',
      textColor: '#f5f3ff'
    },
    assets: [
      {
        id: 'team-flight-squad-full',
        kind: 'logo',
        variant: 'full',
        filePath: '/brand/flight_squad_regular_b1a964261g.png',
        altText: 'Flight Squad regular logo',
        width: 420,
        height: 160,
        isPrimary: true,
        isActive: true
      },
      {
        id: 'team-flight-squad-mini',
        kind: 'logo',
        variant: 'mini',
        filePath: '/brand/flight_squad_mini_xwbc7tot75.png',
        altText: 'Flight Squad mini logo',
        width: 180,
        height: 80,
        isActive: true
      }
    ]
  },
  {
    id: 'team-ace-makers',
    organizationId: 'fgl',
    name: 'Ace Makers',
    shortName: 'ACE',
    colors: {
      primaryColor: '#0f766e',
      secondaryColor: '#d8fff4',
      accentColor: '#fbbf24',
      textColor: '#ecfeff'
    },
    assets: [
      {
        id: 'team-ace-makers-full',
        kind: 'logo',
        variant: 'full',
        filePath: '/brand/ace_makers_logo_1senu6r6ys.png',
        altText: 'Ace Makers regular logo',
        width: 420,
        height: 160,
        isPrimary: true,
        isActive: true
      },
      {
        id: 'team-ace-makers-mini',
        kind: 'logo',
        variant: 'mini',
        filePath: '/brand/ace_makers_mini_logo_01_g5k7hn184e.jpg',
        altText: 'Ace Makers mini logo',
        width: 180,
        height: 80,
        isActive: true
      }
    ]
  },
  {
    id: 'team-chain-breakers',
    organizationId: 'fgl',
    name: 'Chain Breakers',
    shortName: 'CBR',
    colors: {
      primaryColor: '#7f1d1d',
      secondaryColor: '#ffe6d4',
      accentColor: '#f59e0b',
      textColor: '#fff1f2'
    },
    assets: [
      {
        id: 'team-chain-breakers-full',
        kind: 'logo',
        variant: 'full',
        filePath: '/brand/chain_breakers_regular_01_4ticluji4m.jpg',
        altText: 'Chain Breakers regular logo',
        width: 420,
        height: 160,
        isPrimary: true,
        isActive: true
      },
      {
        id: 'team-chain-breakers-mini',
        kind: 'logo',
        variant: 'mini',
        filePath: '/brand/chain_breakers_mini_01_eovjjz2ezu.jpg',
        altText: 'Chain Breakers mini logo',
        width: 180,
        height: 80,
        isActive: true
      }
    ]
  },
  {
    id: 'team-chain-seekers',
    organizationId: 'fgl',
    name: 'Chain Seekers',
    shortName: 'CSE',
    colors: {
      primaryColor: '#122d3b',
      secondaryColor: '#d8f6f2',
      accentColor: '#0ea5a4',
      textColor: '#f8fafc'
    },
    assets: [
      {
        id: 'team-chain-seekers-full',
        kind: 'logo',
        variant: 'full',
        filePath: '/brand/chain_seekers_regular_wia510laxq.png',
        altText: 'Chain Seekers regular logo',
        width: 420,
        height: 160,
        isPrimary: true,
        isActive: true
      },
      {
        id: 'team-chain-seekers-mini',
        kind: 'logo',
        variant: 'mini',
        filePath: '/brand/chain_seekers_mini_01_ebssfkymie.jpg',
        altText: 'Chain Seekers mini logo',
        width: 180,
        height: 80,
        isActive: true
      }
    ]
  },
  {
    id: 'team-disc-dynasty',
    organizationId: 'fgl',
    name: 'Disc Dynasty',
    shortName: 'DDY',
    colors: {
      primaryColor: '#0b1f3a',
      secondaryColor: '#dbeafe',
      accentColor: '#38bdf8',
      textColor: '#f8fafc'
    },
    assets: [
      {
        id: 'team-disc-dynasty-full',
        kind: 'logo',
        variant: 'full',
        filePath: '/brand/disc_dynasty_regular_kgg3frih96.png',
        altText: 'Disc Dynasty regular logo',
        width: 420,
        height: 160,
        isPrimary: true,
        isActive: true
      },
      {
        id: 'team-disc-dynasty-mini',
        kind: 'logo',
        variant: 'mini',
        filePath: '/brand/disc_dynasty_mini_01_2heq2mflds.jpg',
        altText: 'Disc Dynasty mini logo',
        width: 180,
        height: 80,
        isActive: true
      }
    ]
  },
  {
    id: 'team-disk-jesters',
    organizationId: 'fgl',
    name: 'Disk Jesters',
    shortName: 'DJS',
    colors: {
      primaryColor: '#9a4d00',
      secondaryColor: '#fff0c2',
      accentColor: '#f59e0b',
      textColor: '#fff7ed'
    },
    assets: [
      {
        id: 'team-disk-jesters-full',
        kind: 'logo',
        variant: 'full',
        filePath: '/brand/disk_jesters_regular_kc0dr9tj3m.png',
        altText: 'Disk Jesters regular logo',
        width: 420,
        height: 160,
        isPrimary: true,
        isActive: true
      },
      {
        id: 'team-disk-jesters-mini',
        kind: 'logo',
        variant: 'mini',
        filePath: '/brand/disk_jesters_mini_ll9ttpclk3.png',
        altText: 'Disk Jesters mini logo',
        width: 180,
        height: 80,
        isActive: true
      }
    ]
  },
  {
    id: 'team-fair-way-bombers',
    organizationId: 'fgl',
    name: 'Fair Way Bombers',
    shortName: 'FWB',
    colors: {
      primaryColor: '#7c2d12',
      secondaryColor: '#fde6c5',
      accentColor: '#d97706',
      textColor: '#fff7ed'
    },
    assets: [
      {
        id: 'team-fair-way-bombers-full',
        kind: 'logo',
        variant: 'full',
        filePath: '/brand/fair_way_bombers_regular_554f42bm1y.png',
        altText: 'Fair Way Bombers regular logo',
        width: 420,
        height: 160,
        isPrimary: true,
        isActive: true
      },
      {
        id: 'team-fair-way-bombers-mini',
        kind: 'logo',
        variant: 'mini',
        filePath: '/brand/fair_way_bombers_mini_8k4kmyawb1.png',
        altText: 'Fair Way Bombers mini logo',
        width: 180,
        height: 80,
        isActive: true
      }
    ]
  },
  {
    id: 'team-glide-masters',
    organizationId: 'fgl',
    name: 'Glide Masters',
    shortName: 'GLI',
    colors: {
      primaryColor: '#0f5c52',
      secondaryColor: '#dffaf3',
      accentColor: '#22d3ee',
      textColor: '#ecfeff'
    },
    assets: [
      {
        id: 'team-glide-masters-full',
        kind: 'logo',
        variant: 'full',
        filePath: '/brand/glide_masters_regular_na03isgvfr.png',
        altText: 'Glide Masters regular logo',
        width: 420,
        height: 160,
        isPrimary: true,
        isActive: true
      },
      {
        id: 'team-glide-masters-mini',
        kind: 'logo',
        variant: 'mini',
        filePath: '/brand/glide_masters_miini_9jiee04jq3.png',
        altText: 'Glide Masters mini logo',
        width: 180,
        height: 80,
        isActive: true
      }
    ]
  },
  {
    id: 'team-midas-touch',
    organizationId: 'fgl',
    name: 'Midas Touch',
    shortName: 'MID',
    colors: {
      primaryColor: '#111827',
      secondaryColor: '#fef1a8',
      accentColor: '#fbbf24',
      textColor: '#fffbeb'
    },
    assets: [
      {
        id: 'team-midas-touch-full',
        kind: 'logo',
        variant: 'full',
        filePath: '/brand/midas_touch_regular_ovaulfpg79.png',
        altText: 'Midas Touch regular logo',
        width: 420,
        height: 160,
        isPrimary: true,
        isActive: true
      },
      {
        id: 'team-midas-touch-mini',
        kind: 'logo',
        variant: 'mini',
        filePath: '/brand/midas_touch_mini_eqgncmsn7n.png',
        altText: 'Midas Touch mini logo',
        width: 180,
        height: 80,
        isActive: true
      }
    ]
  }
];

export const sponsorBrandSeed: readonly SponsorBrand[] = [
  {
    id: 'badge-fli-golf',
    organizationId: 'fgl',
    name: 'FLI Golf Tournament Badge',
    websiteUrl: 'https://example.com',
    colors: {
      primaryColor: '#0f172a',
      secondaryColor: '#f8fafc',
      accentColor: '#f59e0b',
      textColor: '#ffffff'
    },
    assets: [
      {
        id: 'badge-fli-golf-full',
        kind: 'logo',
        variant: 'full',
        filePath: '/brand/fliGolf_rwb_1.png',
        altText: 'FLI Golf tournament badge',
        width: 420,
        height: 140,
        isPrimary: true,
        isActive: true
      },
      {
        id: 'badge-fli-golf-mini',
        kind: 'logo',
        variant: 'mini',
        filePath: '/brand/fliGolf_rwb_1.png',
        altText: 'FLI Golf tournament badge',
        width: 180,
        height: 60,
        isActive: true
      }
    ],
    isFeatured: true,
    sponsorTier: 'featured'
  }
];
