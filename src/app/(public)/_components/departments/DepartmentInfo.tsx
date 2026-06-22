import { DepartmentData } from "../../../departments/types";

export default function DepartmentInfo({ data }: { data: DepartmentData }) {
  // Parse bodyContent assuming it's a JSON string with an "en" key, as seen in the DB
  let overview = "";
  try {
    if (data.bodyContent) {
      const parsed = JSON.parse(data.bodyContent);
      overview = parsed.en || data.bodyContent;
    }
  } catch {
    overview = data.bodyContent || "";
  }

  const timeline = data.timeline || [];

  return (
    <div className="py-8">
      <h2 className="text-xl font-bold text-gray-900 mb-6 border-b pb-4 inline-block border-green-700">
        History of the {data.name}
      </h2>

      {overview && (
        <div className="mb-12">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Overview</h3>
          <p className="text-gray-700 leading-relaxed text-sm">
            {overview}
          </p>
        </div>
      )}

      {timeline.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-8">Timeline</h3>
          
          <div className="relative border-l-2 border-gray-200 ml-4 md:ml-[160px] pb-8">
            {timeline.map((event, index) => (
              <div key={event.id} className="mb-10 relative">
                {/* Timeline Dot */}
                <div className={`absolute w-4 h-4 rounded-full border-4 border-white shadow-sm -left-[9px] top-1.5 ${index === 0 ? 'bg-green-600' : 'bg-gray-400'}`}></div>
                
                <div className="flex flex-col md:flex-row gap-4 md:gap-12 pl-8">
                  {/* Year */}
                  <div className="md:w-32 md:-ml-[170px] md:text-right shrink-0">
                    <span className="text-sm font-semibold text-gray-600 mt-1 block">
                      {event.year}
                    </span>
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">{event.title}</h4>
                    <p className="text-xs text-gray-600 leading-relaxed max-w-2xl">
                      {event.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
