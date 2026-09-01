// News page TypeScript types
export interface PostCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface TagItem {
  id: string;
  name: string;
  slug: string;
}

export interface NewsPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImageUrl: string | null;
  authorId: string | null;
  category: PostCategory | null;
  tags: TagItem[];
  status: string;
  viewCount: number;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
  metadata?: {
    eventDate?: string;
    eventTime?: string;
    eventLocation?: string;
    [key: string]: any;
  };
}

export interface NewsPostDetail extends NewsPost {
  relatedPosts: NewsPost[];
  sliderImageUrls?: string[];
  sliderImageIds?: string[];
}

export interface PaginatedPosts {
  content: NewsPost[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}
