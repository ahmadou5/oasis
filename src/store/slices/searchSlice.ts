import { createSlice, PayloadAction, combineReducers } from "@reduxjs/toolkit";

interface SearchState {
  value: string;
}

const initialSearchState: SearchState = {
  value: "",
};

// Validator search slice
const validatorSearchSlice = createSlice({
  name: "validatorSearch",
  initialState: initialSearchState,
  reducers: {
    setSearchString: (state, action: PayloadAction<string>) => {
      state.value = action.payload;
    },
    clearSearchString: (state) => {
      state.value = "";
    },
  },
});

// PNodes search slice
const pnodesSearchSlice = createSlice({
  name: "pnodesSearch", 
  initialState: initialSearchState,
  reducers: {
    setSearchString: (state, action: PayloadAction<string>) => {
      state.value = action.payload;
    },
    clearSearchString: (state) => {
      state.value = "";
    },
  },
});

// Combined search reducer
const searchReducer = combineReducers({
  validators: validatorSearchSlice.reducer,
  pnodes: pnodesSearchSlice.reducer,
});

// Export action creators with descriptive names
export const {
  setSearchString: setValidatorSearchString,
  clearSearchString: clearValidatorSearchString,
} = validatorSearchSlice.actions;

export const {
  setSearchString: setPnodesSearchString,
  clearSearchString: clearPnodesSearchString,
} = pnodesSearchSlice.actions;

// Export the combined reducer as default
export default searchReducer;
