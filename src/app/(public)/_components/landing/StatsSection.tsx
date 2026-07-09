export default function StatsSection({ metrics }: { metrics: any[] }) {
  if (!metrics || metrics.length === 0) return null;

  const displayStats = metrics.map(m => ({ 
    value: m.metricValue, 
    label: m.title, 
    subLabel: m.description || "" 
  }));

  return (
    <section className="bg-[#132a1c] text-white py-12 border-t border-[#1a3626]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap justify-center gap-y-8 lg:gap-y-0 lg:divide-x lg:divide-green-800/50">
          {displayStats.slice(0, 4).map((stat, index) => (
            <div key={index} className="flex flex-col px-4 lg:px-12">
              <span className="text-3xl lg:text-4xl font-bold text-on-dark-muted mb-2">{stat.value}</span>
              <span className="text-sm font-bold tracking-wider text-green-400 mb-1">{stat.label}</span>
              {stat.subLabel && <span className="text-xs text-on-dark-muted/70">{stat.subLabel}</span>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
