import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function DepartmentsSection({ departments }: { departments: any[] }) {
  const displayDepartments = departments || [];

  return (
    <section className="py-20 bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
          <h2 className="text-3xl font-bold text-white">Our Department Branches</h2>
          <Link
            href="/departments"
            className="text-sm font-semibold text-white-600 hover:text-white flex items-center gap-1 transition-colors group"
          >
            View All Department Branches
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayDepartments.slice(0, 4).map((dept, index) => (
            <div
              key={dept.id || index}
              className="bg-white border border-gray-100 p-8 rounded-lg shadow-sm hover:shadow-md transition-all flex flex-col h-full"
            >
              <h3 className="text-lg font-bold text-[#1a3626] mb-4">{dept.title || dept.name}</h3>
              <p className="text-sm text-gray-600 leading-relaxed flex-grow mb-8 line-clamp-4">
                {dept.description || dept.shortDescription}
              </p>
              <Link
                href={`/departments/${dept.slug}`}
                className="text-sm font-semibold text-gray-900 hover:text-[#2a563c] inline-flex items-center gap-1 group w-fit transition-colors"
              >
                Explore
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
