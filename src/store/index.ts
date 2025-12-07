import { configureStore } from "@reduxjs/toolkit";
import validatorReducer from "./slices/validatorSlice";
import stakingReducer from "./slices/stakingSlice";
import walletReducer from "./slices/walletSlice";
import searchReducer from "./slices/searchSlice";

export const store = configureStore({
  reducer: {
    validators: validatorReducer,
    staking: stakingReducer,
    wallet: walletReducer,
    search: searchReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["wallet/setConnection", "wallet/setWallet"],
        ignoredPaths: ["wallet.connection", "wallet.wallet"],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
