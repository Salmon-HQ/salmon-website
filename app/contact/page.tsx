import type { Metadata } from 'next';
import PageShell from '@/components/legal/PageShell';

export const metadata: Metadata = {
  title: 'Contact Salmon Wallet',
  description: 'Official contact guidance for Salmon Wallet integrations, product, privacy, and security enquiries.',
  alternates: { canonical: '/contact' },
};

// Copied verbatim from salmon-website lib/info-pages.ts (infoPages.contact).
const page = {
  title: 'Contact Salmon Wallet',
  intro: 'Contact Salmon through the channel that matches your request. Email is the official route for integration, product, media, privacy, and security enquiries.',
  sections: [
    { heading: 'Integration and product enquiries', paragraphs: ['Write to integrations@salmonwallet.io if you want to propose a Solana integration, discuss a partnership, ask about product availability, or request factual information about Salmon. Include your project name, public website, technical documentation, relevant repositories, intended user journey, and a clear description of the value for wallet users.', 'Salmon reviews proposed integrations for security, user value, product coherence, technical compatibility, maintainability, partner commitment, and adoption potential. Sending an application does not guarantee production access, endorsement, distribution, or prominent placement.'] },
    { heading: 'Privacy and security', paragraphs: ['Privacy questions and requests may also be sent to integrations@salmonwallet.io. Describe the request without including a recovery phrase, private key, password, or other wallet secret. Salmon will never need those secrets to respond.', 'For a suspected security issue, provide reproducible technical detail and affected versions while avoiding public disclosure of an unpatched vulnerability. Never send funds or secret material by email. Because Salmon is self-custodial, the team cannot recover a wallet, reverse a transaction, or restore a recovery phrase.'] },
    { heading: 'Community channels', paragraphs: ['For public project updates, use the official X, Telegram, Medium, and GitHub links in the footer. Treat unsolicited direct messages as unverified. Confirm downloads and source repositories through salmonwallet.io before installing software or following instructions.'] },
  ],
} as const;

export default function ContactPage() {
  return (
    <PageShell>
      <article>
        <h1 className="mb-6 text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">{page.title}</h1>
        <p className="mb-12 text-lg text-[#10131c]/70">{page.intro}</p>
        <div className="space-y-10">
          {page.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="mb-4 text-2xl font-semibold">{section.heading}</h2>
              <div className="space-y-4 text-[#10131c]/80">
                {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              </div>
            </section>
          ))}
        </div>
      </article>
    </PageShell>
  );
}
