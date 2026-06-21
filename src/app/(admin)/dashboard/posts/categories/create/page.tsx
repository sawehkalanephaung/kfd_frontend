import CategoryForm from '@/components/category-form';

export default function CreateCategoryPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Create New Category</h1>
        <p className="text-gray-500 mt-1">
          Add a new classification category for Posts & News.
        </p>
      </div>
      
      <CategoryForm isEdit={false} />
    </div>
  );
}
