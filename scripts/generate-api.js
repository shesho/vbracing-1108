const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const CONTENT_DIR = path.join(__dirname, '../content/notes');
const OUTPUT_DIR = path.join(__dirname, '../public/api/notes');
const FILES_JSON = path.join(__dirname, '../public/api/files.json');
const METADATA_JSON = path.join(__dirname, '../public/api/metadata.json');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Ensure content directory exists
if (!fs.existsSync(CONTENT_DIR)) {
  console.error(`❌ Error: content/notes/ directory not found. Please create it and add some notes.`);
  process.exit(1);
}

// Read metadata to derive base URL
let baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL;
if (!baseUrl && fs.existsSync(METADATA_JSON)) {
  try {
    const metadata = JSON.parse(fs.readFileSync(METADATA_JSON, 'utf8'));
    baseUrl = metadata.fileList.url.replace('/api/files.json', '');
  } catch (err) {
    console.warn('⚠️  Warning: Could not read metadata.json to derive base URL');
  }
}

// Add https:// prefix for VERCEL_URL if needed
if (baseUrl && !baseUrl.startsWith('http')) {
  baseUrl = `https://${baseUrl}`;
}

if (!baseUrl) {
  console.error(`❌ Error: Cannot determine base URL. Please either:
  1. Set NEXT_PUBLIC_SITE_URL environment variable, or
  2. Ensure public/api/metadata.json exists with valid fileList.url`);
  process.exit(1);
}

// Read all markdown files
const files = fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith('.md'));

if (files.length === 0) {
  console.warn('⚠️  Warning: No markdown files found in content/notes/');
}

const notes = files.map(file => {
  const filePath = path.join(CONTENT_DIR, file);
  const content = fs.readFileSync(filePath, 'utf8');

  let data;
  try {
    ({ data } = matter(content));
  } catch (err) {
    console.error(`❌ Error parsing frontmatter in ${file}:`, err.message);
    process.exit(1);
  }

  // Validate required fields
  if (!data.title) {
    console.error(`❌ Error: Missing required field 'title' in ${file}`);
    process.exit(1);
  }
  if (!data.date) {
    console.error(`❌ Error: Missing required field 'date' in ${file}`);
    process.exit(1);
  }

  // Validate date format (ISO 8601)
  if (isNaN(Date.parse(data.date))) {
    console.error(`❌ Error: Invalid date format in ${file}. Use ISO 8601: "2025-11-08T10:00:00Z"`);
    process.exit(1);
  }

  const slug = file.replace('.md', '');

  // Copy to public/api/notes/
  fs.copyFileSync(filePath, path.join(OUTPUT_DIR, file));

  return {
    id: data.id || slug,
    title: data.title,
    slug: slug,
    date: data.date,
    excerpt: data.excerpt || data.description || '',
    description: data.description,
    tagline: data.tagline,
    author: data.author,
    image: data.image,
    url: `${baseUrl}/api/notes/${file}`,
    tags: data.tags || []
  };
}).sort((a, b) => new Date(b.date) - new Date(a.date));

// Write files.json
fs.writeFileSync(FILES_JSON, JSON.stringify({ notes }, null, 2));

// Update lastUpdated in metadata.json
if (fs.existsSync(METADATA_JSON)) {
  try {
    const metadata = JSON.parse(fs.readFileSync(METADATA_JSON, 'utf8'));
    metadata.fileList.lastUpdated = new Date().toISOString();
    fs.writeFileSync(METADATA_JSON, JSON.stringify(metadata, null, 2));
  } catch (err) {
    console.warn('⚠️  Warning: Could not update lastUpdated in metadata.json:', err.message);
  }
}

console.log(`✅ Generated files.json with ${notes.length} notes`);
console.log(`   Base URL: ${baseUrl}`);

