// Publications page TypeScript types
export interface PublicationCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface PublicationItem {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  category: PublicationCategory | null;
  publishedDate: string;
  issuedBy: string | null;
  departmentId: string | null;
  language: string | null;
  referenceNo: string | null;
  documentUrl: string | null;
  documentFileName: string | null;
  documentFileType: string | null;
  documentFileSizeKb: number | null;
  thumbnailUrl: string | null;
  status: string;
  downloadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedPublications {
  content: PublicationItem[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}
