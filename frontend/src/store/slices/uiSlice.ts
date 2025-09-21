import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { UIState } from "../../types";

const initialState: UIState = {
  sidebarOpen: false,
  theme: "light",
  audioPlayerOpen: false,
  currentAudio: undefined,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    toggleTheme: (state) => {
      state.theme = state.theme === "light" ? "dark" : "light";
    },
    setTheme: (state, action: PayloadAction<"light" | "dark">) => {
      state.theme = action.payload;
    },
    openAudioPlayer: (
      state,
      action: PayloadAction<UIState["currentAudio"]>
    ) => {
      state.audioPlayerOpen = true;
      state.currentAudio = action.payload;
    },
    closeAudioPlayer: (state) => {
      state.audioPlayerOpen = false;
      state.currentAudio = undefined;
    },
    updateCurrentAudio: (
      state,
      action: PayloadAction<Partial<UIState["currentAudio"]>>
    ) => {
      if (state.currentAudio) {
        state.currentAudio = { ...state.currentAudio, ...action.payload };
      }
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  toggleTheme,
  setTheme,
  openAudioPlayer,
  closeAudioPlayer,
  updateCurrentAudio,
} = uiSlice.actions;

export default uiSlice.reducer;
