import { renderLegalMarkdown } from '@/lib/legal-markdown.mjs';

type LegalDocumentData = {
  title: string;
  markdown: string;
  effectiveLabel: string;
  effective: string;
};

export default function LegalDocument({ document }: { document: LegalDocumentData }) {
  return (
    <main className="pt-28 pb-20">
      <article className="mx-auto max-w-3xl px-6">
        <h1 className="text-4xl font-bold mb-6">{document.title}</h1>
        <p className="mb-10 text-text-secondary leading-relaxed">
          <strong className="text-text-primary">{document.effectiveLabel}:</strong> {document.effective}
        </p>
        <div className="text-text-secondary leading-relaxed">{renderLegalMarkdown(document.markdown)}</div>
      </article>
    </main>
  );
}
