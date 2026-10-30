export function HomeFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative w-full px-[var(--gutter)] lg:px-[var(--gutter-lg)] pt-28 pb-14 text-center">
      <div className="mx-auto flex max-w-[var(--max-content)] flex-col items-center gap-2">
        <span className="font-display italic text-[1.25rem] leading-none text-[color-mix(in_srgb,var(--cosmos-text)_78%,transparent)]">
          Hiep Trong
        </span>
        <p className="text-[length:var(--fs-micro)] tracking-[var(--ls-support)] text-[color-mix(in_srgb,var(--cosmos-text-muted)_60%,transparent)]">
          Personal universe · {year}
        </p>
      </div>
    </footer>
  );
}
