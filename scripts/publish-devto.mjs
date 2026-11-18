import fs from 'node:fs';
import path from 'node:path';

const ARTICLE_PATH = path.resolve(process.cwd(), 'content/articles/devto-panchang-nextjs15.md');
const ENV_LOCAL_PATH = path.resolve(process.cwd(), '.env.local');
const DEVTO_API_URL = 'https://dev.to/api/articles';

const ARTICLE_TITLE = 'How I Built a Real-Time Vedic Panchang & Muhurat Engine with Next.js 15';
const ARTICLE_TAGS = ['nextjs', 'webdev', 'typescript', 'opensource'];

/**
 * Load key=value pairs from .env.local into process.env (without overriding existing env vars).
 */
function loadEnvLocal(filePath) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, 'utf8');
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eqIndex = line.indexOf('=');
    if (eqIndex === -1) continue;
    const key = line.slice(0, eqIndex).trim();
    let value = line.slice(eqIndex + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (key && !(key in process.env)) {
      process.env[key] = value;
    }
  }
}

/**
 * Strip optional leading YAML frontmatter so Dev.to API receives clean body_markdown.
 */
function stripFrontmatter(markdown) {
  return markdown.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n*/, '').trim();
}

async function main() {
  loadEnvLocal(ENV_LOCAL_PATH);

  const apiKey = process.env.DEVTO_API_KEY?.trim();
  if (!apiKey) {
    console.log('⚠️  DEVTO_API_KEY is missing in .env.local.');
    console.log('');
    console.log('To publish this article to Dev.to:');
    console.log('  1. Generate an API key at https://dev.to/settings/extensions (DEV Community API Keys).');
    console.log('  2. Add the following line to .env.local in the project root:');
    console.log('       DEVTO_API_KEY=your_devto_api_key_here');
    console.log('  3. Re-run: node scripts/publish-devto.mjs');
    console.log('');
    console.log('Skipping Dev.to API request.');
    return;
  }

  if (!fs.existsSync(ARTICLE_PATH)) {
    console.error(`❌ Article file not found: ${ARTICLE_PATH}`);
    process.exitCode = 1;
    return;
  }

  const rawMarkdown = fs.readFileSync(ARTICLE_PATH, 'utf8');
  const bodyMarkdown = stripFrontmatter(rawMarkdown);

  const payload = {
    article: {
      title: ARTICLE_TITLE,
      published: true,
      body_markdown: bodyMarkdown,
      tags: ARTICLE_TAGS,
    },
  };

  console.log(`Publishing "${ARTICLE_TITLE}" to Dev.to...`);

  const response = await fetch(DEVTO_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': apiKey,
    },
    body: JSON.stringify(payload),
  });

  const responseText = await response.text();
  let data;
  try {
    data = JSON.parse(responseText);
  } catch {
    data = { raw: responseText };
  }

  if (!response.ok) {
    console.error(`❌ Dev.to API error (${response.status} ${response.statusText}):`);
    console.error(JSON.stringify(data, null, 2));
    process.exitCode = 1;
    return;
  }

  console.log('✅ Article published successfully on Dev.to!');
  console.log(`Live URL: ${data.url}`);
  if (data.id) {
    console.log(`Article ID: ${data.id}`);
  }
}

main().catch((err) => {
  console.error('❌ Unexpected error while publishing to Dev.to:', err);
  process.exitCode = 1;
});
