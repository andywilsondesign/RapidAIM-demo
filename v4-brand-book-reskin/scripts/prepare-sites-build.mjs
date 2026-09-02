import { cp, mkdir, writeFile } from 'node:fs/promises';

await cp('storybook-static', 'dist/storybook', { recursive: true });
await mkdir('dist/server', { recursive: true });

const worker = `const INDEX_PATH = '/index.html';
const STORYBOOK_INDEX_PATH = '/storybook/index.html';

const hasFileExtension = (pathname) => /\\.[^/]+$/.test(pathname);

const fetchAsset = (env, request, pathname) => {
  const url = new URL(request.url);
  url.pathname = pathname;
  return env.ASSETS.fetch(new Request(url, request));
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const response = await env.ASSETS.fetch(request);

    if (response.status !== 404) {
      return response;
    }

    if (url.pathname.startsWith('/storybook')) {
      return fetchAsset(env, request, STORYBOOK_INDEX_PATH);
    }

    if (!hasFileExtension(url.pathname)) {
      return fetchAsset(env, request, INDEX_PATH);
    }

    return response;
  },
};
`;

await writeFile('dist/server/index.js', worker);
