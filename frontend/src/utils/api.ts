import axios, { AxiosInstance, AxiosResponse, AxiosError } from "axios";
import {
  ApiResponse,
  AuthResponse,
  User,
  Story,
  Chapter,
  Comment,
  Bookmark,
  Genre,
  AffiliateLink,
  Analytics,
  PaginatedResponse,
  StoryQuery,
  AdminStats,
} from "../types";

// Base API URL
const API_BASE_URL = "http://localhost:5000/api";

// Token management functions (to be set from external store)
let getAuthToken: (() => string | null) | null = null;
let handleTokenRefresh: (() => Promise<string | null>) | null = null;
let handleLogout: (() => void) | null = null;

// Function to set token management handlers
export const setTokenHandlers = (
  getToken: () => string | null,
  refreshHandler: () => Promise<string | null>,
  logoutHandler: () => void
) => {
  getAuthToken = getToken;
  handleTokenRefresh = refreshHandler;
  handleLogout = logoutHandler;
};

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    if (getAuthToken) {
      const token = getAuthToken();
      console.log(token, "token");

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        if (handleTokenRefresh) {
          const newToken = await handleTokenRefresh();

          if (newToken && originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return apiClient(originalRequest);
          }
        }
      } catch (refreshError) {
        if (handleLogout) {
          handleLogout();
        }
        // Redirect to login if in browser
        if (typeof window !== "undefined") {
          window.location.href = "/auth/login";
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// API helper function
const apiRequest = async <T>(
  request: () => Promise<AxiosResponse<ApiResponse<T>>>
): Promise<ApiResponse<T>> => {
  try {
    const response = await request();
    return response.data;
  } catch (error: any) {
    throw {
      error:
        error.response?.data?.error || error.message || "An error occurred",
      details: error.response?.data?.details || [],
    };
  }
};

// Auth API
export const authAPI = {
  login: (email: string, password: string) =>
    apiRequest<AuthResponse>(() =>
      apiClient.post("/auth/login", { email, password })
    ),

  register: (email: string, password: string, name: string) =>
    apiRequest<AuthResponse>(() =>
      apiClient.post("/auth/register", { email, password, name })
    ),

  refreshToken: (refreshToken: string) =>
    apiRequest<AuthResponse>(() =>
      apiClient.post("/auth/refresh", { refreshToken })
    ),

  logout: (refreshToken: string) =>
    apiRequest<{ message: string }>(() =>
      apiClient.post("/auth/logout", { refreshToken })
    ),

  getProfile: () => apiRequest<User>(() => apiClient.get("/auth/me")),

  updateProfile: (data: Partial<User>) =>
    apiRequest<User>(() => apiClient.patch("/users/me", data)),

  changePassword: (currentPassword: string, newPassword: string) =>
    apiRequest<{ message: string }>(() =>
      apiClient.post("/users/change-password", { currentPassword, newPassword })
    ),

  googleAuth: (token: string) =>
    apiRequest<AuthResponse>(() => apiClient.post("/auth/google", { token })),

  facebookAuth: (token: string) =>
    apiRequest<AuthResponse>(() => apiClient.post("/auth/facebook", { token })),
};

// Stories API
export const storiesAPI = {
  getStories: (filters?: StoryQuery) =>
    apiRequest<PaginatedResponse<Story>>(() =>
      apiClient.get("/stories", { params: filters })
    ),

  getStory: (slug: string) =>
    apiRequest<Story>(() => apiClient.get(`/stories/${slug}`)),

  createStory: (data: Partial<Story>) =>
    apiRequest<Story>(() => apiClient.post("/stories", data)),

  updateStory: (slug: string, data: Partial<Story>) =>
    apiRequest<Story>(() => apiClient.put(`/stories/${slug}`, data)),

  deleteStory: (slug: string) =>
    apiRequest<{ message: string }>(() => apiClient.delete(`/stories/${slug}`)),

  getPopularStories: (limit = 10) =>
    apiRequest<Story[]>(() => apiClient.get(`/stories/popular?limit=${limit}`)),

  getRecentStories: (limit = 10) =>
    apiRequest<Story[]>(() => apiClient.get(`/stories/recent?limit=${limit}`)),

  searchStories: (query: string, filters?: StoryQuery) =>
    apiRequest<PaginatedResponse<Story>>(() =>
      apiClient.get("/stories/search", {
        params: { search: query, ...filters },
      })
    ),
};

// Chapters API
export const chaptersAPI = {
  getChapters: (storySlug: string) =>
    apiRequest<Chapter[]>(() =>
      apiClient.get(`/stories/${storySlug}/chapters`)
    ),

  getChapter: (storySlug: string, chapterNumber: number) =>
    apiRequest<Chapter>(() =>
      apiClient.get(`/stories/${storySlug}/chapters/${chapterNumber}`)
    ),

  createChapter: (storySlug: string, data: Partial<Chapter>) =>
    apiRequest<Chapter>(() =>
      apiClient.post(`/stories/${storySlug}/chapters`, data)
    ),

  updateChapter: (
    storySlug: string,
    chapterNumber: number,
    data: Partial<Chapter>
  ) =>
    apiRequest<Chapter>(() =>
      apiClient.put(`/stories/${storySlug}/chapters/${chapterNumber}`, data)
    ),

  deleteChapter: (storySlug: string, chapterNumber: number) =>
    apiRequest<{ message: string }>(() =>
      apiClient.delete(`/stories/${storySlug}/chapters/${chapterNumber}`)
    ),

  unlockChapter: (chapterId: string) =>
    apiRequest<{ message: string; unlockedAt: string }>(() =>
      apiClient.post(`/chapters/${chapterId}/unlock`)
    ),
};

// Comments API
export const commentsAPI = {
  getComments: (chapterId: string, page: number = 1, limit: number = 10) =>
    apiRequest<{
      comments: Comment[];
      chapter: {
        id: string;
        title: string;
      };
      pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
      };
    }>(() =>
      apiClient.get(`/comments/chapters/${chapterId}/comments`, {
        params: { page, limit },
      })
    ),

  createComment: (chapterId: string, content: string, parentId?: string) =>
    apiRequest<{ message: string; data: { comment: Comment } }>(() =>
      apiClient.post(`/comments/chapters/${chapterId}/comments`, {
        content,
        parentId,
      })
    ),

  updateComment: (commentId: string, content: string) =>
    apiRequest<{ message: string; data: { comment: Comment } }>(() =>
      apiClient.patch(`/comments/${commentId}`, { content })
    ),

  deleteComment: (commentId: string) =>
    apiRequest<{ message: string }>(() =>
      apiClient.delete(`/comments/${commentId}`)
    ),

  reportComment: (commentId: string, reason: string) =>
    apiRequest<{ message: string }>(() =>
      apiClient.post(`/comments/${commentId}/report`, { reason })
    ),
};

// Bookmarks API
export const bookmarksAPI = {
  getBookmarks: () => apiRequest<Bookmark[]>(() => apiClient.get("/bookmarks")),

  addBookmark: (storyId?: string, chapterId?: string) =>
    apiRequest<Bookmark>(() =>
      apiClient.post("/bookmarks", { storyId, chapterId })
    ),

  removeBookmark: (bookmarkId: string) =>
    apiRequest<{ message: string }>(() =>
      apiClient.delete(`/bookmarks/${bookmarkId}`)
    ),
};

// Genres API
export const genresAPI = {
  getGenres: () => apiRequest<Genre[]>(() => apiClient.get("/genres")),

  createGenre: (data: Partial<Genre>) =>
    apiRequest<Genre>(() => apiClient.post("/genres", data)),

  updateGenre: (id: string, data: Partial<Genre>) =>
    apiRequest<Genre>(() => apiClient.put(`/genres/${id}`, data)),

  deleteGenre: (id: string) =>
    apiRequest<{ message: string }>(() => apiClient.delete(`/genres/${id}`)),
};

// Media API
export const mediaAPI = {
  uploadFile: (file: File, type: "audio" | "image") => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);

    return apiRequest<{ message: string; file: any }>(() =>
      apiClient.post("/media/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
    );
  },

  deleteFile: (filename: string) =>
    apiRequest<{ message: string }>(() =>
      apiClient.delete(`/media/${filename}`)
    ),

  getFiles: () => apiRequest<any[]>(() => apiClient.get("/media")),
};

// Admin API
export const adminAPI = {
  getStats: () => apiRequest<AdminStats>(() => apiClient.get("/admin/stats")),

  getUsers: (page = 1, limit = 20) =>
    apiRequest<PaginatedResponse<User>>(() =>
      apiClient.get("/admin/users", { params: { page, limit } })
    ),

  updateUser: (userId: string, data: Partial<User>) =>
    apiRequest<User>(() => apiClient.put(`/admin/users/${userId}`, data)),

  deleteUser: (userId: string) =>
    apiRequest<{ message: string }>(() =>
      apiClient.delete(`/admin/users/${userId}`)
    ),

  getComments: (page = 1, limit = 20) =>
    apiRequest<PaginatedResponse<Comment>>(() =>
      apiClient.get("/admin/comments", { params: { page, limit } })
    ),

  approveComment: (commentId: string) =>
    apiRequest<Comment>(() =>
      apiClient.put(`/admin/comments/${commentId}/approve`)
    ),

  deleteComment: (commentId: string) =>
    apiRequest<{ message: string }>(() =>
      apiClient.delete(`/admin/comments/${commentId}`)
    ),
};

// Analytics API
export const analyticsAPI = {
  track: (event: string, data?: any) =>
    apiRequest<{ message: string }>(() =>
      apiClient.post("/analytics/track", { event, data })
    ),

  getAnalytics: (filters?: any) =>
    apiRequest<Analytics[]>(() =>
      apiClient.get("/analytics", { params: filters })
    ),
};

// Affiliate API
export const affiliateAPI = {
  redirect: (linkId: string) =>
    apiRequest<{ redirectUrl: string }>(() =>
      apiClient.get(`/affiliate/redirect/${linkId}`)
    ),

  getLinks: () =>
    apiRequest<AffiliateLink[]>(() => apiClient.get("/affiliate/links")),

  createLink: (data: Partial<AffiliateLink>) =>
    apiRequest<AffiliateLink>(() => apiClient.post("/affiliate/links", data)),

  updateLink: (linkId: string, data: Partial<AffiliateLink>) =>
    apiRequest<AffiliateLink>(() =>
      apiClient.put(`/affiliate/links/${linkId}`, data)
    ),

  deleteLink: (linkId: string) =>
    apiRequest<{ message: string }>(() =>
      apiClient.delete(`/affiliate/links/${linkId}`)
    ),
};

export default apiClient;
