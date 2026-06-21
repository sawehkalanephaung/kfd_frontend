import TagForm from '@/components/tag-form';

export default function CreateTagPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Create New Tag</h1>
        <p className="text-gray-500 mt-1">
          Add a new tag to help categorize and filter your posts.
        </p>
      </div>
      
      <TagForm />
    </div>
  );
}
