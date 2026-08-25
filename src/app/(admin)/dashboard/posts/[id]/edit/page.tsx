'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Loader2, Newspaper } from 'lucide-react';
import PostForm from '@/components/post-form';
import PageHeader from '@/components/page-header';
import api from '@/lib/api';

export default function EditPostPage() {
  const params = useParams();
  const id = params.id as string;
  
  const [postData, setPostData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await api.get(`/api/v1/admin/cms/posts/${id}`);
        setPostData(res.data?.data || res.data);
      } catch (err: any) {
        console.error(err);
        setError('Failed to load post details.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPost();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-steel">
        <Loader2 className="w-8 h-8 animate-spin mb-4 text-brand-green" />
        Loading post details...
      </div>
    );
  }

  if (error || !postData) {
    return (
      <div className="bg-red-50 text-red-600 p-6 rounded-lg border border-red-100">
        <h2 className="text-lg font-bold mb-2">Error</h2>
        <p>{error || 'Post not found.'}</p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        icon={Newspaper}
        title="Edit Post"
        description="Update the content, category, tags, and publishing status for this post."
      />

      <PostForm isEdit={true} initialData={postData} postId={id} />
    </div>
  );
}
