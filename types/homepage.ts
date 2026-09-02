export interface TemporaryTravelImage {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export interface JourneyPreview {
  slug: string;
  title: string;
  location: string;
  travelDates: string;
  excerpt: string;
  coverImage: TemporaryTravelImage;
}

export interface HomePageFixture {
  heroPills: [string, string];
  heroPhotos: TemporaryTravelImage[];
  featuredJourney: JourneyPreview;
  recentJourneys: [JourneyPreview, JourneyPreview, JourneyPreview];
}
