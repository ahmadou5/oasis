import { NextRequest, NextResponse } from 'next/server';

interface LocationData {
  city: string;
  country: string;
  coordinates: [number, number]; // [longitude, latitude]
  region?: string;
  continent?: string;
}

// City/Country to coordinates mapping for common validator locations
const CITY_COORDINATES: Record<string, LocationData> = {
  // Major validator hosting locations
  'Frankfurt, Germany': {
    city: 'Frankfurt',
    country: 'Germany', 
    coordinates: [8.6821, 50.1109],
    region: 'Hesse',
    continent: 'Europe'
  },
  'New York, United States': {
    city: 'New York',
    country: 'United States',
    coordinates: [-74.0060, 40.7128],
    region: 'New York',
    continent: 'North America'
  },
  'San Francisco, United States': {
    city: 'San Francisco', 
    country: 'United States',
    coordinates: [-122.4194, 37.7749],
    region: 'California',
    continent: 'North America'
  },
  'London, United Kingdom': {
    city: 'London',
    country: 'United Kingdom',
    coordinates: [-0.1276, 51.5074],
    region: 'England',
    continent: 'Europe'
  },
  'Tokyo, Japan': {
    city: 'Tokyo',
    country: 'Japan', 
    coordinates: [139.6503, 35.6762],
    region: 'Kanto',
    continent: 'Asia'
  },
  'Singapore, Singapore': {
    city: 'Singapore',
    country: 'Singapore',
    coordinates: [103.8198, 1.3521],
    region: 'Singapore',
    continent: 'Asia'
  },
  'Amsterdam, Netherlands': {
    city: 'Amsterdam',
    country: 'Netherlands',
    coordinates: [4.9041, 52.3676],
    region: 'North Holland',
    continent: 'Europe'
  },
  'Paris, France': {
    city: 'Paris',
    country: 'France',
    coordinates: [2.3522, 48.8566],
    region: 'Île-de-France',
    continent: 'Europe'
  },
  'Sydney, Australia': {
    city: 'Sydney',
    country: 'Australia',
    coordinates: [151.2093, -33.8688],
    region: 'New South Wales',
    continent: 'Oceania'
  },
  'Toronto, Canada': {
    city: 'Toronto',
    country: 'Canada',
    coordinates: [-79.3832, 43.6532],
    region: 'Ontario',
    continent: 'North America'
  },
  'Dublin, Ireland': {
    city: 'Dublin',
    country: 'Ireland',
    coordinates: [-6.2603, 53.3498],
    region: 'Leinster',
    continent: 'Europe'
  },
  'Seoul, South Korea': {
    city: 'Seoul',
    country: 'South Korea',
    coordinates: [126.9780, 37.5665],
    region: 'Seoul',
    continent: 'Asia'
  },
  'Mumbai, India': {
    city: 'Mumbai',
    country: 'India',
    coordinates: [72.8777, 19.0760],
    region: 'Maharashtra',
    continent: 'Asia'
  },
  'São Paulo, Brazil': {
    city: 'São Paulo',
    country: 'Brazil',
    coordinates: [-46.6333, -23.5505],
    region: 'São Paulo',
    continent: 'South America'
  },
  'Moscow, Russia': {
    city: 'Moscow',
    country: 'Russia',
    coordinates: [37.6173, 55.7558],
    region: 'Moscow',
    continent: 'Europe'
  },
  'Stockholm, Sweden': {
    city: 'Stockholm',
    country: 'Sweden',
    coordinates: [18.0686, 59.3293],
    region: 'Stockholm',
    continent: 'Europe'
  },
  'Zurich, Switzerland': {
    city: 'Zurich',
    country: 'Switzerland',
    coordinates: [8.5417, 47.3769],
    region: 'Zurich',
    continent: 'Europe'
  },
  'Hong Kong, Hong Kong': {
    city: 'Hong Kong',
    country: 'Hong Kong',
    coordinates: [114.1694, 22.3193],
    region: 'Hong Kong',
    continent: 'Asia'
  },
  'Los Angeles, United States': {
    city: 'Los Angeles',
    country: 'United States',
    coordinates: [-118.2437, 34.0522],
    region: 'California',
    continent: 'North America'
  },
  'Chicago, United States': {
    city: 'Chicago',
    country: 'United States',
    coordinates: [-87.6298, 41.8781],
    region: 'Illinois',
    continent: 'North America'
  },
  'Miami, United States': {
    city: 'Miami',
    country: 'United States',
    coordinates: [-80.1918, 25.7617],
    region: 'Florida',
    continent: 'North America'
  }
};

// Fallback coordinates by country for validators without city data
const COUNTRY_COORDINATES: Record<string, LocationData> = {
  'United States': {
    city: 'Unknown',
    country: 'United States',
    coordinates: [-95.7129, 37.0902],
    continent: 'North America'
  },
  'Germany': {
    city: 'Unknown', 
    country: 'Germany',
    coordinates: [10.4515, 51.1657],
    continent: 'Europe'
  },
  'United Kingdom': {
    city: 'Unknown',
    country: 'United Kingdom', 
    coordinates: [-3.4360, 55.3781],
    continent: 'Europe'
  },
  'Japan': {
    city: 'Unknown',
    country: 'Japan',
    coordinates: [138.2529, 36.2048],
    continent: 'Asia'
  },
  'Singapore': {
    city: 'Singapore',
    country: 'Singapore',
    coordinates: [103.8198, 1.3521],
    continent: 'Asia'
  },
  'Netherlands': {
    city: 'Unknown',
    country: 'Netherlands',
    coordinates: [5.2913, 52.1326],
    continent: 'Europe'
  },
  'France': {
    city: 'Unknown',
    country: 'France',
    coordinates: [2.2137, 46.2276],
    continent: 'Europe'
  },
  'Australia': {
    city: 'Unknown',
    country: 'Australia',
    coordinates: [133.7751, -25.2744],
    continent: 'Oceania'
  },
  'Canada': {
    city: 'Unknown',
    country: 'Canada',
    coordinates: [-106.3468, 56.1304],
    continent: 'North America'
  },
  'Ireland': {
    city: 'Unknown',
    country: 'Ireland',
    coordinates: [-8.2439, 53.4129],
    continent: 'Europe'
  },
  'South Korea': {
    city: 'Unknown',
    country: 'South Korea',
    coordinates: [127.7669, 35.9078],
    continent: 'Asia'
  },
  'India': {
    city: 'Unknown',
    country: 'India',
    coordinates: [78.9629, 20.5937],
    continent: 'Asia'
  },
  'Brazil': {
    city: 'Unknown',
    country: 'Brazil',
    coordinates: [-51.9253, -14.2350],
    continent: 'South America'
  },
  'Russia': {
    city: 'Unknown',
    country: 'Russia',
    coordinates: [105.3188, 61.5240],
    continent: 'Europe'
  },
  'Sweden': {
    city: 'Unknown',
    country: 'Sweden',
    coordinates: [18.6435, 60.1282],
    continent: 'Europe'
  },
  'Switzerland': {
    city: 'Unknown',
    country: 'Switzerland',
    coordinates: [8.2275, 46.8182],
    continent: 'Europe'
  },
  'Hong Kong': {
    city: 'Hong Kong',
    country: 'Hong Kong',
    coordinates: [114.1694, 22.3193],
    continent: 'Asia'
  }
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');
    const country = searchParams.get('country');
    const continent = searchParams.get('continent');

    if (!city && !country) {
      return NextResponse.json(
        { error: 'Either city or country parameter is required' },
        { status: 400 }
      );
    }

    // Try exact city, country match first
    if (city && country) {
      const cityKey = `${city}, ${country}`;
      if (CITY_COORDINATES[cityKey]) {
        return NextResponse.json({
          success: true,
          location: CITY_COORDINATES[cityKey],
          source: 'city_exact'
        });
      }

      // Try partial city match within the country
      const cityMatch = Object.entries(CITY_COORDINATES).find(([key, data]) => 
        key.toLowerCase().includes(city.toLowerCase()) && 
        data.country.toLowerCase() === country.toLowerCase()
      );

      if (cityMatch) {
        return NextResponse.json({
          success: true,
          location: cityMatch[1],
          source: 'city_partial'
        });
      }
    }

    // Fallback to country-level coordinates
    if (country && COUNTRY_COORDINATES[country]) {
      const countryData = { ...COUNTRY_COORDINATES[country] };
      if (city) {
        countryData.city = city; // Preserve the city name even if we don't have exact coordinates
      }
      if (continent) {
        countryData.continent = continent;
      }
      
      return NextResponse.json({
        success: true,
        location: countryData,
        source: 'country'
      });
    }

    // Last resort: continent-based approximate location
    if (continent) {
      const continentDefaults: Record<string, LocationData> = {
        'Europe': {
          city: city || 'Unknown',
          country: country || 'Unknown',
          coordinates: [8.0, 50.0],
          continent: 'Europe'
        },
        'North America': {
          city: city || 'Unknown', 
          country: country || 'Unknown',
          coordinates: [-95.0, 40.0],
          continent: 'North America'
        },
        'Asia': {
          city: city || 'Unknown',
          country: country || 'Unknown', 
          coordinates: [105.0, 15.0],
          continent: 'Asia'
        },
        'South America': {
          city: city || 'Unknown',
          country: country || 'Unknown',
          coordinates: [-60.0, -15.0],
          continent: 'South America'
        },
        'Oceania': {
          city: city || 'Unknown',
          country: country || 'Unknown',
          coordinates: [140.0, -25.0],
          continent: 'Oceania'
        },
        'Africa': {
          city: city || 'Unknown',
          country: country || 'Unknown',
          coordinates: [20.0, 0.0],
          continent: 'Africa'
        }
      };

      if (continentDefaults[continent]) {
        return NextResponse.json({
          success: true,
          location: continentDefaults[continent],
          source: 'continent'
        });
      }
    }

    // No match found
    return NextResponse.json(
      { 
        error: 'Location not found',
        searched: { city, country, continent }
      },
      { status: 404 }
    );

  } catch (error) {
    console.error('Error in validator geolocation API:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { locations } = body;

    if (!Array.isArray(locations)) {
      return NextResponse.json(
        { error: 'locations must be an array' },
        { status: 400 }
      );
    }

    const results = locations.map((loc) => {
      const { city, country, continent } = loc;
      
      // Try exact city, country match
      if (city && country) {
        const cityKey = `${city}, ${country}`;
        if (CITY_COORDINATES[cityKey]) {
          return {
            input: loc,
            success: true,
            location: CITY_COORDINATES[cityKey],
            source: 'city_exact'
          };
        }

        // Try partial city match
        const cityMatch = Object.entries(CITY_COORDINATES).find(([key, data]) => 
          key.toLowerCase().includes(city.toLowerCase()) && 
          data.country.toLowerCase() === country.toLowerCase()
        );

        if (cityMatch) {
          return {
            input: loc,
            success: true,
            location: cityMatch[1],
            source: 'city_partial'
          };
        }
      }

      // Fallback to country
      if (country && COUNTRY_COORDINATES[country]) {
        const countryData = { ...COUNTRY_COORDINATES[country] };
        if (city) countryData.city = city;
        if (continent) countryData.continent = continent;
        
        return {
          input: loc,
          success: true,
          location: countryData,
          source: 'country'
        };
      }

      // Last resort: continent
      if (continent) {
        const continentDefaults: Record<string, LocationData> = {
          'Europe': { city: city || 'Unknown', country: country || 'Unknown', coordinates: [8.0, 50.0], continent: 'Europe' },
          'North America': { city: city || 'Unknown', country: country || 'Unknown', coordinates: [-95.0, 40.0], continent: 'North America' },
          'Asia': { city: city || 'Unknown', country: country || 'Unknown', coordinates: [105.0, 15.0], continent: 'Asia' },
          'South America': { city: city || 'Unknown', country: country || 'Unknown', coordinates: [-60.0, -15.0], continent: 'South America' },
          'Oceania': { city: city || 'Unknown', country: country || 'Unknown', coordinates: [140.0, -25.0], continent: 'Oceania' },
          'Africa': { city: city || 'Unknown', country: country || 'Unknown', coordinates: [20.0, 0.0], continent: 'Africa' }
        };

        if (continentDefaults[continent]) {
          return {
            input: loc,
            success: true,
            location: continentDefaults[continent],
            source: 'continent'
          };
        }
      }

      return {
        input: loc,
        success: false,
        error: 'Location not found'
      };
    });

    return NextResponse.json({
      success: true,
      results
    });

  } catch (error) {
    console.error('Error in batch validator geolocation API:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}