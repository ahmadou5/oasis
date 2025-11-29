import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

export interface ValidatorInfo {
  address: string;
  name: string;
  commission: number;
  stake: number;
  apy: number;
  delegatedStake: number;
  skipRate: number;
  dataCenter: string;
  website?: string;
  description?: string;
  avatar?: string;
  status: "active" | "delinquent" | "inactive";
  epochCredits: number[];
  votingPubkey: string;
  activatedStake: number;
  lastVote: number;
  rootSlot: number;
  // Enhanced metadata from Solana Beach
  country?: string;
  keybaseUsername?: string;
  twitterUsername?: string;
  uptime?: number;
  performanceHistory: Array<{
    epoch: number;
    activeStake: number; // NEW
    activeStakeAccounts: number; // NEW
    skipRate: number;
    credits: number;
    apy: number;
  }>;
}

export interface ValidatorFilters {
  search: string;
  minApy: number;
  maxCommission: number;
  sortBy: "name" | "apy" | "commission" | "stake";
  sortOrder: "asc" | "desc";
  showOnlyActive: boolean;
}

export interface PaginationInfo {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

interface ValidatorState {
  validators: ValidatorInfo[];
  filteredValidators: ValidatorInfo[];
  displayedValidators: ValidatorInfo[];
  selectedValidator: ValidatorInfo | null;
  filters: ValidatorFilters;
  pagination: PaginationInfo;
  loading: boolean;
  error: string | null;
  lastUpdated: number | null;
}

const initialState: ValidatorState = {
  validators: [],
  filteredValidators: [],
  displayedValidators: [],
  selectedValidator: null,
  filters: {
    search: "",
    minApy: 0,
    maxCommission: 10,
    sortBy: "apy",
    sortOrder: "desc",
    showOnlyActive: true,
  },
  pagination: {
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0,
  },
  loading: false,
  error: null,
  lastUpdated: null,
};

export const fetchValidators = createAsyncThunk(
  "validators/fetchValidators",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch("/api/validators");
      if (!response.ok) {
        throw new Error("Failed to fetch validators");
      }
      return await response.json();
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }
);

const validatorSlice = createSlice({
  name: "validators",
  initialState,
  reducers: {
    setSelectedValidator: (
      state,
      action: PayloadAction<ValidatorInfo | null>
    ) => {
      state.selectedValidator = action.payload;
    },
    updateFilters: (
      state,
      action: PayloadAction<Partial<ValidatorFilters>>
    ) => {
      state.filters = { ...state.filters, ...action.payload };
      state.filteredValidators = applyFilters(state.validators, state.filters);
      state.pagination.page = 1; // Reset to first page when filters change
      applyPagination(state);
    },
    updatePagination: (
      state,
      action: PayloadAction<{ page?: number; pageSize?: number }>
    ) => {
      if (action.payload.page !== undefined) {
        state.pagination.page = action.payload.page;
      }
      if (action.payload.pageSize !== undefined) {
        state.pagination.pageSize = action.payload.pageSize;
        state.pagination.page = 1; // Reset to first page when page size changes
      }
      applyPagination(state);
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchValidators.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchValidators.fulfilled, (state, action) => {
        state.loading = false;
        state.validators = action.payload;
        state.filteredValidators = applyFilters(action.payload, state.filters);
        state.pagination.page = 1;
        applyPagination(state);
        state.lastUpdated = Date.now();
      })
      .addCase(fetchValidators.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

function applyFilters(
  validators: ValidatorInfo[],
  filters: ValidatorFilters
): ValidatorInfo[] {
  let filtered = [...validators];

  // Filter by search term
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filtered = filtered.filter(
      (v) =>
        v.name.toLowerCase().includes(searchLower) ||
        v.address.toLowerCase().includes(searchLower)
    );
  }

  // Filter by status
  if (filters.showOnlyActive) {
    filtered = filtered.filter((v) => v.status === "active");
  }

  // Filter by APY
  filtered = filtered.filter((v) => v.apy >= filters.minApy);

  // Filter by commission
  filtered = filtered.filter((v) => v.commission <= filters.maxCommission);

  // Sort
  filtered.sort((a, b) => {
    const aValue = a[filters.sortBy];
    const bValue = b[filters.sortBy];

    if (typeof aValue === "string" && typeof bValue === "string") {
      return filters.sortOrder === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    if (typeof aValue === "number" && typeof bValue === "number") {
      return filters.sortOrder === "asc" ? aValue - bValue : bValue - aValue;
    }

    return 0;
  });

  return filtered;
}

function applyPagination(state: ValidatorState) {
  const { page, pageSize } = state.pagination;
  const total = state.filteredValidators.length;
  const totalPages = Math.ceil(total / pageSize);

  state.pagination = {
    ...state.pagination,
    total,
    totalPages,
    page: Math.min(page, Math.max(1, totalPages)), // Ensure page is within bounds
  };

  // Update displayed validators based on current page
  const startIndex = (state.pagination.page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  state.displayedValidators = state.filteredValidators.slice(
    startIndex,
    endIndex
  );
}

export const {
  setSelectedValidator,
  updateFilters,
  updatePagination,
  clearError,
} = validatorSlice.actions;
export default validatorSlice.reducer;
