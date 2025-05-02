// Types for Search Console data
export interface SearchConsoleMetric {
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface SearchConsolePage extends SearchConsoleMetric {
  page: string;
}

export interface SearchConsoleQuery extends SearchConsoleMetric {
  query: string;
}

export interface SearchConsoleDevice extends SearchConsoleMetric {
  device: string;
}

export interface SearchConsoleCountry extends SearchConsoleMetric {
  country: string;
}

export interface SearchConsoleData extends SearchConsoleMetric {
  pages: SearchConsolePage[];
  queries: SearchConsoleQuery[];
  devices: SearchConsoleDevice[];
  countries: SearchConsoleCountry[];
  startDate: string;
  endDate: string;
}

// Fetch Search Console data from the backend API (Node server)
export async function getSearchConsoleData(
  siteUrl: string,
  startDate: string,
  endDate: string
): Promise<SearchConsoleData> {
  const response = await fetch(
    `/api/searchConsole?siteUrl=${encodeURIComponent(siteUrl)}&startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`
  );
  if (!response.ok) {
    throw new Error('Failed to fetch Search Console data');
  }
  return response.json();
}
