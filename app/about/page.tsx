import { AccentPill } from "@/components/ui/accent-pill";
import { ContentContainer } from "@/components/ui/content-container";
import { SectionHeading } from "@/components/ui/section-heading";

export default function AboutPage() {
  return (
    <main className="py-12 sm:py-16">
      <ContentContainer className="space-y-6">
        <AccentPill tone="coral">About</AccentPill>
        <SectionHeading eyebrow="Rachel Kennedy" title="Editorial travel storytelling" />
        <p className="max-w-2xl text-[var(--color-muted)]">
          This blog blends destination reporting with personal perspective, photography, and reflections from
          each trip.
        </p>
      </ContentContainer>
    </main>
  );
}
