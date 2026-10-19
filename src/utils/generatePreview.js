export function generatePreviewHTML(files) {
  const htmlFile = files.find(f => /\.html?$/i.test(f.name));
  if (!htmlFile) return '<!doctype html><html><body style="font-family:system-ui;padding:2rem"><h2>No HTML file</h2><p>Create an HTML file to use Live Preview.</p></body></html>';
  let html = htmlFile.content || '';
  const css = files.filter(f => /\.css$/i.test(f.name)).map(f => `/* ${f.name} */\n${f.content || ''}`).join('\n');
  const js = files.filter(f => /\.(js|mjs|cjs)$/i.test(f.name)).map(f => `// ${f.name}\n${f.content || ''}`).join('\n');
  if (css) {
    const style = `<style data-codeforge="generated">${css}</style>`;
    html = /<\/head>/i.test(html) ? html.replace(/<\/head>/i, `${style}</head>`) : `${style}${html}`;
  }
  if (js) {
    const script = `<script data-codeforge="generated">${js.replace(/<\/script/gi, '<\\/script')}</script>`;
    html = /<\/body>/i.test(html) ? html.replace(/<\/body>/i, `${script}</body>`) : `${html}${script}`;
  }
  return html;
}
