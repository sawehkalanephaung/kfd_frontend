export default function StatsSection() {
  const stats = [
    {
      value: "3.2M+",
      label: "ACRES PROTECTED",
      subLabel: "across Kawthoolei regions"
    },
    {
      value: "8.5M+",
      label: "TREES PLANTED",
      subLabel: "through community initiatives"
    },
    {
      value: "420+",
      label: "SPECIES SAVED",
      subLabel: "from endangerment and poaching"
    },
    {
      value: "1,200+",
      label: "RANGERS ON DUTY",
      subLabel: "protecting the forest full-time"
    }
  ];

  return (
    <section className="bg-[#132a1c] text-white py-12 border-t border-[#1a3626]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-0 lg:divide-x lg:divide-green-800/50">
          {stats.map((stat, index) => (
            <div key={index} className="flex flex-col px-4 lg:px-8 first:pl-0 last:pr-0">
              <span className="text-3xl lg:text-4xl font-bold text-green-50 mb-2">{stat.value}</span>
              <span className="text-sm font-bold tracking-wider text-green-400 mb-1">{stat.label}</span>
              <span className="text-xs text-green-200/70">{stat.subLabel}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
