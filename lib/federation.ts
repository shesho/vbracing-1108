// Federation logic for aggregating dev notes from multiple sources

import type { MetadataResponse } from './endpoints';

/**
 * Fetch with CORS proxy fallback
 */
async function fetchWithProxy(url: string, acceptHeader = 'application/json'): Promise<Response> {
  try {
    // Try direct fetch first
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': acceptHeader,
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

      const { data, contentType } = await proxyResponse.json();

      // Create a mock Response object with the data
      const body = typeof data === 'string' ? data : JSON.stringify(data);
      return new Response(body, {
        status: 200,
        headers: { 'Content-Type': contentType || 'application/json' },
      });
    }
    throw error;
  }
}

export interface FileListNote {
  id: string;
  title: string;
  slug: string;
  date: string;
  excerpt?: string;
  description?: string;
  tagline?: string;
  author?: string;
  image?: string;
  url: string;
  tags?: string[];
}

export interface FileListResponse {
  notes: FileListNote[];
}

export interface FederatedNote extends FileListNote {
  source: {
    name: string;
    avatar?: string;
    metadataUrl: string;
  };
}

export interface FederationResult {
  notes: FederatedNote[];
  sources: {
    url: string;
    name: string;
    status: 'success' | 'error';
    error?: string;
    count: number;
  }[];
}

/**
 * Fetch metadata from a single endpoint
 */
export async function fetchMetadata(url: string): Promise<MetadataResponse> {
  const response = await fetchWithProxy(url, 'application/json');

  if (!response.ok) {
    throw new Error(`Failed to fetch metadata: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * Resolve a potentially relative URL against a base URL
 */
function resolveUrl(baseUrl: string, relativeUrl: string): string {
  // If already absolute, return as-is
  if (relativeUrl.startsWith('http://') || relativeUrl.startsWith('https://')) {
    return relativeUrl;
  }

  // Get base domain from metadata URL
  const url = new URL(baseUrl);
  const base = `${url.protocol}//${url.host}`;

  // Ensure relative URL starts with /
  const path = relativeUrl.startsWith('/') ? relativeUrl : `/${relativeUrl}`;

  return `${base}${path}`;
}

/**
 * Normalize note data to handle different formats
 */
function normalizeNote(note: any, baseUrl: string): FileListNote {
  // Handle different URL formats - prefer apiUrl, then url, then construct from slug
  let noteUrl = note.url || note.apiUrl;
  if (noteUrl) {
    noteUrl = resolveUrl(baseUrl, noteUrl);
  }

  return {
    id: note.id || note.slug || '',
    title: note.title || '',
    slug: note.slug || note.id || '',
    date: note.date || '',
    excerpt: note.excerpt || note.description || '',
    description: note.description || note.excerpt || '',
    tagline: note.tagline,
    author: note.author,
    image: note.image,
    url: noteUrl || '',
    tags: note.tags || [],
  };
}

/**
 * Fetch markdown file and extract frontmatter
 */
async function fetchMarkdownNote(url: string, baseUrl: string): Promise<FileListNote | null> {
  try {
    const response = await fetchWithProxy(url, 'text/markdown, text/plain');
    if (!response.ok) return null;

    const content = await response.text();

    // Simple frontmatter parser (matches --- header ---)
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
    if (!frontmatterMatch) return null;

    const frontmatter = frontmatterMatch[1];
    const lines = frontmatter.split('\n');
    const metadata: any = {};

    for (const line of lines) {
      const match = line.match(/^(\w+):\s*"?(.+?)"?$/);
      if (match) {
        metadata[match[1]] = match[2].replace(/^"|"$/g, '');
      }
    }

    // Extract slug from URL
    const slug = url.split('/').pop()?.replace('.md', '') || '';

    return {
      id: slug,
      title: metadata.title || slug,
      slug,
      date: metadata.date || new Date().toISOString(),
      excerpt: metadata.description || metadata.excerpt || '',
      description: metadata.description || metadata.excerpt || '',
      tagline: metadata.tagline,
      author: metadata.author,
      image: metadata.image,
      url,
      tags: metadata.tags ? metadata.tags.split(',').map((t: string) => t.trim()) : [],
    };
  } catch (error) {
    return null;
  }
}

/**
 * Fetch file list from a single endpoint
 */
export async function fetchFileList(fileListUrl: string, baseUrl: string): Promise<FileListResponse> {
  const response = await fetchWithProxy(fileListUrl, 'application/json');

  if (!response.ok) {
    throw new Error(`Failed to fetch file list: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  // Handle different response formats
  if (Array.isArray(data)) {
    // Format 1: Simple array of URLs (e.g., ["https://example.com/note1.md", ...])
    // Need to fetch each markdown file to get metadata
    const notePromises = data.map((url: string) => fetchMarkdownNote(url, baseUrl));
    const fetchedNotes = await Promise.all(notePromises);
    const validNotes = fetchedNotes.filter((note): note is FileListNote => note !== null);
    return { notes: validNotes };
  } else if (data.notes && Array.isArray(data.notes)) {
    // Format 2: Object with notes array (standard format)
    const normalizedNotes = data.notes.map((note: any) => normalizeNote(note, baseUrl));
    return { notes: normalizedNotes };
  }

  // Unknown format
  return { notes: [] };
}

/**
 * Fetch notes from a single endpoint (metadata URL)
 */
async function fetchNotesFromEndpoint(
  metadataUrl: string
): Promise<{ notes: FederatedNote[]; name: string; status: 'success' | 'error'; error?: string }> {
  try {
    // Fetch metadata
    const metadata = await fetchMetadata(metadataUrl);

    // Resolve file list URL (might be relative)
    const fileListUrl = resolveUrl(metadataUrl, metadata.fileList.url);

    // Fetch file list
    const fileList = await fetchFileList(fileListUrl, metadataUrl);

    // Resolve avatar URL if it's relative
    const avatarUrl = metadata.profile.avatar
      ? resolveUrl(metadataUrl, metadata.profile.avatar)
      : undefined;

    // Enrich notes with source information
    const federatedNotes: FederatedNote[] = fileList.notes.map(note => ({
      ...note,
      source: {
        name: metadata.profile.name,
        avatar: avatarUrl,
        metadataUrl,
      },
    }));

    return {
      notes: federatedNotes,
      name: metadata.profile.name,
      status: 'success',
    };
  } catch (error) {
    return {
      notes: [],
      name: metadataUrl,
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Fetch and aggregate notes from all endpoints
 */
export async function fetchAllFeeds(metadataUrls: string[]): Promise<FederationResult> {
  // Fetch from all endpoints in parallel
  const results = await Promise.all(
    metadataUrls.map(url => fetchNotesFromEndpoint(url))
  );

  // Aggregate all notes
  const allNotes: FederatedNote[] = [];
  const sources: FederationResult['sources'] = [];

  for (const result of results) {
    sources.push({
      url: result.name,
      name: result.name,
      status: result.status,
      error: result.error,
      count: result.notes.length,
    });

    if (result.status === 'success') {
      allNotes.push(...result.notes);
    }
  }

  // Sort by date (newest first)
  const sortedNotes = allNotes.sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  return {
    notes: sortedNotes,
    sources,
  };
}

/**
 * Filter notes by source (developer name)
 */
export function filterBySource(notes: FederatedNote[], sourceName: string | null): FederatedNote[] {
  if (!sourceName) return notes;
  return notes.filter(note => note.source.name === sourceName);
}

/**
 * Filter notes by tag
 */
export function filterByTag(notes: FederatedNote[], tag: string | null): FederatedNote[] {
  if (!tag) return notes;
  return notes.filter(note => note.tags?.includes(tag));
}

/**
 * Get all unique sources from notes
 */
export function getUniqueSources(notes: FederatedNote[]): Array<{ name: string; avatar?: string; metadataUrl: string; count: number }> {
  const sourceMap = new Map<string, { name: string; avatar?: string; metadataUrl: string; count: number }>();

  for (const note of notes) {
    const existing = sourceMap.get(note.source.metadataUrl);
    if (existing) {
      existing.count++;
    } else {
      sourceMap.set(note.source.metadataUrl, {
        name: note.source.name,
        avatar: note.source.avatar,
        metadataUrl: note.source.metadataUrl,
        count: 1,
      });
    }
  }

  return Array.from(sourceMap.values());
}

/**
 * Get all unique tags from notes
 */
export function getUniqueTags(notes: FederatedNote[]): string[] {
  const tagSet = new Set<string>();

  for (const note of notes) {
    if (note.tags) {
      note.tags.forEach(tag => tagSet.add(tag));
    }
  }

  return Array.from(tagSet).sort();
}
