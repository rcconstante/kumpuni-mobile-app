// Fetch link metadata client-side: fetch HTML, regex-parse OG tags + <title>.
// Graceful fallback when blocked or non-HTML.
import { deriveDomain } from './links';

export interface LinkMetadata {
  title: string;
  description: string;
  image: string;
  domain: string;
  url: string;
}

const TIMEOUT_MS = 6000;

function pick(html: string, regex: RegExp): string {
  const m = html.match(regex);
  return m && m[1] ? decodeHtml(m[1].trim()) : '';
}

function decodeHtml(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

function absUrl(maybe: string, base: string): string {
  if (!maybe) return '';
  try {
    return new URL(maybe, base).toString();
  } catch {
    return maybe;
  }
}

function normalizeUrl(input: string): string {
  let u = input.trim();
  if (!/^https?:\/\//i.test(u)) u = 'https://' + u;
  return u;
}

export async function fetchLinkMetadata(rawUrl: string): Promise<LinkMetadata> {
  const url = normalizeUrl(rawUrl);
  const domain = deriveDomain(url);
  const fallback: LinkMetadata = {
    title: domain || url,
    description: '',
    image: '',
    domain,
    url,
  };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Mobile; Savit) AppleWebKit/537.36',
        Accept: 'text/html,application/xhtml+xml',
      },
    });
    clearTimeout(timer);
    if (!res.ok) return fallback;
    const ctype = res.headers.get('content-type') || '';
    if (!ctype.includes('text/html') && !ctype.includes('xml')) return fallback;
    const html = await res.text();

    const ogTitle = pick(html, /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i);
    const tTitle  = pick(html, /<title[^>]*>([^<]+)<\/title>/i);
    const ogDesc  = pick(html, /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i);
    const mDesc   = pick(html, /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i);
    const ogImg   = pick(html, /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i);
    const twImg   = pick(html, /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i);

    return {
      url,
      domain,
      title: ogTitle || tTitle || fallback.title,
      description: ogDesc || mDesc || '',
      image: absUrl(ogImg || twImg, url),
    };
  } catch {
    clearTimeout(timer);
    return fallback;
  }
}

export function isProbablyUrl(s: string): boolean {
  if (!s) return false;
  const trimmed = s.trim();
  if (/\s/.test(trimmed)) return false;
  return /^(https?:\/\/|www\.)\S+\.\S+/i.test(trimmed) || /^\S+\.[a-z]{2,}(\/\S*)?$/i.test(trimmed);
}
