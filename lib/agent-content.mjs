import { getLegalDocument, legalDocumentToMarkdown } from './legal-content.mjs';

const BASE_URL = 'https://salmonwallet.io';

const content = {
  en: {
    name: 'Salmon Wallet',
    description: 'Open-source, self-custodial wallet infrastructure for Solana. Salmon is available as a web wallet, browser extension, and Android app.',
    sections: [
      ['What Salmon is', 'Salmon keeps the wallet core lightweight and understandable: create or import a wallet, receive funds, send transactions, understand signing requests, and use Solana integrations. Optional Powerups add capabilities without making every feature part of the core.'],
      ['Integrations', 'Projects can apply through an open process. Salmon evaluates security, user value, product coherence, technical compatibility, maintainability, and adoption potential before an integration reaches production. Technical inclusion does not guarantee endorsement or prominent placement.'],
      ['Open infrastructure', 'The wallet is open source and self-custodial. Salmon aims to give emerging Solana projects a structured route from integration to measurable usage while keeping production access curated and accountable.'],
    ],
  },
  es: {
    name: 'Salmon Wallet',
    description: 'Infraestructura de wallet open source y autocustodial para Solana. Salmon está disponible como wallet web, extensión de navegador y aplicación para Android.',
    sections: [
      ['Qué es Salmon', 'Salmon mantiene el núcleo de la wallet liviano y comprensible: crear o importar una wallet, recibir fondos, enviar transacciones, entender solicitudes de firma y usar integraciones de Solana. Los Powerups opcionales agregan capacidades sin sumar cada función al núcleo.'],
      ['Integraciones', 'Los proyectos pueden aplicar mediante un proceso abierto. Salmon evalúa seguridad, valor para usuarios, coherencia de producto, compatibilidad técnica, mantenimiento y potencial de adopción antes de llevar una integración a producción. La inclusión técnica no garantiza respaldo ni visibilidad destacada.'],
      ['Infraestructura abierta', 'La wallet es open source y autocustodial. Salmon busca dar a proyectos emergentes de Solana un camino estructurado desde la integración hasta el uso medible, con acceso a producción curado y responsable.'],
    ],
  },
  pt: {
    name: 'Salmon Wallet',
    description: 'Infraestrutura de carteira open source e de autocustódia para Solana. A Salmon está disponível como carteira web, extensão de navegador e aplicativo Android.',
    sections: [
      ['O que é a Salmon', 'A Salmon mantém o núcleo da carteira leve e compreensível: criar ou importar uma carteira, receber fundos, enviar transações, entender solicitações de assinatura e usar integrações Solana. Powerups opcionais adicionam recursos sem tornar cada função parte do núcleo.'],
      ['Integrações', 'Projetos podem se candidatar por um processo aberto. A Salmon avalia segurança, valor para usuários, coerência de produto, compatibilidade técnica, manutenção e potencial de adoção antes de uma integração chegar à produção. Inclusão técnica não garante endosso nem destaque.'],
      ['Infraestrutura aberta', 'A carteira é open source e de autocustódia. A Salmon busca oferecer a projetos emergentes da Solana um caminho estruturado da integração ao uso mensurável, mantendo o acesso à produção curado e responsável.'],
    ],
  },
};

export const supportedLocales = Object.freeze(Object.keys(content));

export function acceptsJson(acceptHeader = '*/*') {
  const accepted = acceptHeader.toLowerCase();
  return accepted.includes('*/*') || accepted.includes('application/json');
}

export function withVary(existing, value) {
  const values = (existing ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  if (!values.some((item) => item.toLowerCase() === value.toLowerCase())) values.push(value);
  return values.join(', ');
}

export function prefersMarkdown(acceptHeader = '') {
  const accepted = acceptHeader
    .toLowerCase()
    .split(',')
    .map((part, index) => {
      const [type, ...parameters] = part.trim().split(';');
      const qualityParameter = parameters.find((parameter) => parameter.trim().startsWith('q='));
      const quality = qualityParameter ? Number.parseFloat(qualityParameter.split('=')[1]) : 1;
      return { type, quality: Number.isFinite(quality) ? quality : 0, index };
    })
    .filter(({ quality }) => quality > 0)
    .sort((a, b) => b.quality - a.quality || a.index - b.index);

  const markdown = accepted.find(({ type }) => type === 'text/markdown');
  if (!markdown) return false;

  const html = accepted.find(({ type }) => type === 'text/html' || type === 'application/xhtml+xml');
  return !html || markdown.quality >= html.quality;
}

export function routeDetails(pathname) {
  const segments = pathname.split('/').filter(Boolean);
  const locale = supportedLocales.includes(segments[0]) ? segments.shift() : 'en';
  const route = `/${segments.join('/')}`;

  if (['/', '/privacy', '/terms', '/about', '/contact', '/developers', '/brand'].includes(route)) {
    return { locale, route };
  }

  return null;
}

function links(locale) {
  const prefix = locale === 'en' ? '' : `/${locale}`;
  return [
    `- [Homepage](${BASE_URL}${prefix || '/'})`,
    `- [Privacy policy](${BASE_URL}${prefix}/privacy)`,
    `- [About](${BASE_URL}${prefix}/about)`,
    `- [Contact](${BASE_URL}${prefix}/contact)`,
    `- [Developer resources](${BASE_URL}${prefix}/developers)`,
    `- [Brand resources](${BASE_URL}${prefix}/brand)`,
    `- [Terms](${BASE_URL}${prefix}/terms)`,
    `- [Sitemap](${BASE_URL}/sitemap.xml)`,
    `- [Agent index](${BASE_URL}/llms.txt)`,
    `- [OpenAPI description](${BASE_URL}/openapi.json)`,
    '- [Source code](https://github.com/Salmon-HQ/salmon-wallet-frontend)',
  ].join('\n');
}

export function markdownForRoute({ locale, route }) {
  const page = content[locale] ?? content.en;

  if (route === '/privacy') {
    return `${legalDocumentToMarkdown(getLegalDocument(locale, 'privacy'))}\n## Where to look next\n\n${links(locale)}\n`;
  }

  if (route === '/terms') {
    return `${legalDocumentToMarkdown(getLegalDocument(locale, 'terms'))}\n## Where to look next\n\n${links(locale)}\n`;
  }

  if (route === '/about') return `# About Salmon Wallet\n\n${page.description}\n\n## What Salmon builds\n\nSalmon keeps essential wallet activity focused and provides a reviewed path for optional Solana integrations. It is open source and self-custodial: Salmon does not hold recovery phrases or control user funds.\n\n## Accountability\n\nPublic claims are grounded in inspectable source code, live products, and verifiable infrastructure. Salmon passed a 2024 security audit sponsored by the Eclipse Foundation and performed by Halborn.\n\n## Where to look next\n\n${links(locale)}\n`;
  if (route === '/contact') return `# Contact Salmon Wallet\n\nEmail integrations@salmonwallet.io for integration, product, media, privacy, or security enquiries. Never send a recovery phrase, private key, password, or funds. Salmon cannot restore a self-custodial wallet or reverse a transaction.\n\n## Integration requests\n\nInclude your project name, public technical documentation, relevant repositories, intended user journey, and the expected value for wallet users. An application does not guarantee production access, endorsement, distribution, or placement.\n\n## Where to look next\n\n${links(locale)}\n`;
  if (route === '/developers') return `# Salmon Wallet API Docs and Developer Resources\n\nSalmon publishes a read-only discovery API at ${BASE_URL}/api/v1/discovery and its OpenAPI 3.1 description at ${BASE_URL}/openapi.json. No authentication is required. Clients must inspect RFC RateLimit fields and honor Retry-After after HTTP 429.\n\n## Capability boundaries\n\nThe website does not publish a wallet-management, authentication, webhook, or MCP API. The official CLI is read-only and cannot access keys or sign transactions.\n\n## Where to look next\n\n${links(locale)}\n`;
  if (route === '/brand') return `# Salmon Wallet Brand Resources\n\nApproved Salmon Wallet logos, colors, typography, and downloadable brand assets.\n\n## Brand system\n\nThe Salmon symbol is used when space is limited or the product name is already nearby. The complete logo is preferred when introducing Salmon. The primary brand typeface is DM Sans. Salmon orange (#FF5C45) is the primary accent and navy (#10131C) grounds the web palette.\n\n## Downloads\n\n- [Download the complete media kit](${BASE_URL}/downloads/salmonwallet-mediakit.zip)\n\nThe kit contains approved PNG and SVG assets plus the complete brand guidelines. Preserve logo proportions and clear space.\n\n## Where to look next\n\n${links(locale)}\n`;

  const sections = page.sections
    .map(([heading, body]) => `## ${heading}\n\n${body}`)
    .join('\n\n');

  return `# ${page.name}\n\n${page.description}\n\n${sections}\n\n## Product access\n\n- [Web wallet](https://v2.salmonwallet.io/)\n- [Browser extension](https://chromewebstore.google.com/detail/salmon-wallet/ejbidfepgijlcgahbmbckmnaljagjoll)\n- [Android app](https://play.google.com/store/apps/details?id=io.salmonwallet.app)\n\n## Site navigation\n\n${links(locale)}\n`;
}

export function markdownNotFound(pathname) {
  return `# 404 — Page not found\n\nNo Salmon Wallet page exists at \`${pathname}\`.\n\n## Where to look next\n\n- [Homepage](${BASE_URL}/)\n- [Sitemap](${BASE_URL}/sitemap.xml)\n- [Agent index](${BASE_URL}/llms.txt)\n- [OpenAPI description](${BASE_URL}/openapi.json)\n- [Source code](https://github.com/Salmon-HQ/salmon-wallet-frontend)\n`;
}
