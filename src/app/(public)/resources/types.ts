export interface MediaAsset {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSizeKb: number;
  mediaCategory: string;
  language: string;
  departmentId: string | null;
  uploadedBy: string | null;
  createdAt: string;
}

export interface PaginatedMedia {
  content: MediaAsset[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface MediaCategoryCount {
  category: string;
  count: number;
}
