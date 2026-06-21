import PageForm from '@/components/page-form';

export default function CreatePage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Create New Page</h1>
        <p className="text-gray-500 mt-1">
          Add a new content page to the KFD platform.
        </p>
      </div>
      
      <PageForm isEdit={false} />
    </div>
  );
}
