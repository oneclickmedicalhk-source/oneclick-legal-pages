import { writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';

const CMS_BASE_URL = process.env.CMS_BASE_URL || 'https://app.oneclick.hk';
const OUT_DIR = join(process.cwd(), 'docs');

function escapeHtml(s) {
  return String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function pageHtml({ canonicalUrl, title, description, bodyHtml }) {
  const t = escapeHtml(title);
  const d = escapeHtml(description);
  const c = escapeHtml(canonicalUrl);
  return `<!doctype html>
<html lang="zh-HK">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${t} | OneClick Wellness</title>
    <meta name="description" content="${d}" />
    <meta name="robots" content="index, follow" />
    <link rel="canonical" href="${c}" />
    <style>
      :root { color-scheme: light; }
      body { font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; margin: 0; background: #fff; color: #0f172a; }
      main { max-width: 768px; margin: 0 auto; padding: 40px 16px 56px; }
      header { border-bottom: 1px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 24px; }
      header .brand { font-size: 12px; font-weight: 600; color: #64748b; }
      header h1 { margin: 6px 0 0; font-size: 22px; font-weight: 700; letter-spacing: -0.01em; }
      .legal-cms h2 { font-size: 20px; font-weight: 700; margin: 22px 0 8px; color: #0f172a; }
      .legal-cms p { margin: 0 0 12px; line-height: 1.65; color: #334155; }
      .legal-cms ul { list-style: disc; padding-left: 20px; margin: 0 0 12px; color: #334155; }
      .legal-cms li { margin: 6px 0; line-height: 1.55; }
      .legal-cms strong { font-weight: 700; color: #0f172a; }
      .legal-cms a { color: #0f3360; text-decoration: underline; text-decoration-color: #cbd5e1; text-underline-offset: 2px; }
      .legal-cms a:hover { text-decoration-color: #0f3360; }
      footer { margin-top: 28px; font-size: 12px; color: #94a3b8; }
      .note { border: 1px solid #fde68a; background: #fffbeb; color: #78350f; border-radius: 10px; padding: 10px 12px; font-size: 13px; margin: 0 0 12px; }
    </style>
  </head>
  <body>
    <main>
      <header>
        <div class="brand">OneClick Wellness / 壹鍵康</div>
        <h1>${t}</h1>
      </header>
      <article class="legal-cms">${bodyHtml}</article>
      <footer>此頁內容由 OneClick Admin CMS 提供並同步更新。</footer>
    </main>
  </body>
</html>`;
}

async function fetchCms(slug) {
  const url = `${CMS_BASE_URL}/api/app/cms/${slug}`;
  const res = await fetch(url, {
    headers: { Accept: 'application/json', 'User-Agent': 'oneclick-legal-pages/1.0' },
  });
  if (!res.ok) {
    throw new Error(`Fetch ${slug} failed: ${res.status}`);
  }
  return await res.json();
}

async function writePage({ filename, canonicalUrl, titleFallback, description, bodyHtml }) {
  const html = pageHtml({
    canonicalUrl,
    title: titleFallback,
    description,
    bodyHtml,
  });
  await writeFile(join(OUT_DIR, filename), html, 'utf8');
}

await mkdir(OUT_DIR, { recursive: true });

const [privacy, deletion] = await Promise.all([
  fetchCms('privacy_policy'),
  fetchCms('data_deletion'),
]);

// Landing page
await writeFile(
  join(OUT_DIR, 'index.html'),
  `<!doctype html>
<html lang="zh-HK">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>OneClick Wellness 法律文件</title>
    <meta name="robots" content="index,follow" />
    <style>
      body { font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; margin: 0; padding: 32px 16px; color: #0f172a; background: #fff; }
      main { max-width: 720px; margin: 0 auto; }
      h1 { font-size: 22px; margin: 0 0 12px; }
      p { margin: 0 0 16px; color: #334155; line-height: 1.6; }
      a { color: #0f3360; text-decoration: underline; text-decoration-color: #cbd5e1; text-underline-offset: 2px; }
      a:hover { text-decoration-color: #0f3360; }
      .card { border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; background: #fafafa; }
      ul { margin: 0; padding-left: 18px; }
      li { margin: 10px 0; }
    </style>
  </head>
  <body>
    <main>
      <h1>OneClick Wellness 法律文件</h1>
      <p>以下頁面內容由後台 CMS 提供並同步更新。</p>
      <div class="card">
        <ul>
          <li><a href="/privacy-policy">私隱政策</a></li>
          <li><a href="/data-deletion">用戶資料刪除說明</a></li>
        </ul>
      </div>
    </main>
  </body>
</html>`,
  'utf8'
);

// Pages
await writePage({
  filename: 'privacy-policy.html',
  canonicalUrl: 'https://legal.oneclick.hk/privacy-policy',
  titleFallback: privacy?.title || '私隱政策',
  description: '壹鍵康 OneClick Wellness 私隱政策（公開頁面，供第三方平台查閱）。',
  bodyHtml: privacy?.body || '<p>（空白）</p>',
});

await writePage({
  filename: 'data-deletion.html',
  canonicalUrl: 'https://legal.oneclick.hk/data-deletion',
  titleFallback: deletion?.title || '用戶資料刪除說明',
  description: '如何要求刪除或停止使用於 OneClick Wellness（壹鍵康）應用程式及相關服務的個人資料（公開說明）。',
  bodyHtml: deletion?.body || '<p>（空白）</p>',
});

// Simple “pretty URL” via meta refresh fallback (for hosts that don't support rewrites)
await writeFile(
  join(OUT_DIR, 'privacy-policy', 'index.html'),
  '',
  'utf8'
).catch(async () => {
  await mkdir(join(OUT_DIR, 'privacy-policy'), { recursive: true });
  await writeFile(
    join(OUT_DIR, 'privacy-policy', 'index.html'),
    `<meta http-equiv="refresh" content="0;url=/privacy-policy.html">`,
    'utf8'
  );
});

await writeFile(
  join(OUT_DIR, 'data-deletion', 'index.html'),
  '',
  'utf8'
).catch(async () => {
  await mkdir(join(OUT_DIR, 'data-deletion'), { recursive: true });
  await writeFile(
    join(OUT_DIR, 'data-deletion', 'index.html'),
    `<meta http-equiv="refresh" content="0;url=/data-deletion.html">`,
    'utf8'
  );
});

console.log('Built docs/ from CMS:', CMS_BASE_URL);

