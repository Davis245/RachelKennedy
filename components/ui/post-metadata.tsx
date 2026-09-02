export function PostMetadata({ location, timing, readTime }: { location: string; timing: string; readTime: string }) {
  return (
    <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-[var(--color-muted)]">
      <li>{location}</li>
      <li>{timing}</li>
      <li>{readTime}</li>
    </ul>
  );
}
