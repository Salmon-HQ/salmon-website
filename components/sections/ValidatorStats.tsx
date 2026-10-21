import { getTranslations } from 'next-intl/server';
import { getValidatorStats } from '@/lib/validator';
import { VALIDATOR } from '@/lib/constants';
import NumberTicker from '@/components/ui/NumberTicker';
import GradientButton from '@/components/ui/GradientButton';

interface StatProps {
  label: string;
  testId: string;
  children: React.ReactNode;
}

/** One cell of the single-line stat strip. */
function Stat({ label, testId, children }: StatProps) {
  return (
    <div
      role="listitem"
      className="flex shrink-0 snap-start flex-col gap-1.5 px-5 py-5 first:pl-5 sm:px-7 sm:first:pl-7 lg:flex-1 lg:shrink lg:px-5 lg:first:pl-5 [&:not(:first-child)]:border-l [&:not(:first-child)]:border-border-subtle"
    >
      <div
        data-testid={testId}
        className="whitespace-nowrap text-2xl font-semibold tracking-tight text-text-primary sm:text-3xl"
      >
        {children}
      </div>
      <p className="eyebrow whitespace-nowrap">{label}</p>
    </div>
  );
}

export default async function ValidatorStats() {
  const [stats, t] = await Promise.all([
    getValidatorStats(),
    getTranslations('validator'),
  ]);

  return (
    <section
      id="stake"
      data-testid="validator-stats"
      aria-labelledby="validator-heading"
      className="relative py-[var(--space-section)]"
    >
      <div className="mx-auto max-w-6xl px-[var(--space-gutter)]">
        <div className="mb-4 flex flex-wrap items-center gap-2.5">
          <p className="eyebrow-pill">{t('eyebrow')}</p>
          <span className="rounded-full bg-accent/10 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-accent">
            {t('since')}
          </span>
        </div>
        <h2
          id="validator-heading"
          className="font-display mb-5 max-w-2xl text-[length:var(--text-h2)] font-semibold leading-[1.05]"
        >
          {t('heading')}
        </h2>
        <p className="mb-10 max-w-2xl text-lg leading-relaxed text-text-secondary">
          {t('lead')}
        </p>

        {/* Single line: all stats inline. Mobile → horizontal scroll (stays one line). */}
        <div
          role="list"
          className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto rounded-2xl border border-border-subtle bg-card-bg/30 backdrop-blur"
        >
          {/* No estimated yield: a rate shown to UK visitors can be a cryptoasset
              promotion, pending counsel. */}
          <Stat label={t('commission')} testId="validator-commission">
            <NumberTicker value={stats.commission} suffix="%" />
          </Stat>
          <Stat label={t('activeStake')} testId="validator-stake">
            <NumberTicker value={stats.activeStake} suffix=" SOL" />
          </Stat>
          <Stat label={t('uptime')} testId="validator-uptime">
            <NumberTicker value={stats.uptime} decimals={1} suffix="%" />
          </Stat>
          <Stat label={t('skipRate')} testId="validator-skiprate">
            <NumberTicker value={stats.skipRate} suffix="%" />
          </Stat>
          <Stat label={t('wizScore')} testId="validator-wizscore">
            <NumberTicker value={stats.wizScore} />
          </Stat>
          <Stat label={t('status')} testId="validator-status">
            <span className="inline-flex items-center gap-2 whitespace-nowrap">
              <span
                className={`h-2.5 w-2.5 rounded-full ${stats.active ? 'bg-success' : 'bg-error'}`}
                aria-hidden="true"
              />
              {t('active')}
            </span>
          </Stat>
        </div>

        {/* Link to the validator's independently reported details. */}
        <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-3">
          <span className="eyebrow flex items-center gap-2 text-text-tertiary">
            <span
              className={`h-1.5 w-1.5 rounded-full ${stats.live ? 'bg-success' : 'bg-text-tertiary'}`}
              aria-hidden="true"
            />
            {stats.live ? t('live') : t('snapshot')} · {stats.name}
          </span>

          <GradientButton href={VALIDATOR.details} variant="primary" className="px-5 py-2.5">
            {t('stake')} ↗
          </GradientButton>
        </div>
      </div>
    </section>
  );
}
