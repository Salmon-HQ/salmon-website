import { VALIDATOR } from './constants';

export interface ValidatorStats {
  apy: number; // %
  commission: number; // %
  activeStake: number; // SOL
  uptime: number; // %
  skipRate: number; // %
  wizScore: number; // Stakewiz composite 0-100
  active: boolean; // !delinquent
  name: string;
  /** true = fetched live, false = static fallback (API unreachable). */
  live: boolean;
}

/**
 * Snapshot fallback (2026-10-15) so the section never renders empty if
 * Stakewiz is down.
 *
 * Refresh it when it drifts: a stale snapshot is worse than none, because it
 * is shown as fact precisely when the live source cannot correct it. The
 * previous one was three months old and understated the validator badly —
 * 18,951 SOL against 70,779, and 94.8% uptime against 99.98%.
 */
const FALLBACK: ValidatorStats = {
  apy: 4.86,
  commission: 5,
  activeStake: 71371.3,
  uptime: 99.99,
  skipRate: 0,
  wizScore: 70.18,
  active: true,
  name: 'Salmon Wallet',
  live: false,
};

/** Subset of the Stakewiz validator object we consume. */
interface StakewizValidator {
  total_apy: number;
  commission: number;
  activated_stake: number;
  uptime: number;
  skip_rate: number;
  wiz_score: number;
  delinquent: boolean;
  name: string;
}

/**
 * Live Solana validator stats from Stakewiz (no API key).
 * Cached 1h via Next data cache — Stakewiz updates ~every minute and asks callers not to poll hard.
 * Always resolves: returns the static snapshot if the API errors or returns junk.
 */
export async function getValidatorStats(): Promise<ValidatorStats> {
  try {
    const res = await fetch(
      `https://api.stakewiz.com/validator/${VALIDATOR.voteAccount}`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return FALLBACK;

    const v = (await res.json()) as Partial<StakewizValidator>;
    // Validate at the boundary — never trust the shape of external data.
    if (typeof v.total_apy !== 'number' || typeof v.activated_stake !== 'number') {
      return FALLBACK;
    }

    // Stakewiz switched `commission` from percent to basis points (500 = 5%).
    // A percentage can never exceed 100, so larger values must be bps.
    const rawCommission = v.commission ?? FALLBACK.commission;

    return {
      // `total_apy` is Stakewiz's TrueAPY (staking + Jito), the figure its page shows;
      // `apy_estimate` runs about double it.
      apy: v.total_apy,
      commission: rawCommission > 100 ? rawCommission / 100 : rawCommission,
      activeStake: v.activated_stake,
      uptime: v.uptime ?? FALLBACK.uptime,
      skipRate: v.skip_rate ?? FALLBACK.skipRate,
      wizScore: v.wiz_score ?? FALLBACK.wizScore,
      active: !v.delinquent,
      name: v.name ?? FALLBACK.name,
      live: true,
    };
  } catch {
    return FALLBACK;
  }
}
