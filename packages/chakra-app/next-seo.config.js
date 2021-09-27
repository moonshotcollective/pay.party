/** @type {import('next-seo').DefaultSeoProps} */
const defaultSEOConfig = {
  title: "Quadratic Diplomacy",
  titleTemplate: "%s | Quadratic Diplomacy",
  defaultTitle: "Quadratic Diplomacy",
  description:
    "Distribute tokens among your team members based on quadratic voting.",
  canonical: "https://quadraticdiplomacy.com",
  openGraph: {
    url: "https://quadraticdiplomacy.com",
    title: "Quadratic Diplomacy",
    description:
      "Distribute tokens among your team members based on quadratic voting.",
    //TODO: replace with qd image
    images: [
      {
        url: "",
        alt: "quadraticdiplomacy.com og-image",
      },
    ],
    site_name: "Quadratic Diplomacy",
  },
  twitter: {
    handle: "@moonshotcollect",
    cardType: "summary_large_image",
  },
};

export default defaultSEOConfig;
