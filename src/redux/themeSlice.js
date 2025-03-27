import { createSlice } from '@reduxjs/toolkit';

const themeSlice = createSlice({
  name: 'theme',
  initialState: {
    isDarkMode: false, // Default to light mode
  },
  reducers: {
    toggleTheme: (state) => {
      state.isDarkMode = !state.isDarkMode;
      // Save the theme preference to localStorage
      localStorage.setItem('isDarkMode', state.isDarkMode);
    },
    setThemeFromLocalStorage: (state) => {
      const storedTheme = localStorage.getItem('isDarkMode');
      if (storedTheme !== null) {
        state.isDarkMode = storedTheme === 'true';
      }
    },
  },
});

export const { toggleTheme, setThemeFromLocalStorage } = themeSlice.actions;
export default themeSlice.reducer;
