import Link from 'next/link';
import { getAllNotes } from '@/lib/notes';

export default function HomePage() {
  const notes = getAllNotes();

  return (
    <div>
      <h2>Recent Notes [{notes.length}]</h2>
      <ul className="note-list">
        {notes.map(note => (
          <li key={note.slug} className="note-item">
            {note.image && (
              <div style={{ marginBottom: '10px' }}>
                <img 
                  src={note.image} 
                  alt={note.title} 
                  style={{ maxWidth: '100%', height: 'auto', maxHeight: '200px', objectFit: 'cover' }} 
                />
              </div>
            )}
            <Link href={`/notes/${note.slug}`}>
              <h3 className="note-title">{note.title}</h3>
            </Link>
            {note.tagline && (
              <p className="note-tagline" style={{ color: '#00aa00', fontSize: '0.9rem', marginBottom: '8px' }}>
                {note.tagline}
              </p>
            )}
            <div className="note-date">{new Date(note.date).toLocaleString()}</div>
            {note.author && (
              <div className="note-author" style={{ color: '#00aa00', fontSize: '0.85rem', marginTop: '5px' }}>
                By {note.author}
              </div>
            )}
            {note.excerpt && <p className="note-excerpt">{note.excerpt}</p>}
            {note.tags && note.tags.length > 0 && (
              <div className="note-tags">
                {note.tags.map(tag => (
                  <span key={tag} className="tag">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

