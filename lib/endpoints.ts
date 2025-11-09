// Endpoint management for federated dev notes

export interface DeveloperEndpoint {
  url: string; // Metadata URL
  name: string;
  avatar?: string;
  addedAt: string; // ISO 8601
  lastChecked?: string;
  status?: 'online' | 'offline' | 'unknown';
}

export interface MetadataResponse {
  version: string;
  profile: {
    name: string;
    avatar?: string;
    contact?: {
      github?: string;
      linkedin?: string;
      email?: string;
      twitter?: string;
      website?: string;
      other?: Array<{
        platform: string;
        url: string;
        label?: string;
      }>;
    };
  };
  fileList: {
    url: string;
    format: string;
    lastUpdated: string;
  };
}

const STORAGE_KEY = 'dev-notes-endpoints';

/**
 * Get all registered endpoints from localStorage
 */
export function getEndpoints(): DeveloperEndpoint[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch (error) {
    console.error('Failed to read endpoints from localStorage:', error);
    return [];
  }
}

/**
 * Save endpoints to localStorage
 */
function saveEndpoints(endpoints: DeveloperEndpoint[]): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(endpoints));
  } catch (error) {
    console.error('Failed to save endpoints to localStorage:', error);
  }
}

/**
 * Fetch with CORS proxy fallback
 */
async function fetchWithProxy(url: string): Promise<Response> {
  try {
    // Try direct fetch first
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    return response;
  } catch (error) {
    // If direct fetch fails (likely CORS), try proxy
    if (typeof window !== 'undefined') {
      const proxyUrl = `/api/proxy?url=${encodeURIComponent(url)}`;
      const proxyResponse = await fetch(proxyUrl);

      if (!proxyResponse.ok) {
        throw new Error(`Proxy fetch failed: ${proxyResponse.status}`);
      }

      const { data } = await proxyResponse.json();

      // Create a mock Response object with the data
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    throw error;
  }
}

/**
 * Validate and fetch metadata from URL
 * Tries common metadata endpoint paths
 * Returns both the metadata and the actual URL that worked
 */
export async function validateMetadata(url: string): Promise<{ metadata: MetadataResponse; actualUrl: string }> {
  let metadataUrl = url.trim();

  // List of common metadata endpoint paths to try
  const endpointPaths = [
    metadataUrl, // Try the URL as-is first (in case they provided the full path)
  ];

  // If URL doesn't look like a full metadata endpoint, try common paths
  if (!metadataUrl.includes('/api/')) {
    const baseUrl = metadataUrl.replace(/\/$/, '');
    endpointPaths.push(
      `${baseUrl}/api/metadata.json`,
      `${baseUrl}/api/metadata`,
      `${baseUrl}/api/profile.json`,
      `${baseUrl}/api/profile`
    );
  }

  let lastError: Error | null = null;

  // Try each endpoint path
  for (const endpoint of endpointPaths) {
    try {
      const response = await fetchWithProxy(endpoint);

      if (!response.ok) {
        lastError = new Error(`HTTP ${response.status}: ${response.statusText}`);
        continue;
      }

      const data = await response.json();

      // Validate required fields
      if (!data.version || !data.profile || !data.profile.name || !data.fileList || !data.fileList.url) {
        lastError = new Error('Invalid metadata format: missing required fields');
        continue;
      }

      // Success! Return the data and the actual URL that worked
      return { metadata: data, actualUrl: endpoint };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      continue;
    }
  }

  // If we get here, all attempts failed
  throw lastError || new Error('Failed to fetch metadata from any known endpoint');
}

/**
 * Add a new endpoint
 */
export async function addEndpoint(url: string): Promise<DeveloperEndpoint> {
  const endpoints = getEndpoints();

  // Validate by fetching metadata - this will discover the actual working URL
  const { metadata, actualUrl } = await validateMetadata(url);

  // Check if already exists (using the actual URL that worked)
  if (endpoints.some(e => e.url === actualUrl)) {
    throw new Error('Endpoint already exists');
  }

  const newEndpoint: DeveloperEndpoint = {
    url: actualUrl, // Use the actual URL that worked
    name: metadata.profile.name,
    avatar: metadata.profile.avatar,
    addedAt: new Date().toISOString(),
    lastChecked: new Date().toISOString(),
    status: 'online',
  };

  endpoints.push(newEndpoint);
  saveEndpoints(endpoints);

  return newEndpoint;
}

/**
 * Remove an endpoint by URL
 */
export function removeEndpoint(url: string): void {
  const endpoints = getEndpoints();
  const filtered = endpoints.filter(e => e.url !== url);
  saveEndpoints(filtered);
}

/**
 * Update endpoint status
 */
export function updateEndpointStatus(url: string, status: 'online' | 'offline' | 'unknown'): void {
  const endpoints = getEndpoints();
  const endpoint = endpoints.find(e => e.url === url);

  if (endpoint) {
    endpoint.status = status;
    endpoint.lastChecked = new Date().toISOString();
    saveEndpoints(endpoints);
  }
}

/**
 * Check endpoint health
 */
export async function checkEndpointHealth(url: string): Promise<'online' | 'offline'> {
  try {
    await validateMetadata(url);
    return 'online';
  } catch (error) {
    return 'offline';
  }
}
