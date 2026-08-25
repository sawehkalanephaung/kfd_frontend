import { BarChart2 } from 'lucide-react';
import MetricForm from '@/components/metric-form';
import PageHeader from '@/components/page-header';

export default function CreateMetricPage() {
  return (
    <div>
      <PageHeader
        icon={BarChart2}
        title="Create Global Metric"
        description="Add a new global statistic to display across the KFD portal."
      />

      <MetricForm isEdit={false} />
    </div>
  );
}
