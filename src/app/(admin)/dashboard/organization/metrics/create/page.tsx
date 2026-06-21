import MetricForm from '@/components/metric-form';

export default function CreateMetricPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Create Global Metric</h1>
        <p className="text-gray-500 mt-1">
          Add a new global statistic to display across the KFD portal.
        </p>
      </div>
      
      <MetricForm isEdit={false} />
    </div>
  );
}
