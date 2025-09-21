import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { UnlockState } from "../../types";

const initialState: UnlockState = {
  unlockedChapters: [],
  temporaryUnlocks: [],
};

const unlockSlice = createSlice({
  name: "unlock",
  initialState,
  reducers: {
    unlockChapter: (state, action: PayloadAction<string>) => {
      const chapterId = action.payload;
      if (!state.unlockedChapters.includes(chapterId)) {
        state.unlockedChapters.push(chapterId);
      }
    },

    temporaryUnlock: (state, action: PayloadAction<string>) => {
      const chapterId = action.payload;
      if (!state.temporaryUnlocks.includes(chapterId)) {
        state.temporaryUnlocks.push(chapterId);
      }
    },

    syncUnlockedChapters: (state, action: PayloadAction<string[]>) => {
      state.unlockedChapters = action.payload;
    },

    clearTemporaryUnlocks: (state) => {
      state.temporaryUnlocks = [];
    },

    clearAllUnlocks: (state) => {
      state.unlockedChapters = [];
      state.temporaryUnlocks = [];
    },

    mergeTemporaryToUnlocked: (state) => {
      // Merge temporary unlocks to permanent unlocks (used when user logs in)
      state.temporaryUnlocks.forEach((chapterId: string) => {
        if (!state.unlockedChapters.includes(chapterId)) {
          state.unlockedChapters.push(chapterId);
        }
      });
      state.temporaryUnlocks = [];
    },
  },
});

export const {
  unlockChapter,
  temporaryUnlock,
  syncUnlockedChapters,
  clearTemporaryUnlocks,
  clearAllUnlocks,
  mergeTemporaryToUnlocked,
} = unlockSlice.actions;

export default unlockSlice.reducer;
