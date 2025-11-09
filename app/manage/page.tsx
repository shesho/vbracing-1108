'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  getEndpoints,
  addEndpoint,
  removeEndpoint,
  checkEndpointHealth,
  type DeveloperEndpoint,
} from '@/lib/endpoints';

export default function ManageEndpointsPage() {
  const [endpoints, setEndpoints] = useState<DeveloperEndpoint[]>([]);
  const [newUrl, setNewUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [checking, setChecking] = useState<string | null>(null);

  // Load endpoints on mount
  useEffect(() => {
    setEndpoints(getEndpoints());
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const endpoint = await addEndpoint(newUrl);
      setEndpoints(getEndpoints());
      setNewUrl('');
      setSuccess(`Added ${endpoint.name} successfully!`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add endpoint');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = (url: string) => {
    if (confirm('Are you sure you want to remove this endpoint?')) {
      removeEndpoint(url);
      setEndpoints(getEndpoints());
      setSuccess('Endpoint removed successfully');
    }
  };

  const handleCheck = async (url: string) => {
    setChecking(url);
    const status = await checkEndpointHealth(url);
    setChecking(null);

    // Update endpoints list
    setEndpoints(getEndpoints());

    if (status === 'online') {
      setSuccess('Endpoint is online and responding correctly!');
    } else {
      setError('Endpoint is offline or not responding');
    }
  };

  return (
    <div>
      <div className="flex flex-row gap-4 items-center mb-6">
        <Link href="/" className="back-link">
          ← Back to home
        </Link>
        <Link href="/feed" className="back-link">
          → View federated feed
        </Link>
      </div>

      <h1 className="text-2xl mb-4">Manage Endpoints</h1>
      <p className="subtitle mb-8">
        Add metadata URLs from other developers to see their notes in the federated feed.
      </p>

      {/* Add Endpoint Form */}
      <div className="endpoint-form-container mb-8">
        <h2 className="text-xl mb-4">Add New Endpoint</h2>
        <form onSubmit={handleAdd} className="endpoint-form">
          <div className="form-group">
            <label htmlFor="endpoint-url" className="form-label">
              Metadata URL
            </label>
            <input
              id="endpoint-url"
              type="url"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="https://example.vercel.app/api/metadata.json"
              required
              disabled={loading}
              className="form-input"
            />
            <p className="form-hint">
              Enter the full URL to a developer's metadata.json endpoint
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || !newUrl.trim()}
            className="btn-primary"
          >
            {loading ? 'Adding...' : 'Add Endpoint'}
          </button>
        </form>

        {error && (
          <div className="message message-error">
            ❌ {error}
          </div>
        )}

        {success && (
          <div className="message message-success">
            ✅ {success}
          </div>
        )}
      </div>

      {/* Endpoints List */}
      <div className="endpoints-list">
        <h2 className="text-xl mb-4">
          Registered Endpoints [{endpoints.length}]
        </h2>

        {endpoints.length === 0 ? (
          <div className="empty-state">
            <p>No endpoints registered yet.</p>
            <p className="mt-2">Add your first endpoint above to start following other developers!</p>
          </div>
        ) : (
          <div className="endpoint-cards">
            {endpoints.map((endpoint) => (
              <div key={endpoint.url} className="endpoint-card">
                <div className="endpoint-header">
                  {endpoint.avatar && (
                    <img
                      src={endpoint.avatar}
                      alt={endpoint.name}
                      className="endpoint-avatar"
                    />
                  )}
                  <div className="endpoint-info">
                    <h3 className="endpoint-name">{endpoint.name}</h3>
                    <p className="endpoint-url">{endpoint.url}</p>
                    {endpoint.status && (
                      <span className={`status-badge status-${endpoint.status}`}>
                        {endpoint.status === 'online' ? '🟢' : endpoint.status === 'offline' ? '🔴' : '⚪'}{' '}
                        {endpoint.status}
                      </span>
                    )}
                  </div>
                </div>

                <div className="endpoint-meta">
                  <span className="endpoint-date">
                    Added: {new Date(endpoint.addedAt).toLocaleDateString()}
                  </span>
                  {endpoint.lastChecked && (
                    <span className="endpoint-date">
                      Last checked: {new Date(endpoint.lastChecked).toLocaleString()}
                    </span>
                  )}
                </div>

                <div className="endpoint-actions">
                  <button
                    onClick={() => handleCheck(endpoint.url)}
                    disabled={checking === endpoint.url}
                    className="btn-secondary"
                  >
                    {checking === endpoint.url ? 'Checking...' : 'Check Status'}
                  </button>
                  <button
                    onClick={() => handleRemove(endpoint.url)}
                    className="btn-danger"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Help Section */}
      <div className="help-section mt-8">
        <h2 className="text-xl mb-4">How It Works</h2>
        <ul className="help-list">
          <li>
            <strong>Add endpoints</strong> by pasting metadata.json URLs from other developers
          </li>
          <li>
            <strong>Validation</strong> happens automatically - we'll fetch and verify the endpoint
          </li>
          <li>
            <strong>View the feed</strong> to see aggregated notes from all registered developers
          </li>
          <li>
            <strong>Check status</strong> to verify if an endpoint is still responding
          </li>
        </ul>
      </div>
    </div>
  );
}
