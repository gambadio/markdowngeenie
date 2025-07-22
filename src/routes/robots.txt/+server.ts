import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async () => {
  const robots = `User-agent: *
Allow: /

Sitemap: https://markdown-to-word.app/sitemap.xml`;

  return new Response(robots, {
    headers: {
      'Content-Type': 'text/plain'
    }
  });
};