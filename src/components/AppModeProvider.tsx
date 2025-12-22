'use client';

import React, { createContext, useContext, useEffect } from 'react';
import { useAppModeStore } from '../store/appModeStore';
import { AppMode, NodeInfo } from '../types';

interface AppModeContextType {
  // Current state
  currentMode: AppMode;
  isLoading: boolean;
  error: string | null;
  
  // Current data
  currentNodes: NodeInfo[];
  filteredNodes: NodeInfo[];
  selectedNodes: NodeInfo[];
  
  // Actions
  switchMode: (mode: AppMode) => void;
  refreshData: () => Promise<void>;
  selectNode: (node: NodeInfo) => void;
  unselectNode: (address: string) => void;
  clearSelection: () => void;
}

const AppModeContext = createContext<AppModeContextType | null>(null);

interface AppModeProviderProps {
  children: React.ReactNode;
  initialMode?: AppMode;
}

export const AppModeProvider: React.FC<AppModeProviderProps> = ({ 
  children, 
  initialMode = 'normal' 
}) => {
  const store = useAppModeStore();
  
  // Initialize the store with the initial mode
  useEffect(() => {
    if (store.currentMode !== initialMode) {
      store.switchMode(initialMode);
    }
    
    // Auto-fetch data for the current mode on mount
    if (store.currentMode === 'normal' && store.normalValidators.length === 0) {
      store.fetchNormalValidators();
    } else if (store.currentMode === 'xendium' && store.xendiumPNodes.length === 0) {
      store.fetchXendiumPNodes();
    }
  }, [initialMode, store]);

  const contextValue: AppModeContextType = {
    // Current state
    currentMode: store.currentMode,
    isLoading: store.loading[store.currentMode],
    error: store.errors[store.currentMode],
    
    // Current data
    currentNodes: store.getCurrentNodes(),
    filteredNodes: store.getFilteredNodes(),
    selectedNodes: store.selectedNodes,
    
    // Actions
    switchMode: (mode: AppMode) => {
      store.switchMode(mode);
      // Auto-fetch data when switching modes
      if (mode === 'normal' && store.normalValidators.length === 0) {
        store.fetchNormalValidators();
      } else if (mode === 'xendium' && store.xendiumPNodes.length === 0) {
        store.fetchXendiumPNodes();
      }
    },
    refreshData: store.refreshCurrentMode,
    selectNode: store.selectNode,
    unselectNode: store.unselectNode,
    clearSelection: store.clearSelection,
  };

  return (
    <AppModeContext.Provider value={contextValue}>
      {children}
    </AppModeContext.Provider>
  );
};

// Custom hook to use the AppMode context
export const useAppMode = () => {
  const context = useContext(AppModeContext);
  
  if (!context) {
    throw new Error('useAppMode must be used within an AppModeProvider');
  }
  
  return context;
};

export default AppModeProvider;