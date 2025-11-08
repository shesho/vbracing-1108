import { notFound } from 'next/navigation';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { getNoteBySlug, getAllSlugs } from '@/lib/notes';

export async function generateStaticParams() {
  const slugs = getAllSlugs();
  return slugs.map(slug => ({ slug }));
}

export default function NotePage({ params }: { params: { slug: string } }) {
  const note = getNoteBySlug(params.slug);

  if (!note) {
    notFound();
  }

  return (
    <article>
      <Link href="/" className="back-link">
        ← Back to notes
      </Link>
      
      {note.image && (
        <div className="note-image" style={{ marginBottom: '20px' }}>
          <img src={note.image} alt={note.title} style={{ maxWidth: '100%', height: 'auto' }} />
        </div>
      )}
      
      <h1>{note.title}</h1>
      
      {note.tagline && (
        <p className="note-tagline" style={{ color: '#00aa00', fontSize: '1.1rem', marginBottom: '10px' }}>
          {note.tagline}
        </p>
      )}
      
      <div className="note-date">{new Date(note.date).toLocaleString()}</div>
      
      {note.author && (
        <div className="note-author" style={{ color: '#00aa00', fontSize: '0.9rem', marginBottom: '10px' }}>
          By {note.author}
        </div>
      )}
      
      {note.tags && note.tags.length > 0 && (
        <div className="note-tags">
          {note.tags.map(tag => (
            <span key={tag} className="tag">
              {tag}
            </span>
          ))}
        </div>
      )}
      
      <div className="note-content">
        <ReactMarkdown rehypePlugins={[rehypeRaw]}>{note.content}</ReactMarkdown>
      </div>
    </article>
  );
}

