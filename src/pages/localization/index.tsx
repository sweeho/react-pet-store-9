import { EmptyFrame, ErrorFrame, LoadingFrame } from "@/components/shell";
import { useLoad } from "@/hooks/use-load";

interface Locale {
  code: string;
}

async function loadLocales(): Promise<Locale[]> {
  const response = await fetch("/api/locales");
  if (!response.ok) throw new Error(`GET /api/locales failed: ${response.status}`);
  return (await response.json()) as Locale[];
}

export default function LocalizationPage(): React.JSX.Element {
  const { status, data, retry } = useLoad(loadLocales);

  let body: React.JSX.Element;
  if (status === "loading") {
    body = <LoadingFrame />;
  } else if (status === "error") {
    body = <ErrorFrame onRetry={retry} />;
  } else if (!data || data.length === 0) {
    body = <EmptyFrame title="No languages available" message="No languages are available yet." />;
  } else {
    body = (
      <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {data.map((locale) => (
          <li
            key={locale.code}
            className="border-border rounded-[var(--radius)] border p-4 text-sm font-medium"
          >
            {locale.code}
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-8">
      <h1 className="text-3xl font-semibold tracking-tight">Language</h1>
      {body}
    </div>
  );
}
