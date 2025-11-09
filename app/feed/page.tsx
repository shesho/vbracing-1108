'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getEndpoints } from '@/lib/endpoints';
import {
  fetchAllFeeds,
  filterBySource,
  getUniqueSources,
  type FederatedNote,
} from '@/lib/federation';
import FederatedNoteCard from './components/FederatedNoteCard';

export default function FederatedFeedPage() {
  const [notes, setNotes] = useState<FederatedNote[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<FederatedNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [sources, setSources] = useState<Array<{ name: string; avatar?: string; metadataUrl: string; count: number }>>([]);

  const loadFeed = async () => {
    setLoading(true);
    setError(null);

    const endpoints = getEndpoints();

    if (endpoints.length === 0) {
      setLoading(false);
      setError('No endpoints registered. Add endpoints in the Manage page first.');
      return;
    }

    try {
      const result = await fetchAllFeeds(endpoints.map(e => e.url));

      // Check for errors
      const failedSources = result.sources.filter(s => s.status === 'error');
      if (failedSources.length > 0 && result.notes.length === 0) {
        setError(
          `All endpoints failed to load. Check your endpoints in the Manage page.`
        );
      } else if (failedSources.length > 0) {
        setError(
          `${failedSources.length} endpoint(s) failed to load. Showing notes from successful sources.`
        );
      }

      setNotes(result.notes);
      setFilteredNotes(result.notes);
      setSources(getUniqueSources(result.notes));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load federated feed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeed();
  }, []);

  useEffect(() => {
    if (selectedSource) {
      setFilteredNotes(filterBySource(notes, selectedSource));
    } else {
      setFilteredNotes(notes);
    }
  }, [selectedSource, notes]);

  const handleSourceFilter = (sourceName: string | null) => {
    setSelectedSource(sourceName);
  };

  return (
    <div>
      <div className="flex flex-row gap-4 items-center mb-6">
        <Link href="/" className="back-link">
          ← Back to home
        </Link>
        <Link href="/manage" className="back-link">
          ⚙️ Manage endpoints
        </Link>
      </div>

      <div className="feed-header">
        <h1 className="text-2xl mb-4">Federated Feed</h1>
        <p className="subtitle mb-4">
          Aggregated dev notes from all registered developers
        </p>

        <button onClick={loadFeed} disabled={loading} className="btn-secondary mb-6">
          {loading ? 'Loading...' : '🔄 Refresh'}
        </button>
      </div>

      {error && (
        <div className="message message-error mb-6">
          ⚠️ {error}
        </div>
      )}

      {loading ? (
        <div className="loading-state">
          <p>Loading federated notes...</p>
        </div>
      ) : notes.length === 0 ? (
        <div className="empty-state">
          <p>No notes found.</p>
          <p className="mt-2">
            <Link href="/manage">Add some endpoints</Link> to start seeing federated notes!
          </p>
        </div>
      ) : (
        <div className="feed-layout">
          {/* Sidebar - Sources List */}
          <aside className="feed-sidebar">
            <h2 className="sidebar-title">Developers [{sources.length}]</h2>
            <div className="source-list">
              <button
                onClick={() => handleSourceFilter(null)}
                className={`source-item ${selectedSource === null ? 'active' : ''}`}
              >
                <span className="source-label">All Sources</span>
                <span className="source-count">{notes.length}</span>
              </button>

              {sources.map((source) => (
                <button
                  key={source.metadataUrl}
                  onClick={() => handleSourceFilter(source.name)}
                  className={`source-item ${selectedSource === source.name ? 'active' : ''}`}
                >
                  {source.avatar && (
                    <img
                      src={source.avatar}
                      alt={source.name}
                      className="source-avatar-small"
                    />
                  )}
                  <span className="source-label">{source.name}</span>
                  <span className="source-count">{source.count}</span>
                </button>
              ))}
            </div>
          </aside>

          {/* Main Content - Notes Feed */}
          <main className="feed-main">
            <h2 className="feed-subtitle">
              {selectedSource ? `Notes from ${selectedSource}` : 'All Notes'} [{filteredNotes.length}]
            </h2>

            <div className="note-list">
              {filteredNotes.map((note) => (
                <FederatedNoteCard key={`${note.source.metadataUrl}-${note.id}`} note={note} />
              ))}
            </div>
          </main>
        </div>
      )}
    </div>
  );
}
