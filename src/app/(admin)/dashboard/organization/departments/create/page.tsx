import { Building2 } from 'lucide-react';
import DepartmentForm from '@/components/department-form';
import PageHeader from '@/components/page-header';

export default function CreateDepartmentPage() {
  return (
    <div>
      <PageHeader
        icon={Building2}
        title="Create New Department"
        description="Add a new operational unit to the KFD organization."
      />

      <DepartmentForm isEdit={false} />
    </div>
  );
}
