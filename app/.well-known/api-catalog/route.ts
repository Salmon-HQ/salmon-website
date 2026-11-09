import { API_DOCS_URL, API_URL, OPENAPI_URL, SITE_URL } from '@/lib/site';

// RFC 9727 API catalog: a Linkset (RFC 9264) naming the Salmon API with its OpenAPI description and documentation.
export const dynamic = 'force-static';

const CATALOG_URL = `${SITE_URL}/.well-known/api-catalog`;
const CONTENT_TYPE = 'application/linkset+json; profile="https://www.rfc-editor.org/info/rfc9727"';

const linkset = {
  linkset: [
    {
      anchor: `${API_URL}/`,
      'service-desc': [
        { href: OPENAPI_URL, type: 'application/vnd.oai.openapi+json' },
        { href: `${SITE_URL}/openapi.yaml`, type: 'application/yaml' },
      ],
      'service-doc': [
        { href: `${SITE_URL}/api`, type: 'text/html' },
        { href: API_DOCS_URL, type: 'text/html' },
      ],
      status: [{ href: `${API_URL}/health` }],
    },
  ],
};

const headers = { 'content-type': CONTENT_TYPE, link: `<${CATALOG_URL}>; rel="api-catalog"` };

export function GET() {
  return new Response(JSON.stringify(linkset, null, 2), { headers });
}

export function HEAD() {
  return new Response(null, { headers });
}
