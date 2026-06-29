import { createClient } from '@supabase/supabase-js';

process.loadEnvFile(".env.local")

const supabaseUrl = process.env.PUBLIC_SUPABASE_URL
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY

if (!supabaseUrl || !supabaseSecretKey) {
  throw new Error("Please specify the Supabase url and secret key")
}

const supabase = createClient(supabaseUrl, supabaseSecretKey);

const wcaClientId = process.env.SUPABASE_AUTH_EXTERNAL_WCA_CLIENT_ID
const wcaClientSecret = process.env.SUPABASE_AUTH_EXTERNAL_WCA_CLIENT_SECRET

if (!wcaClientId || !wcaClientSecret) {
  throw new Error("Please specify the WCA client id and secret key")
}

async function registerWCAProvider() {
  const { data, error } = await supabase.auth.admin.customProviders.createProvider({
    provider_type: 'oidc',
    identifier: 'custom:wca',
    name: 'WCA',
    client_id: wcaClientId,
    client_secret: wcaClientSecret,
    issuer: 'https://www.worldcubeassociation.org',
    scopes: ['public', 'openid', 'profile', 'email'],
  })

  if (error) {
    console.error('Error creating custom provider:', error);
    process.exitCode = 1;
  } else {
    console.log('WCA Custom Provider created successfully:', data);
  }
}

await registerWCAProvider().catch((error) => {
  console.error('Unexpected error creating custom provider:', error);
  process.exitCode = 1;
});
