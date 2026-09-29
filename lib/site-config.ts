export const SITE_CONFIG = {
  name: "POLARIUM",
  description: "National Polar Knowledge Platform & Research Portal",
  logo: {
    src: "/polarium-logo.png",
    alt: "POLARIUM National Polar Knowledge Platform Logo",
    width: 220,
    height: 56,
  },
  organization: {
    emblem: {
      en: "State Emblem of India",
      hi: "भारत का राज्य प्रतीक",
    },
    ministry: {
      en: "Ministry of Earth Sciences",
      hi: "पृथ्वी विज्ञान मंत्रालय (MoES)",
    },
    centre: {
      en: "National Centre for Polar and Ocean Research (NCPOR)",
      hi: "राष्ट्रीय ध्रुवीय एवं महासागर अनुसंधान केंद्र (NCPOR)",
    },
  },
  navLinks: [
    { id: "home", href: "/", en: "Home", hi: "मुख्य पृष्ठ" },
    { id: "repository", href: "/knowledge-repository", en: "Knowledge Repository", hi: "ज्ञान भण्डार" },
    { id: "media", href: "/media-gallery", en: "Media Gallery", hi: "मीडिया गैलरी" },
    { id: "polarhub", href: "/polar-hub", en: "Polar Hub", hi: "ध्रुवीय हब" },
  ],
  adminPortal: {
    href: "/Admin-Dashboard",
    en: "Admin Portal",
    hi: "प्रशासन पोर्टल",
  },
};
