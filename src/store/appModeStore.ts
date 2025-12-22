import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { AppMode, NodeInfo, ValidatorInfo, XendiumPNodeInfo } from '../types';

interface AppModeState {
  // Current app mode
  currentMode: AppMode;
  
  // Data for each mode
  normalValidators: ValidatorInfo[];
  xendiumPNodes: XendiumPNodeInfo[];
  
  // Loading states
  loading: {
    normal: boolean;
    xendium: boolean;
  };
  
  // Error states
  errors: {
    normal: string | null;
    xendium: string | null;
  };
  
  // Filters and search for each mode
  filters: {
    normal: {
      search: string;
      status: 'all' | 'active' | 'delinquent' | 'inactive';
      minApy: number;
      maxCommission: number;
      country?: string;
    };
    xendium: {
      search: string;
      rewardStructure: 'all' | 'fixed' | 'dynamic';
      minXendiumApy: number;
      maxLockPeriod: number;
      minEfficiency: number;
      maxCommission: number;
    };
  };
  
  // Pagination
  pagination: {
    normal: {
      currentPage: number;
      itemsPerPage: number;
      totalItems: number;
    };
    xendium: {
      currentPage: number;
      itemsPerPage: number;
      totalItems: number;
    };
  };
  
  // Selected nodes for comparison/staking
  selectedNodes: NodeInfo[];
}

interface AppModeActions {
  // Mode switching
  switchMode: (mode: AppMode) => void;
  
  // Data management
  setNormalValidators: (validators: ValidatorInfo[]) => void;
  setXendiumPNodes: (pnodes: XendiumPNodeInfo[]) => void;
  updateValidator: (address: string, updates: Partial<ValidatorInfo>) => void;
  updatePNode: (address: string, updates: Partial<XendiumPNodeInfo>) => void;
  
  // Loading states
  setLoading: (mode: AppMode, loading: boolean) => void;
  
  // Error handling
  setError: (mode: AppMode, error: string | null) => void;
  clearErrors: () => void;
  
  // Filtering
  updateNormalFilters: (filters: Partial<AppModeState['filters']['normal']>) => void;
  updateXendiumFilters: (filters: Partial<AppModeState['filters']['xendium']>) => void;
  resetFilters: (mode?: AppMode) => void;
  
  // Pagination
  setNormalPagination: (page: number, itemsPerPage?: number) => void;
  setXendiumPagination: (page: number, itemsPerPage?: number) => void;
  
  // Node selection
  selectNode: (node: NodeInfo) => void;
  unselectNode: (nodeAddress: string) => void;
  clearSelection: () => void;
  
  // Data fetching
  fetchNormalValidators: () => Promise<void>;
  fetchXendiumPNodes: () => Promise<void>;
  refreshCurrentMode: () => Promise<void>;
  
  // Computed getters
  getCurrentNodes: () => NodeInfo[];
  getFilteredNodes: () => NodeInfo[];
  getSelectedNodesByMode: (mode: AppMode) => NodeInfo[];
}

type AppModeStore = AppModeState & AppModeActions;

const initialFilters = {
  normal: {
    search: '',
    status: 'all' as const,
    minApy: 0,
    maxCommission: 100,
    country: undefined,
  },
  xendium: {
    search: '',
    rewardStructure: 'all' as const,
    minXendiumApy: 0,
    maxLockPeriod: 1000,
    minEfficiency: 0,
    maxCommission: 100,
  },
};

const initialPagination = {
  normal: {
    currentPage: 1,
    itemsPerPage: 20,
    totalItems: 0,
  },
  xendium: {
    currentPage: 1,
    itemsPerPage: 20,
    totalItems: 0,
  },
};

export const useAppModeStore = create<AppModeStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        currentMode: 'normal',
        normalValidators: [],
        xendiumPNodes: [],
        loading: {
          normal: false,
          xendium: false,
        },
        errors: {
          normal: null,
          xendium: null,
        },
        filters: initialFilters,
        pagination: initialPagination,
        selectedNodes: [],

        // Actions
        switchMode: (mode: AppMode) => {
          set({ currentMode: mode }, false, 'switchMode');
        },

        setNormalValidators: (validators: ValidatorInfo[]) => {
          set(
            (state) => ({
              normalValidators: validators,
              pagination: {
                ...state.pagination,
                normal: {
                  ...state.pagination.normal,
                  totalItems: validators.length,
                },
              },
            }),
            false,
            'setNormalValidators'
          );
        },

        setXendiumPNodes: (pnodes: XendiumPNodeInfo[]) => {
          set(
            (state) => ({
              xendiumPNodes: pnodes,
              pagination: {
                ...state.pagination,
                xendium: {
                  ...state.pagination.xendium,
                  totalItems: pnodes.length,
                },
              },
            }),
            false,
            'setXendiumPNodes'
          );
        },

        updateValidator: (address: string, updates: Partial<ValidatorInfo>) => {
          set(
            (state) => ({
              normalValidators: state.normalValidators.map((validator) =>
                validator.address === address ? { ...validator, ...updates } : validator
              ),
            }),
            false,
            'updateValidator'
          );
        },

        updatePNode: (address: string, updates: Partial<XendiumPNodeInfo>) => {
          set(
            (state) => ({
              xendiumPNodes: state.xendiumPNodes.map((pnode) =>
                pnode.address === address ? { ...pnode, ...updates } : pnode
              ),
            }),
            false,
            'updatePNode'
          );
        },

        setLoading: (mode: AppMode, loading: boolean) => {
          set(
            (state) => ({
              loading: {
                ...state.loading,
                [mode]: loading,
              },
            }),
            false,
            'setLoading'
          );
        },

        setError: (mode: AppMode, error: string | null) => {
          set(
            (state) => ({
              errors: {
                ...state.errors,
                [mode]: error,
              },
            }),
            false,
            'setError'
          );
        },

        clearErrors: () => {
          set(
            {
              errors: {
                normal: null,
                xendium: null,
              },
            },
            false,
            'clearErrors'
          );
        },

        updateNormalFilters: (filters) => {
          set(
            (state) => ({
              filters: {
                ...state.filters,
                normal: {
                  ...state.filters.normal,
                  ...filters,
                },
              },
              pagination: {
                ...state.pagination,
                normal: {
                  ...state.pagination.normal,
                  currentPage: 1, // Reset to first page when filtering
                },
              },
            }),
            false,
            'updateNormalFilters'
          );
        },

        updateXendiumFilters: (filters) => {
          set(
            (state) => ({
              filters: {
                ...state.filters,
                xendium: {
                  ...state.filters.xendium,
                  ...filters,
                },
              },
              pagination: {
                ...state.pagination,
                xendium: {
                  ...state.pagination.xendium,
                  currentPage: 1, // Reset to first page when filtering
                },
              },
            }),
            false,
            'updateXendiumFilters'
          );
        },

        resetFilters: (mode?: AppMode) => {
          set(
            (state) => ({
              filters: {
                ...state.filters,
                ...(mode ? { [mode]: initialFilters[mode] } : initialFilters),
              },
            }),
            false,
            'resetFilters'
          );
        },

        setNormalPagination: (page: number, itemsPerPage?: number) => {
          set(
            (state) => ({
              pagination: {
                ...state.pagination,
                normal: {
                  ...state.pagination.normal,
                  currentPage: page,
                  ...(itemsPerPage && { itemsPerPage }),
                },
              },
            }),
            false,
            'setNormalPagination'
          );
        },

        setXendiumPagination: (page: number, itemsPerPage?: number) => {
          set(
            (state) => ({
              pagination: {
                ...state.pagination,
                xendium: {
                  ...state.pagination.xendium,
                  currentPage: page,
                  ...(itemsPerPage && { itemsPerPage }),
                },
              },
            }),
            false,
            'setXendiumPagination'
          );
        },

        selectNode: (node: NodeInfo) => {
          set(
            (state) => {
              const isAlreadySelected = state.selectedNodes.some(
                (n) => n.address === node.address
              );
              if (isAlreadySelected) return state;
              
              return {
                selectedNodes: [...state.selectedNodes, node],
              };
            },
            false,
            'selectNode'
          );
        },

        unselectNode: (nodeAddress: string) => {
          set(
            (state) => ({
              selectedNodes: state.selectedNodes.filter(
                (node) => node.address !== nodeAddress
              ),
            }),
            false,
            'unselectNode'
          );
        },

        clearSelection: () => {
          set({ selectedNodes: [] }, false, 'clearSelection');
        },

        fetchNormalValidators: async () => {
          const { setLoading, setError, setNormalValidators } = get();
          
          try {
            setLoading('normal', true);
            setError('normal', null);
            
            const response = await fetch('/api/validators');
            if (!response.ok) {
              throw new Error('Failed to fetch validators');
            }
            
            const validators = await response.json();
            setNormalValidators(validators);
          } catch (error) {
            setError('normal', error instanceof Error ? error.message : 'Unknown error');
          } finally {
            setLoading('normal', false);
          }
        },

        fetchXendiumPNodes: async () => {
          const { setLoading, setError, setXendiumPNodes } = get();
          
          try {
            setLoading('xendium', true);
            setError('xendium', null);
            
            // TODO: Replace with actual Xendium PNode API endpoint
            const response = await fetch('/api/xendium/pnodes');
            if (!response.ok) {
              throw new Error('Failed to fetch Xendium PNodes');
            }
            
            const pnodes = await response.json();
            setXendiumPNodes(pnodes);
          } catch (error) {
            setError('xendium', error instanceof Error ? error.message : 'Unknown error');
            // For now, set empty array if API doesn't exist yet
            setXendiumPNodes([]);
          } finally {
            setLoading('xendium', false);
          }
        },

        refreshCurrentMode: async () => {
          const { currentMode, fetchNormalValidators, fetchXendiumPNodes } = get();
          
          if (currentMode === 'normal') {
            await fetchNormalValidators();
          } else {
            await fetchXendiumPNodes();
          }
        },

        getCurrentNodes: () => {
          const { currentMode, normalValidators, xendiumPNodes } = get();
          return currentMode === 'normal' ? normalValidators : xendiumPNodes;
        },

        getFilteredNodes: () => {
          const { currentMode, normalValidators, xendiumPNodes, filters } = get();
          
          if (currentMode === 'normal') {
            const { search, status, minApy, maxCommission, country } = filters.normal;
            
            return normalValidators.filter((validator) => {
              const matchesSearch = !search || 
                validator.name.toLowerCase().includes(search.toLowerCase()) ||
                validator.address.toLowerCase().includes(search.toLowerCase());
              
              const matchesStatus = status === 'all' || validator.status === status;
              const matchesApy = validator.apy >= minApy;
              const matchesCommission = validator.commission <= maxCommission;
              const matchesCountry = !country || validator.country === country;
              
              return matchesSearch && matchesStatus && matchesApy && matchesCommission && matchesCountry;
            });
          } else {
            const { search, rewardStructure, minXendiumApy, maxLockPeriod, minEfficiency, maxCommission } = filters.xendium;
            
            return xendiumPNodes.filter((pnode) => {
              const matchesSearch = !search || 
                pnode.name.toLowerCase().includes(search.toLowerCase()) ||
                pnode.address.toLowerCase().includes(search.toLowerCase());
              
              const matchesRewardStructure = rewardStructure === 'all' || pnode.rewardStructure === rewardStructure;
              const matchesApy = pnode.xendiumApy >= minXendiumApy;
              const matchesLockPeriod = pnode.lockPeriod <= maxLockPeriod;
              const matchesEfficiency = pnode.efficiency >= minEfficiency;
              const matchesCommission = pnode.xendiumCommission <= maxCommission;
              
              return matchesSearch && matchesRewardStructure && matchesApy && 
                     matchesLockPeriod && matchesEfficiency && matchesCommission;
            });
          }
        },

        getSelectedNodesByMode: (mode: AppMode) => {
          const { selectedNodes } = get();
          
          if (mode === 'normal') {
            return selectedNodes.filter((node) => !('nodeType' in node));
          } else {
            return selectedNodes.filter((node) => 'nodeType' in node && node.nodeType === 'pnode');
          }
        },
      }),
      {
        name: 'app-mode-storage',
        partialize: (state) => ({
          currentMode: state.currentMode,
          filters: state.filters,
          pagination: state.pagination,
          selectedNodes: state.selectedNodes,
        }),
      }
    ),
    { name: 'AppModeStore' }
  )
);

export default useAppModeStore;