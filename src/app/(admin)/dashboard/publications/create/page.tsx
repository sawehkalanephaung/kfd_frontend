import { FileText } from 'lucide-react';
import PublicationForm from '@/components/publication-form';
import PageHeader from '@/components/page-header';

export default function CreatePublicationPage() {
  return (
    <div>
      <PageHeader
        icon={FileText}
        title="Create New Publication"
        description="Publish a new report, press release, or official document to the KFD portal."
      />

      <PublicationForm isEdit={false} />
    </div>
  );
}
