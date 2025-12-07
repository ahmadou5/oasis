import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface StringState {
  value: string;
}
const initialState: StringState = {
  value: "",
};

const searchSlice = createSlice({
  name: "SearchString",
  initialState,
  reducers: {
    setSearchString: (state, action: PayloadAction<string>) => {
      state.value = action.payload;
    },
    clearSearchString: (state) => {
      state.value = "";
    },
  },
});

export const { setSearchString, clearSearchString } = searchSlice.actions;
export default searchSlice.reducer;
