export function DueSoonDot() {
  return (
    <span className="inline-flex items-center gap-1.5 text-[length:var(--fs-small)] font-medium text-text-due-soon whitespace-nowrap">
      <span aria-hidden="true" className="h-2 w-2 rounded-pill bg-status-due-soon shrink-0" />
      <span>Due soon</span>
    </span>
  );
}
