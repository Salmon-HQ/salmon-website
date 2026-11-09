import { NextResponse, type NextRequest } from 'next/server';
import { markdownFor, notFoundMarkdown, prefersMarkdown } from '@/lib/agent-content';

// Agents that send `Accept: text/markdown` get the page as Markdown (or a Markdown 404); browsers keep the HTML.
// The HTML answers get their `Vary: Accept` from next.config.ts.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (prefersMarkdown(request.headers.get('accept') ?? '')) {
    const markdown = markdownFor(pathname);
    return new NextResponse(markdown ?? notFoundMarkdown(pathname), {
      status: markdown ? 200 : 404,
      headers: {
        'content-type': 'text/markdown; charset=utf-8',
        'cache-control': 'public, max-age=0, must-revalidate',
        vary: pathname === '/seeker' ? 'Accept, User-Agent' : 'Accept',
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  // Pages only: no Next assets, no files (robots.txt, llms.txt, images) and not the phone frames the home embeds.
  matcher: ['/((?!_next/|phone-preview|powerup-rows|.*\\..*).*)'],
};
