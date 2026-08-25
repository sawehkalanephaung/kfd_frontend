import { MessageCircleQuestion } from 'lucide-react';
import FaqForm from '@/components/faq-form';
import PageHeader from '@/components/page-header';

export default function CreateFaqPage() {
  return (
    <div>
      <PageHeader
        icon={MessageCircleQuestion}
        title="Create New FAQ"
        description="Add a new Frequently Asked Question to the knowledge base."
      />

      <FaqForm isEdit={false} />
    </div>
  );
}
