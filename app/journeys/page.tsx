import { AccentPill } from "@/components/ui/accent-pill";
import { ContentContainer } from "@/components/ui/content-container";
import { SectionHeading } from "@/components/ui/section-heading";

export default function JourneysPage() {
  return (
    <main className="py-12 sm:py-16">
      <ContentContainer className="space-y-6">
        <AccentPill tone="blue">Journeys</AccentPill>
        <SectionHeading eyebrow="Stories by destination" title="Travel notes in progress" />
        <p className="max-w-2xl text-[var(--color-muted)]">
          Rachel is currently preparing destination pages that pair practical travel context with full photo
          essays.
        </p>
      </ContentContainer>
    </main>
  );
}
