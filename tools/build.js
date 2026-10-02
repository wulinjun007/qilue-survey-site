#!/usr/bin/env node
/* 页面组装：partials + pages/*.html → 根目录最终 HTML
   用法：node tools/build.js */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DOMAIN = 'https://qilue-survey-site.netlify.app';
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');

const header = read('partials/header.html');
const footer = read('partials/footer.html');

// 路由表：page file → 输出路径（与 PRD §04 一致）
const routes = [
  { page: 'index.html', out: 'index.html', nav: 'index', priority: '1.0' },
  { page: 'services-terrain.html', out: 'services/terrain-mapping.html', nav: 'services', priority: '0.9' },
  { page: 'services-aerial.html', out: 'services/aerial-data.html', nav: 'services', priority: '0.9' },
  { page: 'work.html', out: 'work.html', nav: 'work', priority: '0.8' },
  { page: 'about.html', out: 'about.html', nav: 'about', priority: '0.6' },
  { page: 'contact.html', out: 'contact.html', nav: 'contact', priority: '0.8' },
  { page: 'privacy.html', out: 'privacy.html', nav: '', priority: '0.3' },
  { page: '404.html', out: '404.html', nav: '', priority: '' }
];

for (const r of routes) {
  let body = read(path.join('pages', r.page));
  // 头部元信息：<!--TITLE:...--> <!--DESC:...-->
  const title = (body.match(/<!--TITLE:(.*?)-->/) || [])[1] || '重庆奇略测绘';
  const desc = (body.match(/<!--DESC:(.*?)-->/) || [])[1] || '工程测绘与空间数据服务官网';
  body = body.replace(/<!--TITLE:.*?-->\n?/, '').replace(/<!--DESC:.*?-->\n?/, '');

  let head = header
    .replace(/\{\{ROOT\}\}/g, r.out.includes('services/') ? '../' : './')
    .replace(new RegExp(`data-nav="${r.nav}"`, ''), `data-nav="${r.nav}" class="nav__link is-active"`);
  // is-active 注入：data-nav 属性后补 class（避免覆盖原 class）
  head = header
    .replace(/\{\{ROOT\}\}/g, r.out.includes('services/') ? '../' : './')
    .replace(/class="nav__link" data-nav="([^"]+)"/g, (m, id) =>
      id === r.nav ? `class="nav__link is-active" data-nav="${id}"` : m);

  let foot = footer.replace(/\{\{ROOT\}\}/g, r.out.includes('services/') ? '../' : './');

  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<meta name="description" content="${desc}">
<meta name="theme-color" content="#ffffff">
<link rel="canonical" href="${DOMAIN}/${r.out === 'index.html' ? '' : r.out}">
<link rel="icon" href="${r.out.includes('services/') ? '../' : './'}assets/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="${r.out.includes('services/') ? '../' : './'}assets/css/style.css">
</head>
<body class="has-contactbar">
${head}
<main id="main">
${body}
</main>
${foot}
</body>
</html>
`;
  const outPath = path.join(ROOT, r.out);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, html);
  console.log('build →', r.out);
}

// sitemap.xml（FR-009）
const sitemapItems = routes.filter(r => r.priority).map(r =>
  `  <url><loc>${DOMAIN}/${r.out === 'index.html' ? '' : r.out}</loc><priority>${r.priority}</priority></url>`).join('\n');
fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapItems}\n</urlset>\n`);
fs.writeFileSync(path.join(ROOT, 'robots.txt'), 'User-agent: *\nAllow: /\nSitemap: ' + DOMAIN + '/sitemap.xml\n');
console.log('build → sitemap.xml, robots.txt');
