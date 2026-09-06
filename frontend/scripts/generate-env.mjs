import fs from 'fs';
import path from 'path';
import url from 'url';
import { parseArgs, mustBeUrl, chunk, isBad } from './utils.mjs';
import { SSMClient, GetParametersCommand } from '@aws-sdk/client-ssm';

// Tiny args: node scripts/generate-dotenv.mjs staging --region ap-southeast-1 --out .env

const args = parseArgs(process.argv);

const STAGE = args._[0] || process.env.SSM_STAGE; // dev | staging | prod
const REGION = args.region || process.env.AWS_REGION || 'ap-southeast-1';
const OUT = args.out || '.env';

if (!STAGE) {
  console.error('❌ Missing stage. Usage: node scripts/generate-dotenv.mjs <dev|staging|prod>');
  process.exit(1);
}
if (!['dev', 'staging', 'prod'].includes(STAGE)) {
  console.error(`❌ Invalid stage "${STAGE}". Allowed: dev, staging, prod.`);
  process.exit(1);
}

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const OUT_ABS = path.isAbsolute(OUT) ? OUT : path.join(__dirname, '..', OUT);

const ssm = new SSMClient({ region: REGION });

/**
 * Map of logical keys -> array of candidate SSM parameter names (first found wins).
 * Note: These SSM parameters are added manually in the AWS console, and must match the names here.
 */
const parameterNames = {
  VITE_API_AUTH_BASE_URL: `/techtix/auth-api-url-${STAGE}`,
  VITE_API_EVENTS_BASE_URL: `/techtix/events-api-url-${STAGE}`,
  VITE_API_PAYMENT_BASE_URL: `/techtix/payment-api-url-${STAGE}`
};

/**
 * CloudWatch RUM configuration, written by durianpy-root-infra. Optional: a
 * stage without an app monitor should mean no browser telemetry, not a failed
 * build. src/utils/rum.ts skips initialisation when these are absent.
 */
const optionalParameterNames = {
  VITE_RUM_APP_MONITOR_ID: `/techtix/rum-app-monitor-id-${STAGE}`,
  VITE_RUM_IDENTITY_POOL_ID: `/techtix/rum-identity-pool-id-${STAGE}`,
  VITE_RUM_REGION: `/techtix/rum-region-${STAGE}`,
  VITE_RUM_SESSION_SAMPLE_RATE: `/techtix/rum-session-sample-rate-${STAGE}`,
  VITE_RUM_REPLAY_SAMPLE_RATE: `/techtix/rum-replay-sample-rate-${STAGE}`
};

async function fetchParams(names) {
  const nameToValue = {};
  const invalidParams = [];

  for (const batch of chunk(names, 10)) {
    const resp = await ssm.send(
      new GetParametersCommand({
        Names: batch,
        WithDecryption: true
      })
    );
    for (const p of resp.Parameters ?? []) nameToValue[p.Name] = p.Value;
    if (resp.InvalidParameters?.length) invalidParams.push(...resp.InvalidParameters);
  }
  return { nameToValue, invalid: invalidParams };
}

function serializeEnv(obj) {
  return (
    Object.entries(obj)
      // Escape newlines to keep .env one-line per var
      .map(([k, v]) => `${k}=${String(v).replace(/\r?\n/g, '\\n')}`)
      .join('\n') + '\n'
  );
}

async function main() {
  console.log(`ℹ️ Generating ${OUT} for stage="${STAGE}" (region: ${REGION})`);

  const names = [...Object.values(parameterNames), ...Object.values(optionalParameterNames)];
  const optionalSsmNames = new Set(Object.values(optionalParameterNames));
  const { nameToValue, invalid } = await fetchParams(names);

  const missing = [];
  const envOut = {};

  for (const [envKey, ssmName] of Object.entries(parameterNames)) {
    const val = nameToValue[ssmName];
    const bad = isBad(val);
    if (bad) missing.push(`${envKey} (${ssmName}) ${bad}`);
    else envOut[envKey] = val;
  }

  const skippedOptional = [];

  for (const [envKey, ssmName] of Object.entries(optionalParameterNames)) {
    const val = nameToValue[ssmName];
    if (isBad(val)) skippedOptional.push(`${envKey} (${ssmName})`);
    else envOut[envKey] = val;
  }

  // Optional parameters that were simply not found are expected, not errors.
  const blockingInvalid = invalid.filter((n) => !optionalSsmNames.has(n));

  if (blockingInvalid.length || missing.length) {
    const lines = [];
    if (missing.length) {
      lines.push('Missing/invalid values:');
      for (const m of missing) lines.push(`  - ${m}`);
    }
    if (blockingInvalid.length) {
      lines.push('Invalid SSM parameter names (not found):');
      for (const n of blockingInvalid) lines.push(`  - ${n}`);
    }
    throw new Error(lines.join('\n'));
  }

  if (skippedOptional.length) {
    console.log(`\u2139\ufe0f  CloudWatch RUM not configured for stage="${STAGE}"; skipping:`);
    for (const s of skippedOptional) console.log(`  - ${s}`);
  }

  // Optional sanity: ensure these look like URLs
  mustBeUrl('VITE_API_AUTH_BASE_URL', envOut.VITE_API_AUTH_BASE_URL);
  mustBeUrl('VITE_API_EVENTS_BASE_URL', envOut.VITE_API_EVENTS_BASE_URL);
  mustBeUrl('VITE_API_PAYMENT_BASE_URL', envOut.VITE_API_PAYMENT_BASE_URL);

  fs.writeFileSync(OUT_ABS, serializeEnv(envOut));
  console.log(`✅ Wrote ${OUT_ABS}`);
}

main().catch((e) => {
  console.error('❌ Failed to generate .env:\n' + (e?.stack || e));
  process.exit(1);
});
