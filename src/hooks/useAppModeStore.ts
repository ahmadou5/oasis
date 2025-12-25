import { useAppModeStore } from '../store/appModeStore';
import { AppMode } from '../types';

/**
 * Custom hooks for different aspects of the app mode store
 * These provide focused access to specific store functionality
 */

// Hook for mode switching and current mode
export const useAppModeSwitch = () => {
  const currentMode = useAppModeStore((state) => state.currentMode);
  const switchMode = useAppModeStore((state) => state.switchMode);
  const loading = useAppModeStore((state) => state.loading);
  const errors = useAppModeStore((state) => state.errors);
  
  return {
    currentMode,
    switchMode,
    isLoading: loading[currentMode],
    error: errors[currentMode],
    isNormalMode: currentMode === 'normal',
    isXandeumMode: currentMode === 'xandeum',
  };
};

// Hook for validator data (normal mode)
export const useNormalValidators = () => {
  const validators = useAppModeStore((state) => state.normalValidators);
  const loading = useAppModeStore((state) => state.loading.normal);
  const error = useAppModeStore((state) => state.errors.normal);
  const filters = useAppModeStore((state) => state.filters.normal);
  const pagination = useAppModeStore((state) => state.pagination.normal);
  
  const setValidators = useAppModeStore((state) => state.setNormalValidators);
  const updateValidator = useAppModeStore((state) => state.updateValidator);
  const fetchValidators = useAppModeStore((state) => state.fetchNormalValidators);
  const updateFilters = useAppModeStore((state) => state.updateNormalFilters);
  const setPagination = useAppModeStore((state) => state.setNormalPagination);
  
  return {
    validators,
    loading,
    error,
    filters,
    pagination,
    setValidators,
    updateValidator,
    fetchValidators,
    updateFilters,
    setPagination,
  };
};

// Hook for Xandeum PNode data
export const useXandeumPNodes = () => {
  const pnodes = useAppModeStore((state) => state.xandeumPNodes);
  const loading = useAppModeStore((state) => state.loading.xandeum);
  const error = useAppModeStore((state) => state.errors.xandeum);
  const filters = useAppModeStore((state) => state.filters.xandeum);
  const pagination = useAppModeStore((state) => state.pagination.xandeum);
  
  const setPNodes = useAppModeStore((state) => state.setXandeumPNodes);
  const updatePNode = useAppModeStore((state) => state.updatePNode);
  const fetchPNodes = useAppModeStore((state) => state.fetchXandeumPNodes);
  const updateFilters = useAppModeStore((state) => state.updateXandeumFilters);
  const setPagination = useAppModeStore((state) => state.setXandeumPagination);
  
  return {
    pnodes,
    loading,
    error,
    filters,
    pagination,
    setPNodes,
    updatePNode,
    fetchPNodes,
    updateFilters,
    setPagination,
  };
};

// Hook for filtered and paginated data based on current mode
export const useCurrentModeData = () => {
  const currentMode = useAppModeStore((state) => state.currentMode);
  const getCurrentNodes = useAppModeStore((state) => state.getCurrentNodes);
  const getFilteredNodes = useAppModeStore((state) => state.getFilteredNodes);
  const refreshCurrentMode = useAppModeStore((state) => state.refreshCurrentMode);
  
  const loading = useAppModeStore((state) => state.loading[currentMode]);
  const error = useAppModeStore((state) => state.errors[currentMode]);
  const filters = useAppModeStore((state) => state.filters[currentMode]);
  const pagination = useAppModeStore((state) => state.pagination[currentMode]);
  
  const allNodes = getCurrentNodes();
  const filteredNodes = getFilteredNodes();
  
  // Apply pagination to filtered results
  const startIndex = (pagination.currentPage - 1) * pagination.itemsPerPage;
  const endIndex = startIndex + pagination.itemsPerPage;
  const paginatedNodes = filteredNodes.slice(startIndex, endIndex);
  
  return {
    currentMode,
    allNodes,
    filteredNodes,
    paginatedNodes,
    totalFilteredCount: filteredNodes.length,
    totalCount: allNodes.length,
    loading,
    error,
    filters,
    pagination,
    refreshData: refreshCurrentMode,
  };
};

// Hook for node selection
export const useNodeSelection = () => {
  const selectedNodes = useAppModeStore((state) => state.selectedNodes);
  const selectNode = useAppModeStore((state) => state.selectNode);
  const unselectNode = useAppModeStore((state) => state.unselectNode);
  const clearSelection = useAppModeStore((state) => state.clearSelection);
  const getSelectedNodesByMode = useAppModeStore((state) => state.getSelectedNodesByMode);
  
  const isNodeSelected = (nodeAddress: string) => {
    return selectedNodes.some((node) => node.address === nodeAddress);
  };
  
  const toggleNodeSelection = (node: any) => {
    if (isNodeSelected(node.address)) {
      unselectNode(node.address);
    } else {
      selectNode(node);
    }
  };
  
  return {
    selectedNodes,
    selectedCount: selectedNodes.length,
    selectNode,
    unselectNode,
    clearSelection,
    isNodeSelected,
    toggleNodeSelection,
    getSelectedNodesByMode,
  };
};

// Hook for filter management
export const useFilters = () => {
  const currentMode = useAppModeStore((state) => state.currentMode);
  const updateNormalFilters = useAppModeStore((state) => state.updateNormalFilters);
  const updateXandeumFilters = useAppModeStore((state) => state.updateXandeumFilters);
  const resetFilters = useAppModeStore((state) => state.resetFilters);
  
  const updateCurrentFilters = (filters: any) => {
    if (currentMode === 'normal') {
      updateNormalFilters(filters);
    } else {
      updateXandeumFilters(filters);
    }
  };
  
  return {
    currentMode,
    updateNormalFilters,
    updateXandeumFilters,
    updateCurrentFilters,
    resetFilters,
  };
};

// Hook for pagination management
export const usePagination = () => {
  const currentMode = useAppModeStore((state) => state.currentMode);
  const setNormalPagination = useAppModeStore((state) => state.setNormalPagination);
  const setXandeumPagination = useAppModeStore((state) => state.setXandeumPagination);
  
  const setCurrentPagination = (page: number, itemsPerPage?: number) => {
    if (currentMode === 'normal') {
      setNormalPagination(page, itemsPerPage);
    } else {
      setXandeumPagination(page, itemsPerPage);
    }
  };
  
  return {
    currentMode,
    setNormalPagination,
    setXandeumPagination,
    setCurrentPagination,
  };
};