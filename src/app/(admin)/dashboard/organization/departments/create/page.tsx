import DepartmentForm from '@/components/department-form';

export default function CreateDepartmentPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Create New Department</h1>
        <p className="text-gray-500 mt-1">
          Add a new operational unit to the KFD organization.
        </p>
      </div>
      
      <DepartmentForm isEdit={false} />
    </div>
  );
}
