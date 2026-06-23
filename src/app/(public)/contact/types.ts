export interface ContactSettings {
  id: string;
  physicalAddress: string;
  contactEmail: string;
  inquiryTypes: string[];
  phoneNumbers: string[];
  officeHours: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Faq {
  id: string;
  question: string;
  answer: string;
  category: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  createdAt: string;
  updatedAt: string;
}
