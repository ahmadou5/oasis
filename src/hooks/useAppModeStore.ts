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
    isXendiumMode: currentMode === 'xendium',
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

// Hook for Xendium PNode data
export const useXendiumPNodes = () => {
  const pnodes = useAppModeStore((state) => state.xendiumPNodes);
  const loading = useAppModeStore((state) => state.loading.xendium);
  const error = useAppModeStore((state) => state.errors.xendium);
  const filters = useAppModeStore((state) => state.filters.xendium);
  const pagination = useAppModeStore((state) => state.pagination.xendium);
  
  const setPNodes = useAppModeStore((state) => state.setXendiumPNodes);
  const updatePNode = useAppModeStore((state) => state.updatePNode);
  const fetchPNodes = useAppModeStore((state) => state.fetchXendiumPNodes);
  const updateFilters = useAppModeStore((state) => state.updateXendiumFilters);
  const setPagination = useAppModeStore((state) => state.setXendiumPagination);
  
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
  const updateXendiumFilters = useAppModeStore((state) => state.updateXendiumFilters);
  const resetFilters = useAppModeStore((state) => state.resetFilters);
  
  const updateCurrentFilters = (filters: any) => {
    if (currentMode === 'normal') {
      updateNormalFilters(filters);
    } else {
      updateXendiumFilters(filters);
    }
  };
  
  return {
    currentMode,
    updateNormalFilters,
    updateXendiumFilters,
    updateCurrentFilters,
    resetFilters,
  };
};

// Hook for pagination management
export const usePagination = () => {
  const currentMode = useAppModeStore((state) => state.currentMode);
  const setNormalPagination = useAppModeStore((state) => state.setNormalPagination);
  const setXendiumPagination = useAppModeStore((state) => state.setXendiumPagination);
  
  const setCurrentPagination = (page: number, itemsPerPage?: number) => {
    if (currentMode === 'normal') {
      setNormalPagination(page, itemsPerPage);
    } else {
      setXendiumPagination(page, itemsPerPage);
    }
  };
  
  return {
    currentMode,
    setNormalPagination,
    setXendiumPagination,
    setCurrentPagination,
  };
};