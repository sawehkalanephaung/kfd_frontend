import { DepartmentData } from "../../departments/types";

export default function DepartmentInfo({ data }: { data: DepartmentData }) {
  // Parse bodyContent assuming it's a JSON string with an "en" key, as seen in the DB
  let overview = "";
  try {
    if (data.bodyContent) {
      const parsed = JSON.parse(data.bodyContent);
      overview = parsed.richText || parsed.en || data.bodyContent;
    }
  } catch {
    overview = data.bodyContent || "";
  }

  const timeline = data.timeline || [];

  // Strip HTML to see if there's actual content
  const hasOverview = overview && overview.replace(/<[^>]*>/gm, '').trim().length > 0;

  return (
    <div className="py-8">
      <h2 className="text-xl font-bold text-ink mb-6 border-b-2 pb-4 inline-block border-green-700 dark:border-brand-green">
        History of the {data.name}
      </h2>

      {hasOverview && (
        <div className="mb-12 min-w-0">
          <div
            className="rich-text text-slate leading-relaxed text-sm prose prose-sm dark:prose-invert max-w-none [&_[style*=background]]:bg-transparent! [&_[style*=background]]:bg-none! [&_[style*=color]]:text-inherit!"
            dangerouslySetInnerHTML={{ __html: overview }}
          />
        </div>
      )}
    </div>
  );
}
