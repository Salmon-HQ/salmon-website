// Copies the Salmon API's OpenAPI description from the backend repo, its source of truth, to public/openapi.yaml
// (verbatim) and public/openapi.json (the same document as JSON). Never edit those two files by hand.
// Usage: node scripts/sync-openapi.mjs [git ref of Salmon-HQ/salmon-wallet-backend, default main | path to a local openapi.yaml]
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { parse } from 'yaml';

const source = process.argv[2] ?? 'main';
const yaml = existsSync(source)
  ? readFileSync(source, 'utf8')
  : await fetch(`https://raw.githubusercontent.com/Salmon-HQ/salmon-wallet-backend/${source}/docs/openapi.yaml`).then((res) => {
      if (!res.ok) throw new Error(`could not fetch the spec at ${source}: HTTP ${res.status}`);
      return res.text();
    });

const spec = parse(yaml);
if (!/^3\./.test(spec.openapi ?? '')) throw new Error('not an OpenAPI 3 document');

writeFileSync('public/openapi.yaml', yaml);
writeFileSync('public/openapi.json', `${JSON.stringify(spec, null, 2)}\n`);
console.log(`${spec.info.title} ${spec.info.version} (OpenAPI ${spec.openapi}) from ${source}`);
