import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { AppMode, NodeInfo, ValidatorInfo, XandeumPNodeInfo } from '../types';

interface AppModeState {
  // Current app mode
  currentMode: AppMode;
  
  // Data for each mode
  normalValidators: ValidatorInfo[];
  xandeumPNodes: XandeumPNodeInfo[];
  
  // Loading states
  loading: {
    normal: boolean;
    xandeum: boolean;
  };
  
  // Error states
  errors: {
    normal: string | null;
    xandeum: string | null;
  };
  
  // Filters and search for each mode
  filters: {
    normal: {
      search: string;
      status: 'all' | 'active' | 'delinquent' | 'inactive';
      minApy: number;
      maxCommission: number;
      country: string;
    };
    xandeum: {
      search: string;
      rewardStructure: 'all' | 'fixed' | 'dynamic';
      minXandeumApy: number;
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
    xandeum: {
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
  setXandeumPNodes: (pnodes: XandeumPNodeInfo[]) => void;
  updateValidator: (address: string, updates: Partial<ValidatorInfo>) => void;
  updatePNode: (address: string, updates: Partial<XandeumPNodeInfo>) => void;
  
  // Loading states
  setLoading: (mode: AppMode, loading: boolean) => void;
  
  // Error handling
  setError: (mode: AppMode, error: string | null) => void;
  clearErrors: () => void;
  
  // Filtering
  updateNormalFilters: (filters: Partial<AppModeState['filters']['normal']>) => void;
  updateXandeumFilters: (filters: Partial<AppModeState['filters']['xandeum']>) => void;
  resetFilters: (mode?: AppMode) => void;
  
  // Pagination
  setNormalPagination: (page: number, itemsPerPage?: number) => void;
  setXandeumPagination: (page: number, itemsPerPage?: number) => void;
  
  // Node selection
  selectNode: (node: NodeInfo) => void;
  unselectNode: (nodeAddress: string) => void;
  clearSelection: () => void;
  
  // Data fetching
  fetchNormalValidators: () => Promise<void>;
  fetchXandeumPNodes: () => Promise<void>;
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
    country: '',
  },
  xandeum: {
    search: '',
    rewardStructure: 'all' as const,
    minXandeumApy: 0,
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
  xandeum: {
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
        xandeumPNodes: [],
        loading: {
          normal: false,
          xandeum: false,
        },
        errors: {
          normal: null,
          xandeum: null,
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

        setXandeumPNodes: (pnodes: XandeumPNodeInfo[]) => {
          set(
            (state) => ({
              xandeumPNodes: pnodes,
              pagination: {
                ...state.pagination,
                xandeum: {
                  ...state.pagination.xandeum,
                  totalItems: pnodes.length,
                },
              },
            }),
            false,
            'setXandeumPNodes'
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

        updatePNode: (address: string, updates: Partial<XandeumPNodeInfo>) => {
          set(
            (state) => ({
              xandeumPNodes: state.xandeumPNodes.map((pnode) =>
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
                xandeum: null,
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

        updateXandeumFilters: (filters) => {
          set(
            (state) => ({
              filters: {
                ...state.filters,
                xandeum: {
                  ...state.filters.xandeum,
                  ...filters,
                },
              },
              pagination: {
                ...state.pagination,
                xandeum: {
                  ...state.pagination.xandeum,
                  currentPage: 1, // Reset to first page when filtering
                },
              },
            }),
            false,
            'updateXandeumFilters'
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

        setXandeumPagination: (page: number, itemsPerPage?: number) => {
          set(
            (state) => ({
              pagination: {
                ...state.pagination,
                xandeum: {
                  ...state.pagination.xandeum,
                  currentPage: page,
                  ...(itemsPerPage && { itemsPerPage }),
                },
              },
            }),
            false,
            'setXandeumPagination'
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

        fetchXandeumPNodes: async () => {
          const { setLoading, setError, setXandeumPNodes } = get();
          
          try {
            setLoading('xandeum', true);
            setError('xandeum', null);
            
            // TODO: Replace with actual Xandeum PNode API endpoint
            const response = await fetch('/api/xandeum/pnodes');
            if (!response.ok) {
              throw new Error('Failed to fetch Xandeum PNodes');
            }
            
            const pnodes = await response.json();
            setXandeumPNodes(pnodes);
          } catch (error) {
            setError('xandeum', error instanceof Error ? error.message : 'Unknown error');
            // For now, set empty array if API doesn't exist yet
            setXandeumPNodes([]);
          } finally {
            setLoading('xandeum', false);
          }
        },

        refreshCurrentMode: async () => {
          const { currentMode, fetchNormalValidators, fetchXandeumPNodes } = get();
          
          if (currentMode === 'normal') {
            await fetchNormalValidators();
          } else {
            await fetchXandeumPNodes();
          }
        },

        getCurrentNodes: () => {
          const { currentMode, normalValidators, xandeumPNodes } = get();
          return currentMode === 'normal' ? normalValidators : xandeumPNodes;
        },

        getFilteredNodes: () => {
          const { currentMode, normalValidators, xandeumPNodes, filters } = get();
          
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
            const { search, rewardStructure, minXandeumApy, maxLockPeriod, minEfficiency, maxCommission } = filters.xandeum;
            
            return xandeumPNodes.filter((pnode) => {
              const matchesSearch = !search || 
                pnode.name.toLowerCase().includes(search.toLowerCase()) ||
                pnode.address.toLowerCase().includes(search.toLowerCase());
              
              const matchesRewardStructure = rewardStructure === 'all' || pnode.rewardStructure === rewardStructure;
              const matchesApy = pnode.xandeumApy >= minXandeumApy;
              const matchesLockPeriod = pnode.lockPeriod <= maxLockPeriod;
              const matchesEfficiency = pnode.efficiency >= minEfficiency;
              const matchesCommission = pnode.xandeumCommission <= maxCommission;
              
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