import api from './api';

const POSTS_ENDPOINT = '/api/v1/admin/cms/posts';
const PUBLICATIONS_ENDPOINT = '/api/v1/admin/cms/publications';

/**
 * Changes a CMS resource's status via GET-then-PUT. The admin PUT endpoints
 * require the full request shape (flat `categoryId`/`tagIds` etc.), which is
 * NOT the shape their matching GET returns (nested `category`/`tags`
 * objects) — spreading the GET response straight into the PUT body silently
 * drops category/tags/etc. because the backend just sees those fields as
 * absent. `toRequestBody` owns translating one resource type's response
 * shape into its request shape; this function owns the fetch-map-save
 * sequence itself.
 */
async function changeStatus<TFull, TRequest extends { status: string }>(
  endpoint: string,
  id: string,
  newStatus: string,
  toRequestBody: (full: TFull) => Omit<TRequest, 'status'>
): Promise<void> {
  const res = await api.get(`${endpoint}/${id}`);
  const full = (res.data?.data ?? res.data) as TFull;
  await api.put(`${endpoint}/${id}`, { ...toRequestBody(full), status: newStatus });
}

interface PostFullResponse {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImageUrl: string | null;
  sliderImageIds?: string[];
  category?: { id: string } | null;
  departmentId?: string | null;
  tags?: { id: string }[];
  metadata?: Record<string, unknown> | null;
}

interface PublicationFullResponse {
  title: string;
  summary?: string | null;
  category?: { id: string } | null;
  publishedDate: string;
  issuedBy?: string | null;
  departmentId?: string | null;
  language?: string | null;
  referenceNo?: string | null;
  documentId: string;
  thumbnailId?: string | null;
  slug: string;
}

interface PostRequestBody {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImageUrl: string | null;
  sliderImageIds: string[];
  categoryId: string | null;
  departmentId: string | null;
  tagIds: string[];
  metadata: Record<string, unknown> | null;
  status: string;
}

export function updatePostStatus(id: string, newStatus: string): Promise<void> {
  return changeStatus<PostFullResponse, PostRequestBody>(POSTS_ENDPOINT, id, newStatus, (full) => ({
    title: full.title,
    slug: full.slug,
    excerpt: full.excerpt,
    content: full.content,
    featuredImageUrl: full.featuredImageUrl,
    sliderImageIds: full.sliderImageIds ?? [],
    categoryId: full.category?.id ?? null,
    departmentId: full.departmentId ?? null,
    tagIds: (full.tags ?? []).map((tag) => tag.id),
    metadata: full.metadata ?? null,
  }));
}

interface PublicationRequestBody {
  title: string;
  summary: string | null;
  categoryId: string | null;
  publishedDate: string;
  issuedBy: string | null;
  departmentId: string | null;
  language: string | null;
  referenceNo: string | null;
  documentId: string;
  thumbnailId: string | null;
  slug: string;
  status: string;
}

export function updatePublicationStatus(id: string, newStatus: string): Promise<void> {
  return changeStatus<PublicationFullResponse, PublicationRequestBody>(PUBLICATIONS_ENDPOINT, id, newStatus, (full) => ({
    title: full.title,
    summary: full.summary ?? null,
    categoryId: full.category?.id ?? null,
    publishedDate: full.publishedDate,
    issuedBy: full.issuedBy ?? null,
    departmentId: full.departmentId ?? null,
    language: full.language ?? null,
    referenceNo: full.referenceNo ?? null,
    documentId: full.documentId,
    thumbnailId: full.thumbnailId ?? null,
    slug: full.slug,
  }));
}
