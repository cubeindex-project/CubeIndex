import { PUBLIC_DEPLOYMENT_CHANNEL } from '$env/static/public';
import { readFile } from 'fs/promises';
import path from 'path';
import type { RequestHandler } from './$types';

export const prerender = true;

export const GET: RequestHandler = async () => {
  const manifestPath = path.resolve('src/routes/(public)/manifest.json');
  let raw = await readFile(manifestPath, { encoding: 'utf-8' });
  
  const suffix = (PUBLIC_DEPLOYMENT_CHANNEL?.toLowerCase() === 'beta') ? ' Beta' : '';
  
  raw = raw
    .replace(/{SUFFIX}/g, suffix);
  
  const manifest = JSON.parse(raw);
  
  return new Response(JSON.stringify(manifest), {
    headers: {
      'Content-Type': 'application/manifest+json'
    }
  });
};
