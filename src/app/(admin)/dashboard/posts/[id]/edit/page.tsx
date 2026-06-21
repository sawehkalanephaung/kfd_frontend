'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import PostForm from '@/components/post-form';
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
      <div className="flex flex-col items-center justify-center py-20 text-gray-500">
        <Loader2 className="w-8 h-8 animate-spin mb-4 text-emerald-500" />
        Loading post details...
      </div>
    );
  }

  if (error || !postData) {
    return (
      <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-100">
        <h2 className="text-lg font-bold mb-2">Error</h2>
        <p>{error || 'Post not found.'}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit Post</h1>
        <p className="text-gray-500 mt-1">
          Update the content, category, tags, and publishing status for this post.
        </p>
      </div>
      
      <PostForm isEdit={true} initialData={postData} postId={id} />
    </div>
  );
}
