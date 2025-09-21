export interface User {
  id: string;
  email: string;
  name: string;
  role: "USER" | "ADMIN";
  avatar?: string;
  createdAt: string;
  _count?: {
    bookmarks: number;
    comments: number;
    stories: number;
    unlockedChapters: number;
  };
}

export interface Genre {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  _count?: {
    stories: number;
  };
}

export interface AffiliateLink {
  id: string;
  provider: string;
  targetUrl: string;
  label?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Story {
  id: string;
  slug: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  type: "TEXT" | "AUDIO";
  status: "DRAFT" | "PUBLISHED" | "HIDDEN";
  viewCount: number;
  authorId: string;
  affiliateId?: string;
  createdAt: string;
  updatedAt: string;

  // Relations
  author?: {
    id: string;
    name: string;
    avatar?: string;
  };
  genres?: Genre[];
  affiliate?: AffiliateLink;
  chapters?: Chapter[];
  _count?: {
    chapters: number;
    bookmarks: number;
  };
}

export interface Chapter {
  id: string;
  number: number;
  title: string;
  content?: string;
  audioUrl?: string;
  isLocked: boolean;
  storyId: string;
  createdAt: string;
  updatedAt: string;

  // Relations
  story?: Story;
  unlockedBy?: User[];
  comments?: Comment[];

  // Computed
  isUnlocked?: boolean;
}

export interface Comment {
  id: string;
  content: string;
  isApproved: boolean;
  userId: string;
  chapterId: string;
  parentId?: string;
  createdAt: string;
  updatedAt: string;

  // Relations
  user?: User;
  chapter?: Chapter;
  parent?: Comment;
  replies?: Comment[];
}

export interface Bookmark {
  id: string;
  userId: string;
  storyId?: string;
  chapterId?: string;
  createdAt: string;

  // Relations
  user?: User;
  story?: Story;
  chapter?: Chapter;
}

export interface Analytics {
  id: string;
  event: string;
  userId?: string;
  storyId?: string;
  affiliateId?: string;
  ip?: string;
  userAgent?: string;
  referer?: string;
  createdAt: string;

  // Relations
  user?: User;
  story?: Story;
  affiliate?: AffiliateLink;
}

// API Response types
export interface ApiResponse<T = any> {
  message?: string;
  error?: string;
  data?: T;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

// Story query types
export interface StoryQuery {
  page?: number;
  limit?: number;
  type?: "TEXT" | "AUDIO";
  genre?: string;
  search?: string;
  sort?: "createdAt" | "updatedAt" | "viewCount" | "title";
}

// Chapter unlock types
export interface ChapterUnlockRequest {
  chapterId: string;
}

export interface ChapterUnlockResponse {
  message: string;
  isUnlocked: boolean;
  chapter?: Chapter;
}

// Comment types
export interface CreateCommentRequest {
  content: string;
  parentId?: string;
}

// Bookmark types
export interface CreateBookmarkRequest {
  storyId?: string;
  chapterId?: string;
}

export interface ToggleBookmarkRequest {
  storyId?: string;
  chapterId?: string;
}

export interface ToggleBookmarkResponse {
  message: string;
  action: "added" | "removed";
  bookmark?: Bookmark;
}

// Audio player types
export interface AudioPlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  playbackRate: number;
  isLoading: boolean;
  isBuffering: boolean;
  error?: string;
}

export interface AudioPlayerChapter {
  id: string;
  number: number;
  title: string;
  audioUrl: string;
  isUnlocked: boolean;
}

// Search types
export interface SearchFilters {
  type?: "TEXT" | "AUDIO" | "ALL";
  genres?: string[];
  sort?: "relevance" | "newest" | "popular" | "title";
}

export interface SearchResult {
  stories: Story[];
  totalResults: number;
  suggestions?: string[];
}

// Redux State types
export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

export interface BookmarkState {
  bookmarks: Bookmark[];
  isLoading: boolean;
  error: string | null;
}

export interface UnlockState {
  unlockedChapters: string[]; // Chapter IDs
  temporaryUnlocks: string[]; // For non-authenticated users
}

export interface UIState {
  sidebarOpen: boolean;
  theme: "light" | "dark";
  audioPlayerOpen: boolean;
  currentAudio?: {
    chapterId: string;
    title: string;
    audioUrl: string;
    storyTitle: string;
  };
}

// UI State types
export interface ToastMessage {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface ModalState {
  isOpen: boolean;
  type?: string;
  data?: any;
}

// Admin types
export interface AdminStats {
  totalUsers: number;
  totalStories: number;
  totalChapters: number;
  totalComments: number;
  totalViews: number;
  recentUsers: number;
  recentStories: number;
  topStories: Array<{
    title: string;
    slug: string;
    viewCount: number;
    type: string;
  }>;
}

// Media upload types
export interface UploadResponse {
  message: string;
  file: {
    filename: string;
    originalName: string;
    size: number;
    url: string;
    mimeType: string;
  };
}

export interface FileInfo {
  filename: string;
  size: number;
  createdAt: string;
  modifiedAt: string;
  url: string;
}
