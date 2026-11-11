// Keep Markdown discovery links aligned with the plugin's page exclusions.
export const excludedMarkdownPages = [
  'dashboard',
  'vehicle',
  'used-cars-knoxville',
  'buy-here-pay-here-knoxville-tn',
  'blog', // This route redirects to the home page's blog section.
];

export function markdownPath(pathname: string, base: string): string | undefined {
  const page = pathname.slice(base.length).replace(/\/$/, '');
  if (excludedMarkdownPages.includes(page)) return undefined;

  // astro-llms-md writes the home page to home.md and other pages to <path>.md.
  return `${base}${page || 'home'}.md`;
}
