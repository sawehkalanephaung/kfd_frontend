import PostForm from '@/components/post-form';

export default function CreatePostPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-ink">Create New Post</h1>
        <p className="text-steel mt-1">
          Publish a new article, news update, or announcement to the KFD portal.
        </p>
      </div>
      
      <PostForm isEdit={false} />
    </div>
  );
}
