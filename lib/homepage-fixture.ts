import type { HomePageFixture } from "@/types/homepage";

const lisbonImage = {
  src: "/images/temp-lisbon-tram.svg",
  alt: "Temporary Lisbon street tram photo placeholder that will be replaced with Rachel's own image",
  width: 900,
  height: 1125,
};

const kyotoImage = {
  src: "/images/temp-kyoto-lanterns.svg",
  alt: "Temporary Kyoto night lantern photo placeholder that will be replaced with Rachel's own image",
  width: 900,
  height: 1125,
};

const patagoniaImage = {
  src: "/images/temp-patagonia-peaks.svg",
  alt: "Temporary Patagonia mountain ridge photo placeholder that will be replaced with Rachel's own image",
  width: 900,
  height: 1125,
};

const marrakeshImage = {
  src: "/images/temp-marrakesh-market.svg",
  alt: "Temporary Marrakesh market photo placeholder that will be replaced with Rachel's own image",
  width: 900,
  height: 1125,
};

const heroCoastPhoto = {
  src: "/images/temp-hero-coast-photo.jpg",
  alt: "Temporary coastal cliff travel photo placeholder that will be replaced with Rachel's own image",
  width: 900,
  height: 1125,
};

const heroRidgePhoto = {
  src: "/images/temp-hero-ridge-photo.jpg",
  alt: "Temporary mountain ridge travel photo placeholder that will be replaced with Rachel's own image",
  width: 900,
  height: 1125,
};

export const homePageFixture: HomePageFixture = {
  heroPills: ["Travel stories & photographs", "Notes from places near and far"],
  heroPhotos: [heroCoastPhoto, heroRidgePhoto],
  mostRecentTrip: {
    slug: "coastal-trains-through-portugal",
    title: "Coastal Trains Through Portugal",
    location: "Lisbon, Cascais, and Porto, Portugal",
    travelDates: "March–April 2026",
    excerpt:
      "A week of train windows, tiled stations, and Atlantic light—following small detours from Lisbon to Porto through seaside platforms and late-market dinners.",
    coverImage: lisbonImage,
  },
  recentTrips: [
    {
      slug: "quiet-mornings-in-kyoto",
      title: "Quiet Mornings in Kyoto",
      location: "Kyoto, Japan",
      travelDates: "November 2025",
      excerpt:
        "Temple paths before sunrise, tiny coffee counters, and the rhythm of side streets lit by paper lanterns.",
      coverImage: kyotoImage,
    },
    {
      slug: "wind-and-stone-in-patagonia",
      title: "Wind and Stone in Patagonia",
      location: "El Chaltén, Argentina",
      travelDates: "January 2026",
      excerpt:
        "Three days of glacier trails and changing weather, with long pauses to photograph cloud shadows sweeping over granite peaks.",
      coverImage: patagoniaImage,
    },
    {
      slug: "courtyard-notes-from-marrakesh",
      title: "Courtyard Notes from Marrakesh",
      location: "Marrakesh, Morocco",
      travelDates: "May 2026",
      excerpt:
        "Walled gardens, evening calls to prayer, and handwritten observations from riad courtyards and market lanes.",
      coverImage: marrakeshImage,
    },
  ],
};
