import { ContentContainer } from "@/components/ui/content-container";

export function SiteFooter() {
  return (
    <footer className="mt-14 border-t border-[var(--color-border)]">
      <ContentContainer className="py-8 text-sm text-[var(--color-muted)]">
        <p>© {new Date().getFullYear()} Rachel Kennedy</p>
      </ContentContainer>
    </footer>
  );
}
