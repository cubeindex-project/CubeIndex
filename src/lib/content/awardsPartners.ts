/**
 * A logo used to visually identify an awards partner.
 */
export interface AwardsPartnerLogo {
  src: string;
  alt: string;
}

/**
 * A partner showcased on the CubeIndex Awards page.
 */
export interface AwardsPartner {
  name: string;
  description: string;
  url?: string;
  logo?: AwardsPartnerLogo;
}

export const AWARDS_PARTNERS: AwardsPartner[] = [
  {
    name: "acubemy",
    description: "Level up your cubing",
    url: "https://acubemy.com/r/cubeindex",
    logo: {
      src: "/partners-logo/acubemy_logo.svg",
      alt: "acubemy Logo",
    },
  },
  {
    name: "CubingPanda",
    description: "The friendliest online cubing community",
    url: "https://discord.gg/VHhYR6nyzs",
    logo: {
      src: "/partners-logo/cubingpanda_logo.webp",
      alt: "CubingPanda Logo",
    },
  },
];
