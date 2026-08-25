import { FileText } from 'lucide-react';
import PageForm from '@/components/page-form';
import PageHeader from '@/components/page-header';

interface CreatePageProps {
  // Populated when arriving from the "well-known pages" shortcut on the
  // Pages list (?slug=mission&title=Mission), so the slug is prefilled and
  // locked rather than left to auto-generate from whatever title ends up
  // being typed.
  searchParams: Promise<{ slug?: string; title?: string }>;
}

export default async function CreatePage({ searchParams }: CreatePageProps) {
  const { slug, title } = await searchParams;

  return (
    <div>
      <PageHeader
        icon={FileText}
        title="Create New Page"
        description="Add a new content page to the KFD platform."
      />

      <PageForm isEdit={false} initialData={slug ? { slug, title: title || '' } : undefined} />
    </div>
  );
}
