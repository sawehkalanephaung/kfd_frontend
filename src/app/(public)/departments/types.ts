export interface TeamMemberSummary {
  id: string;
  firstName: string;
  lastName: string;
  title: Record<string, string>;
  headshotUrl: string | null;
}

export interface DepartmentContact {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  address: string;
  websiteUrl: string;
  officeHours: string;
  socialLinks: Record<string, string>;
}

export interface DepartmentTimelineEvent {
  id: string;
  year: string;
  title: string;
  description: string;
}

export interface MediaResource {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSizeKb: number;
  mediaCategory: string;
  language: string;
  createdAt: string;
}

export interface PostSummary {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featuredImageUrl: string | null;
  publishedAt: string;
}

export interface DepartmentData {
  id: string;
  slug: string;
  name: string;
  headMember: TeamMemberSummary | null;
  bodyContent: string;
  logoId: string | null;
  heroImageId: string | null;
  contacts: DepartmentContact[];
  teamMembers: TeamMemberSummary[];
  posts: PostSummary[];
  timeline: DepartmentTimelineEvent[];
  resources: MediaResource[];
}
