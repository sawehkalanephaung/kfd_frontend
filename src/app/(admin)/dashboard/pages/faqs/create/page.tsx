import FaqForm from '@/components/faq-form';

export default function CreateFaqPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Create New FAQ</h1>
        <p className="text-gray-500 mt-1">
          Add a new Frequently Asked Question to the knowledge base.
        </p>
      </div>
      
      <FaqForm isEdit={false} />
    </div>
  );
}
