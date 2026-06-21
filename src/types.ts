export interface AppScreenshot {
  id: number;
  appId: number;
  url: string;
}

export interface AppComment {
  id: number;
  appId: number;
  userName: string;
  content: string;
  rating: number;
  createdAt: string;
}

export interface Application {
  id: number;
  name: string;
  developerName: string;
  description: string;
  version: string;
  size: string;
  updateDate: string;
  category: string;
  iconUrl: string;
  apkUrl: string;
  downloadCount: number;
  isFeatured: number;
  
  screenshots?: AppScreenshot[];
  comments?: AppComment[];
  averageRating?: number;
}

export const CATEGORIES = [
  'Games',
  'Tools',
  'Productivity',
  'Education',
  'Entertainment',
  'Social',
  'Photography',
  'Music',
  'Video',
  'Lifestyle',
  'Business',
  'Health & Fitness'
];
