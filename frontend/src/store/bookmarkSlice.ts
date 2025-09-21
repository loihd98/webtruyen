import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Bookmark } from "@/types";

interface BookmarkState {
  bookmarks: Bookmark[];
  isLoading: boolean;
  error: string | null;
}

const initialState: BookmarkState = {
  bookmarks: [],
  isLoading: false,
  error: null,
};

const bookmarkSlice = createSlice({
  name: "bookmark",
  initialState,
  reducers: {
    setBookmarks: (state, action: PayloadAction<Bookmark[]>) => {
      state.bookmarks = action.payload;
    },
    addBookmark: (state, action: PayloadAction<Bookmark>) => {
      state.bookmarks.unshift(action.payload);
    },
    removeBookmark: (state, action: PayloadAction<string>) => {
      state.bookmarks = state.bookmarks.filter(
        (bookmark) => bookmark.id !== action.payload
      );
    },
    toggleBookmarkForStory: (
      state,
      action: PayloadAction<{ storyId: string; bookmark?: Bookmark }>
    ) => {
      const { storyId, bookmark } = action.payload;
      const existingIndex = state.bookmarks.findIndex(
        (b) => b.storyId === storyId && !b.chapterId
      );

      if (existingIndex >= 0) {
        // Remove existing bookmark
        state.bookmarks.splice(existingIndex, 1);
      } else if (bookmark) {
        // Add new bookmark
        state.bookmarks.unshift(bookmark);
      }
    },
    toggleBookmarkForChapter: (
      state,
      action: PayloadAction<{ chapterId: string; bookmark?: Bookmark }>
    ) => {
      const { chapterId, bookmark } = action.payload;
      const existingIndex = state.bookmarks.findIndex(
        (b) => b.chapterId === chapterId
      );

      if (existingIndex >= 0) {
        // Remove existing bookmark
        state.bookmarks.splice(existingIndex, 1);
      } else if (bookmark) {
        // Add new bookmark
        state.bookmarks.unshift(bookmark);
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setBookmarks,
  addBookmark,
  removeBookmark,
  toggleBookmarkForStory,
  toggleBookmarkForChapter,
  setLoading,
  setError,
  clearError,
} = bookmarkSlice.actions;

export default bookmarkSlice.reducer;
