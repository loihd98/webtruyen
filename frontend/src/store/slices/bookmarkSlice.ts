import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { BookmarkState, Bookmark } from "../../types";
import { bookmarksAPI } from "../../utils/api";

// Async thunks
export const getBookmarks = createAsyncThunk(
  "bookmarks/getBookmarks",
  async (_, { rejectWithValue }) => {
    try {
      const response = await bookmarksAPI.getBookmarks();
      return response.data || [];
    } catch (error: any) {
      return rejectWithValue(error.error || "Failed to get bookmarks");
    }
  }
);

export const addBookmark = createAsyncThunk(
  "bookmarks/addBookmark",
  async (
    { storyId, chapterId }: { storyId?: string; chapterId?: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await bookmarksAPI.addBookmark(storyId, chapterId);
      return response.data!;
    } catch (error: any) {
      return rejectWithValue(error.error || "Failed to add bookmark");
    }
  }
);

export const removeBookmark = createAsyncThunk(
  "bookmarks/removeBookmark",
  async (bookmarkId: string, { rejectWithValue }) => {
    try {
      await bookmarksAPI.removeBookmark(bookmarkId);
      return bookmarkId;
    } catch (error: any) {
      return rejectWithValue(error.error || "Failed to remove bookmark");
    }
  }
);

const initialState: BookmarkState = {
  bookmarks: [],
  isLoading: false,
  error: null,
};

const bookmarkSlice = createSlice({
  name: "bookmarks",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearBookmarks: (state) => {
      state.bookmarks = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Get bookmarks
      .addCase(getBookmarks.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getBookmarks.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          state.bookmarks = action.payload;
        }
      })
      .addCase(getBookmarks.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Add bookmark
      .addCase(addBookmark.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addBookmark.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          state.bookmarks.push(action.payload);
        }
      })
      .addCase(addBookmark.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Remove bookmark
      .addCase(removeBookmark.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(removeBookmark.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          state.bookmarks = state.bookmarks.filter(
            (bookmark: any) => bookmark.id !== action.payload
          );
        }
      })
      .addCase(removeBookmark.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearBookmarks } = bookmarkSlice.actions;
export default bookmarkSlice.reducer;
