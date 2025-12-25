import { useEffect, useState } from "react";
import { XandeumNodeWithMetrics } from '@/types';

interface PNodesState {
  pnodes: XandeumNodeWithMetrics[];
  loading: boolean;
  error: string | null;
}

export const usePnodes = () => {
  const [state, setState] = useState<PNodesState>({
    pnodes: [],
    loading: false,
    error: null,
  });

  const fetchPnodes = async (params?: {
    limit?: number;
    offset?: number;
    status?: 'active' | 'inactive' | 'all';
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      // Build query string
      const searchParams = new URLSearchParams();
      if (params?.limit) searchParams.set('limit', params.limit.toString());
      if (params?.offset) searchParams.set('offset', params.offset.toString());
      if (params?.status) searchParams.set('status', params.status);
      if (params?.sortBy) searchParams.set('sortBy', params.sortBy);
      if (params?.sortOrder) searchParams.set('sortOrder', params.sortOrder);
      
      const url = `/api/xandeum/pnodes${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
      
      const response = await fetch(url);
      const result = await response.json();
      
      if (!response.ok) {
        const errorMessage = result.error?.message || result.message || 'Failed to fetch PNodes';
        throw new Error(errorMessage);
      }
      
      if (!result.success) {
        throw new Error(result.error?.message || 'API request was not successful');
      }
      
      setState({
        pnodes: result.data || [],
        loading: false,
        error: null,
      });
      
      console.log('Xandeum PNodes fetched:', {
        count: result.metadata?.count,
        cacheHit: result.metadata?.cacheHit,
        timestamp: result.metadata?.timestamp,
        data: result.data
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      
      console.error('Error fetching PNodes:', error);
    }
  };

  useEffect(() => {
    fetchPnodes();
  }, []);

  return {
    pnodes: state.pnodes,
    loading: state.loading,
    error: state.error,
    refetch: fetchPnodes,
    fetchPnodes, // Expose the parameterized version
  };
};
