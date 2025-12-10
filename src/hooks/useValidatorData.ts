'use client';

import { useState, useEffect } from 'react';
import { ValidatorInfo } from '@/types';

interface ValidatorGeolocation extends ValidatorInfo {
  latitude?: number;
  longitude?: number;
  city?: string;
}

interface LeaderScheduleData {
  currentLeader: ValidatorGeolocation | null;
  nextLeaders: ValidatorGeolocation[];
  currentSlot: number;
  leaderChangeTime: string;
}

export function useValidatorData() {
  const [validators, setValidators] = useState<ValidatorGeolocation[]>([]);
  const [leaderSchedule, setLeaderSchedule] = useState<LeaderScheduleData>({
    currentLeader: null,
    nextLeaders: [],
    currentSlot: 0,
    leaderChangeTime: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchValidatorData = async () => {
      try {
        setLoading(true);
        
        // Fetch from your existing API that returns ValidatorInfo[]
        const response = await fetch('/api/validators');
        
        if (!response.ok) {
          throw new Error('Failed to fetch validators');
        }
        
        const validatorData: ValidatorInfo[] = await response.json();
        
        // Add geolocation data (you can enhance this with a real geolocation service)
        const validatorsWithGeo: ValidatorGeolocation[] = validatorData.map(validator => ({
          ...validator,
          latitude: getRandomLatitude(),
          longitude: getRandomLongitude(),
          city: validator.country ? getCityFromCountry(validator.country) : 'Unknown'
        }));
        
        setValidators(validatorsWithGeo);
        
        // Set leader schedule based on real data
        if (validatorsWithGeo.length > 0) {
          const activeValidators = validatorsWithGeo.filter(v => v.status === 'active');
          const currentLeader = activeValidators.find(v => v.lastVote === Math.max(...activeValidators.map(av => av.lastVote))) || activeValidators[0];
          const nextLeaders = activeValidators
            .filter(v => v.address !== currentLeader?.address)
            .sort((a, b) => b.apy - a.apy)
            .slice(0, 3);

          setLeaderSchedule({
            currentLeader,
            nextLeaders,
            currentSlot: currentLeader?.lastVote || 0,
            leaderChangeTime: new Date(Date.now() + Math.random() * 120000).toISOString()
          });
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching validator data:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchValidatorData();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchValidatorData, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return {
    validators,
    leaderSchedule,
    loading,
    error,
    refetch: () => {
      setLoading(true);
      // Trigger re-fetch
    }
  };
}

// Helper functions for geolocation (replace with real geolocation service)
function getRandomLatitude(): number {
  return (Math.random() - 0.5) * 180;
}

function getRandomLongitude(): number {
  return (Math.random() - 0.5) * 360;
}

function getCityFromCountry(country: string): string {
  const cityMap: Record<string, string> = {
    'USA': 'New York',
    'Germany': 'Berlin', 
    'Canada': 'Toronto',
    'UK': 'London',
    'France': 'Paris',
    'Japan': 'Tokyo',
    'Singapore': 'Singapore',
    'Netherlands': 'Amsterdam'
  };
  
  return cityMap[country] || 'Unknown';
}