export type PublishStatus = "published" | "draft" | "archived";

export interface Magazine {
  id: string;
  title: string;
  month: string; // e.g. "August"
  year: number;  // e.g. 2026
  pdfUrl: string;
  coverImageUrl: string;
  description: string;
  pageCount?: number;
  featured?: boolean;
  status: PublishStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Story {
  id: string;
  title: string;
  slug: string;
  posterUrl: string;
  content: string; // Rich text HTML or Markdown
  excerpt: string;
  category: "Editorial" | "Message" | "Cultural" | "Feature" | "Event";
  date: string;
  author?: string;
  status: PublishStatus;
  createdAt: string;
  updatedAt: string;
}

export interface VipMember {
  id: string;
  name: string;
  designation: string;
  posterUrl: string;
  profileDetails: string;
  category?: string;
  location?: string;
  status: PublishStatus;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface VvipMember {
  id: string;
  name: string;
  designation: string;
  posterUrl: string;
  detailedProfile: string;
  prestigeBadge?: string; // e.g. "Patron of Excellence", "Visionary Leader"
  achievements?: string[];
  quote?: string;
  isFeatured: boolean;
  status: PublishStatus;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface AnalyticsSummary {
  totalViews: number;
  uniqueVisitors: number;
  magazineViews: Record<string, number>;
  countryStats: Record<string, number>;
  deviceStats: {
    desktop: number;
    mobile: number;
    tablet: number;
  };
  browserStats: Record<string, number>;
  averageSessionDurationSeconds: number;
}

export interface AdminUser {
  uid: string;
  email: string;
  displayName?: string;
  role: "admin" | "superadmin";
  lastLoginAt?: string;
}
