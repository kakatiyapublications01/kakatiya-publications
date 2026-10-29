export interface NavItem {
  title: string;
  href: string;
  badge?: string;
}

export const siteConfig = {
  name: "KakatiyaPulse",
  shortName: "KakatiyaPulse",
  description:
    "A premier editorial and community publication dedicated to high-impact magazines, prestigious VVIP & VIP profiles, and influential stories.",
  url: "https://www.kakatiyapulse.com",
  contact: {
    email: "contact@kakatiyapulse.com",
    phone: "+91 98765 43210",
    address: "KakatiyaPulse Tower, Jubilee Hills, Hyderabad, Telangana",
  },
  mainNav: [
    { title: "Home", href: "/" },
    { title: "Magazines", href: "/magazines" },
    { title: "Stories & Messages", href: "/stories" },
    { title: "VVIP Spotlight", href: "/vvip", badge: "Prestige" },
    { title: "VIP Directory", href: "/vip" },
    { title: "About", href: "/about" },
    { title: "Contact", href: "/contact" },
  ] as NavItem[],
  socials: {
    facebook: "https://facebook.com",
    twitter: "https://x.com",
    instagram: "https://instagram.com",
    youtube: "https://youtube.com",
  },
};
