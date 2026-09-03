export interface TemporaryTravelImage {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export interface TripPreview {
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
  mostRecentTrip: TripPreview;
  recentTrips: [TripPreview, TripPreview, TripPreview];
}
