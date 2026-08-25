import { Newspaper } from 'lucide-react';
import PostForm from '@/components/post-form';
import PageHeader from '@/components/page-header';

export default function CreatePostPage() {
  return (
    <div>
      <PageHeader
        icon={Newspaper}
        title="Create New Post"
        description="Publish a new article, news update, or announcement to the KFD portal."
      />

      <PostForm isEdit={false} />
    </div>
  );
}
