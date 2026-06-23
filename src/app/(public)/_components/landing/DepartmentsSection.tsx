import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function DepartmentsSection({ departments }: { departments: any[] }) {
  const defaultDepartments = [
    { title: "Forest Protection", description: "Combating illegal logging, preventing forest fires, and enforcing forestry regulations across Kawthoolei.", slug: "protection" },
    { title: "Conservation & Biodiversity", description: "Specialized initiatives for wildlife monitoring, habitat restoration, and ecological research programs.", slug: "conservation" },
    { title: "Reforestation & Nurseries", description: "Managing tree nurseries and organizing large-scale planting campaigns in degraded areas.", slug: "reforestation" },
    { title: "Community Forestry", description: "Working alongside local villages to establish and support community-managed forest reserves.", slug: "community" }
  ];

  const displayDepartments = departments && departments.length > 0
    ? departments
    : defaultDepartments;

  return (
    <section className="py-20 bg-gray-50/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
          <h2 className="text-3xl font-bold text-gray-900">Our Departments</h2>
          <Link 
            href="/departments" 
            className="text-sm font-semibold text-[#2a563c] hover:text-[#1a3626] flex items-center gap-1 transition-colors group"
          >
            View All Departments 
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
