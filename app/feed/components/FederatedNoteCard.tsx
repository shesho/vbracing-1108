import type { FederatedNote } from '@/lib/federation';

interface FederatedNoteCardProps {
  note: FederatedNote;
}

export default function FederatedNoteCard({ note }: FederatedNoteCardProps) {
  return (
    <div className="note-item federated-note-card">
      {/* Source Attribution */}
      <div className="note-source">
        {note.source.avatar && (
          <img
            src={note.source.avatar}
            alt={note.source.name}
            className="source-avatar"
          />
        )}
        <span className="source-name">{note.source.name}</span>
      </div>

      {/* Note Content */}
      <a href={note.url} target="_blank" rel="noopener noreferrer" className="note-link">
        {note.tagline && <div className="note-tagline">{note.tagline}</div>}
        <h3 className="note-title">{note.title}</h3>
      </a>

      <div className="note-date">{new Date(note.date).toLocaleString()}</div>

      {note.author && (
        <div className="note-author">by {note.author}</div>
      )}

      {(note.excerpt || note.description) && (
        <p className="note-excerpt">{note.excerpt || note.description}</p>
      )}

      {note.tags && note.tags.length > 0 && (
        <div className="note-tags">
          {note.tags.map((tag) => (
            <span key={tag} className="tag">
              {tag}
            </span>
          ))}
        </div>
      )}

      {note.image && (
        <div className="note-image-container">
          <img src={note.image} alt={note.title} className="note-image" />
        </div>
      )}

      {/* External Link Indicator */}
      <div className="external-link-indicator">
        <a href={note.url} target="_blank" rel="noopener noreferrer" className="read-more">
          Read full note →
        </a>
      </div>
    </div>
  );
}
