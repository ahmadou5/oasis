import { ValidatorInfo, NodeLocation } from "@/types";

/**
 * Enriches validator data with location information
 */
export async function enrichValidatorsWithLocation(
  validators: ValidatorInfo[]
): Promise<ValidatorInfo[]> {
  try {
    const response = await fetch('/api/validators/geolocate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        validators: validators.map(v => ({
          address: v.address,
          dataCenter: v.dataCenter,
          country: v.country,
          city: v.city,
        }))
      }),
    });

    if (!response.ok) {
      console.warn('Failed to fetch validator locations');
      return validators;
    }

    const geoData = await response.json();
    
    return validators.map(validator => {
      const locationData = geoData.find((geo: any) => geo.address === validator.address);
      
      if (locationData && locationData.coordinates) {
        const [longitude, latitude] = locationData.coordinates;
        
        const location: NodeLocation = {
          coordinates: [longitude, latitude],
          city: locationData.city || validator.city,
          country: locationData.country || validator.country,
          countryCode: locationData.countryCode,
          // Helper computed properties
          latitude,
          longitude,
          lat: latitude,
          lng: longitude,
        };

        return {
          ...validator,
          location,
          city: locationData.city || validator.city,
          country: locationData.country || validator.country,
          region: locationData.region || validator.region,
          continent: locationData.continent || validator.continent,
        };
      }

      return validator;
    });
  } catch (error) {
    console.error('Error enriching validators with location:', error);
    return validators;
  }
}

/**
 * Converts data center string to a location key for the geolocate API
 */
export function getLocationFromDataCenter(dataCenter: string): string {
  // Clean up common data center naming patterns
  const cleaned = dataCenter
    .replace(/\(.*?\)/g, '') // Remove parentheses content
    .replace(/\d+/g, '') // Remove numbers
    .replace(/[-_]/g, ' ') // Replace dashes and underscores with spaces
    .trim();

  // Common mappings for data center names to city, country format
  const locationMappings: Record<string, string> = {
    'frankfurt': 'Frankfurt, Germany',
    'new york': 'New York, United States',
    'san francisco': 'San Francisco, United States',
    'london': 'London, United Kingdom',
    'tokyo': 'Tokyo, Japan',
    'singapore': 'Singapore, Singapore',
    'amsterdam': 'Amsterdam, Netherlands',
    'paris': 'Paris, France',
    'sydney': 'Sydney, Australia',
    'toronto': 'Toronto, Canada',
    'dublin': 'Dublin, Ireland',
    'seoul': 'Seoul, South Korea',
    'mumbai': 'Mumbai, India',
    'aws us east': 'New York, United States',
    'aws us west': 'San Francisco, United States',
    'aws eu west': 'London, United Kingdom',
    'gcp us central': 'New York, United States',
    'gcp europe west': 'Amsterdam, Netherlands',
    'azure east us': 'New York, United States',
    'azure west europe': 'Amsterdam, Netherlands',
  };

  const lowerCleaned = cleaned.toLowerCase();
  
  // Check for exact matches first
  if (locationMappings[lowerCleaned]) {
    return locationMappings[lowerCleaned];
  }

  // Check for partial matches
  for (const [key, value] of Object.entries(locationMappings)) {
    if (lowerCleaned.includes(key) || key.includes(lowerCleaned)) {
      return value;
    }
  }

  // Return cleaned string if no mapping found
  return cleaned;
}