import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const prerender = true;

// Keep link labels and descriptions on one Markdown line, including blog metadata.
const text = (value: string) => value.replace(/\s+/g, ' ').replace(/[\\[\]]/g, '\\$&').trim();

export const GET: APIRoute = async ({ site }) => {
  if (!site) throw new Error('Configure Astro site before generating llms.txt.');

  const base = new URL(import.meta.env.BASE_URL, site);
  const url = (path: string) => new URL(path, base).href;
  const link = (title: string, path: string, description: string) =>
    `- [${text(title)}](${url(path)}): ${text(description)}`;

  // Use the same collection and slugs as pages/blog/[...slug].astro.
  // New, renamed, and removed articles are reflected on the next build.
  const posts = (await getCollection('blog')).sort((a, b) => a.slug.localeCompare(b.slug));
  const articles = posts.map((post) => link(
    post.data.title,
    `blog/${post.slug.split('/').map(encodeURIComponent).join('/')}.md`,
    post.data.description,
  ));

  const body = [
    '# Cherokee Auto Sales',
    '',
    '> Cherokee Auto Sales is a used-car dealership in Knoxville, Tennessee, offering pre-owned cars, trucks, vans, and SUVs with buy here pay here financing options.',
    '',
    `Official website: ${base.href}`,
    'Address: 3423 North Broadway St, Knoxville, TN 37917, United States.',
    'Phone: (865) 687-7100.',
    'Hours (Eastern Time): Monday-Friday, 9:00 a.m.-6:00 p.m.; Saturday, 9:00 a.m.-3:00 p.m.; Sunday, closed.',
    'Spanish-speaking assistance is available.',
    '',
    'Inventory and vehicle details load through JavaScript and may be absent from a plain HTML fetch. Follow vehicle links from the current inventory rather than assuming a vehicle is available. Confirm current availability, pricing, financing eligibility and terms, and service-contract coverage with the dealership. Educational blog posts explain general topics and do not establish an individual financing offer.',
    '',
    '## Dealership and inventory',
    '',
    link('Home', 'home.md', 'Readable dealership overview, customer testimonials, financing, and purchase benefits. Live inventory requires JavaScript on the website.'),
    link('Current inventory', '#inventory', 'Browse vehicles currently listed for sale; requires JavaScript.'),
    link('Location and directions', '#location', 'Dealership information, map, and appointment scheduling.'),
    link('Contact and hours', '#contact', 'Phone number, directions, and business hours in the page footer.'),
    link('Service contract and purchase benefits', '#service', 'Information about the advertised 12-month / 12,000-mile vehicle service contract, two free oil changes, and referral program.'),
    '',
    '## Financing and selling a vehicle',
    '',
    link('Buy here pay here financing', 'buy-here-pay-here.md', 'Financing information for customers with varied credit histories, including no credit, low credit, past bankruptcies, or previous repossessions.'),
    link('Get pre-qualified', '#get-qualified', 'Pre-qualification inquiry form.'),
    link('Sell your car', 'sell-here.md', 'Instructions for contacting the dealership about selling a vehicle; the inquiry form is on the website.'),
    '',
    '## Customer resources',
    '',
    link('Payment portal', 'https://cherokeeautosales.paymycar.com/login', 'External payment login linked by the dealership for existing customers.'),
    link('Schedule an appointment', 'https://calendly.com/cherokeeautosales/30min', 'External appointment booking linked by the dealership.'),
    link('Privacy policy', 'privacy.md', 'Information about personal data and communications.'),
    '',
    '## Optional',
    '',
    link('Blog', '#blog', 'Educational articles about car buying and vehicle maintenance.'),
    ...articles,
    '',
  ].join('\n');

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
