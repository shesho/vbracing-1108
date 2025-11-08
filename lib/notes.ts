import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const notesDirectory = path.join(process.cwd(), 'content/notes');

export interface Note {
  slug: string;
  title: string;
  date: string;
  excerpt?: string;
  description?: string;
  tagline?: string;
  author?: string;
  image?: string;
  tags?: string[];
  content: string;
}

export function getAllNotes(): Note[] {
  // Check if directory exists, return empty array if not
  if (!fs.existsSync(notesDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(notesDirectory);
  const allNotes = fileNames
    .filter(fileName => fileName.endsWith('.md'))
    .map(fileName => {
      const slug = fileName.replace(/\.md$/, '');
      const fullPath = path.join(notesDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const { data, content } = matter(fileContents);

      return {
        slug,
        title: data.title,
        date: data.date,
        excerpt: data.excerpt || data.description,
        description: data.description,
        tagline: data.tagline,
        author: data.author,
        image: data.image,
        tags: data.tags,
        content
      };
    });

  return allNotes.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getNoteBySlug(slug: string): Note | null {
  try {
    const fullPath = path.join(notesDirectory, `${slug}.md`);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);

    return {
      slug,
      title: data.title,
      date: data.date,
      excerpt: data.excerpt || data.description,
      description: data.description,
      tagline: data.tagline,
      author: data.author,
      image: data.image,
      tags: data.tags,
      content
    };
  } catch {
    return null;
  }
}

export function getAllSlugs(): string[] {
  // Check if directory exists, return empty array if not
  if (!fs.existsSync(notesDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(notesDirectory);
  return fileNames
    .filter(fileName => fileName.endsWith('.md'))
    .map(fileName => fileName.replace(/\.md$/, ''));
}

