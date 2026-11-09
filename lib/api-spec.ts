// The endpoints of the Salmon API, read from its OpenAPI description (public/openapi.json, synced from the backend
// repo), so /api and its Markdown version list exactly what the spec documents.
import spec from '@/public/openapi.json';

// How the backend limits requests (src/middlewares/rate-limit.js in salmon-wallet-backend). The per-minute figures
// live in SSM, so they are not quoted here.
export const API_RATE_LIMITS = [
  'Requests are counted per IP in one-minute windows, with a stricter limit on the routes that build transactions (NFT transfers and burns, Powerups, swaps).',
  'Over the limit, the API answers 429 with the error code too_many_requests and a Retry-After header: the number of seconds until the window resets. Wait that long before retrying.',
  'Responses do not carry RateLimit headers yet, so Retry-After on a 429 is the signal to slow down.',
];

// The published policy for the Salmon API's versions (decided 2026-11-09).
export const API_VERSIONING = [
  'The API is versioned in the URL path: /v1. The service-info endpoints /health and /status are unversioned.',
  'Changes inside a version are backward compatible: fields and endpoints can be added, never removed or renamed.',
  'Breaking changes ship under a new version path (/v2), served alongside the previous one.',
  'An endpoint or version is retired with at least 180 days of notice: its responses carry a Deprecation header (RFC 9745) and a Sunset header (RFC 8594) with the retirement date, and it is announced on this page.',
];

export type ApiOperation ={ method: string; path: string; operationId: string; summary: string };

const METHODS = ['get', 'post', 'put', 'patch', 'delete'] as const;

type Operation = { operationId?: string; summary?: string; tags?: string[] };

export const apiVersion = spec.info.version;

export const apiGroups = spec.tags.map((tag) => ({
  name: tag.name,
  description: tag.description,
  operations: Object.entries(spec.paths as Record<string, Partial<Record<(typeof METHODS)[number], Operation>>>)
    .flatMap(([path, item]) =>
      METHODS.flatMap((method) => {
        const op = item[method];
        return op?.tags?.includes(tag.name)
          ? [{ method: method.toUpperCase(), path, operationId: op.operationId ?? '', summary: op.summary ?? '' }]
          : [];
      }),
    ),
})).filter((group) => group.operations.length > 0);
