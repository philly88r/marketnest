import { supabase } from './supabaseClient';

// Interface for Search Console data
export interface SearchConsoleData {
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  pages?: Array<{
    page: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  }>;
  queries?: Array<{
    query: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  }>;
  devices?: Array<{
    device: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  }>;
  countries?: Array<{
    country: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  }>;
}

/**
 * Get Search Console data for a client
 * This function fetches data from our server API which communicates with Google Search Console
 */
export const getSearchConsoleData = async (
  clientId: string,
  startDate: string,
  endDate: string
): Promise<SearchConsoleData> => {
  try {
    // Get the client's website URL from the database
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select('website_url')
      .eq('id', clientId)
      .single();

    if (clientError || !clientData?.website_url) {
      console.error('Error fetching client website URL:', clientError);
      throw new Error('Client website URL not found');
    }

    // Call our server API endpoint
    const response = await fetch('/api/search-console', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        siteUrl: clientData.website_url,
        startDate,
        endDate,
      }),
    });

    if (!response.ok) {
      throw new Error(`Error fetching Search Console data: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error in getSearchConsoleData:', error);
    // Return empty data structure if there's an error
    return {
      clicks: 0,
      impressions: 0,
      ctr: 0,
      position: 0,
      pages: [],
      queries: [],
      devices: [],
      countries: []
    };
  }
};

/**
 * Get top performing pages from Search Console
 */
export const getTopPages = async (
  clientId: string,
  startDate: string,
  endDate: string,
  limit: number = 10
): Promise<SearchConsoleData['pages']> => {
  try {
    // Get the client's website URL from the database
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select('website_url')
      .eq('id', clientId)
      .single();

    if (clientError || !clientData?.website_url) {
      console.error('Error fetching client website URL:', clientError);
      throw new Error('Client website URL not found');
    }

    // Call our server API endpoint
    const response = await fetch('/api/search-console/pages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        siteUrl: clientData.website_url,
        startDate,
        endDate,
        rowLimit: limit,
      }),
    });

    if (!response.ok) {
      throw new Error(`Error fetching top pages: ${response.statusText}`);
    }

    const data = await response.json();
    return data.pages || [];
  } catch (error) {
    console.error('Error in getTopPages:', error);
    return [];
  }
};

/**
 * Get top queries from Search Console
 */
export const getTopQueries = async (
  clientId: string,
  startDate: string,
  endDate: string,
  limit: number = 10
): Promise<SearchConsoleData['queries']> => {
  try {
    // Get the client's website URL from the database
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select('website_url')
      .eq('id', clientId)
      .single();

    if (clientError || !clientData?.website_url) {
      console.error('Error fetching client website URL:', clientError);
      throw new Error('Client website URL not found');
    }

    // Call our server API endpoint
    const response = await fetch('/api/search-console/queries', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        siteUrl: clientData.website_url,
        startDate,
        endDate,
        rowLimit: limit,
      }),
    });

    if (!response.ok) {
      throw new Error(`Error fetching top queries: ${response.statusText}`);
    }

    const data = await response.json();
    return data.queries || [];
  } catch (error) {
    console.error('Error in getTopQueries:', error);
    return [];
  }
};
