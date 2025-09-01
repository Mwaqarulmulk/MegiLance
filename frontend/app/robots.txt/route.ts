// @AI-HINT: robots.txt route.
import { NextResponse } from 'next/server';

export async function GET() {
  const content = `User-agent: *\nAllow: /\nSitemap: https://megilance.com/sitemap.xml`;
  return new NextResponse(content, { headers: { 'Content-Type': 'text/plain' } });
}
