// The endpoints of the Salmon API, read from its OpenAPI description (public/openapi.json, synced from the backend
// repo), so /api and its Markdown version list exactly what the spec documents.
import spec from '@/public/openapi.json';

export type ApiOperation = { method: string; path: string; operationId: string; summary: string };

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
