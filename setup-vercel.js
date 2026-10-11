// setup-vercel.js
// Backend aur frontend dono ko Vercel par chalane ke liye zaroori files banata hai.
// Chalane ka tareeqa (project ke ROOT folder se, jahan backend aur frontend folders hain):
//     node setup-vercel.js
const fs = require('fs');
const path = require('path');

const FILES = {
"backend/api/index.js": "Ly8gVmVyY2VsIHNlcnZlcmxlc3MgZW50cnkgcG9pbnQgZm9yIHRoZSBJRFVSQVIgYmFja2VuZC4KY29uc3QgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKTsKY29uc3QgbW9kdWxlQWxpYXMgPSByZXF1aXJlKCdtb2R1bGUtYWxpYXMnKTsKCi8vIHNyYy8ga2UgcmVsYXRpdmUgcGF0aHMgKGdsb2JzLCBwdWcgdGVtcGxhdGVzKSBrZSBsaXllCnByb2Nlc3MuY2hkaXIocGF0aC5qb2luKF9fZGlybmFtZSwgJy4uJykpOwptb2R1bGVBbGlhcy5hZGRBbGlhcygnQCcsIHBhdGguam9pbihfX2Rpcm5hbWUsICcuLicsICdzcmMnKSk7Cgpjb25zdCBtb25nb29zZSA9IHJlcXVpcmUoJ21vbmdvb3NlJyk7CmNvbnN0IHsgZ2xvYlN5bmMgfSA9IHJlcXVpcmUoJ2dsb2InKTsKCi8vIFNhYXJlIG1vZGVscyByZWdpc3RlciBrYXJvIChzZXJ2ZXIuanMgYmhpIHllaGkga2FydGEgaGFpKQpmb3IgKGNvbnN0IGZpbGVQYXRoIG9mIGdsb2JTeW5jKCcuL3NyYy9tb2RlbHMvKiovKi5qcycpKSB7CiAgcmVxdWlyZShwYXRoLnJlc29sdmUoZmlsZVBhdGgpKTsKfQoKY29uc3QgYXBwID0gcmVxdWlyZSgnLi4vc3JjL2FwcCcpOwoKbGV0IGNvbm5lY3RpbmcgPSBudWxsOwoKYXN5bmMgZnVuY3Rpb24gY29ubmVjdERiKCkgewogIGlmIChtb25nb29zZS5jb25uZWN0aW9uLnJlYWR5U3RhdGUgPT09IDEpIHJldHVybjsKICBpZiAobW9uZ29vc2UuY29ubmVjdGlvbi5yZWFkeVN0YXRlID09PSAwKSBjb25uZWN0aW5nID0gbnVsbDsKICBpZiAoIWNvbm5lY3RpbmcpIHsKICAgIGNvbm5lY3RpbmcgPSBtb25nb29zZQogICAgICAuY29ubmVjdChwcm9jZXNzLmVudi5EQVRBQkFTRSwgeyBzZXJ2ZXJTZWxlY3Rpb25UaW1lb3V0TVM6IDgwMDAsIG1heFBvb2xTaXplOiA1IH0pCiAgICAgIC5jYXRjaCgoZXJyKSA9PiB7CiAgICAgICAgY29ubmVjdGluZyA9IG51bGw7CiAgICAgICAgdGhyb3cgZXJyOwogICAgICB9KTsKICB9CiAgYXdhaXQgY29ubmVjdGluZzsKfQoKbW9kdWxlLmV4cG9ydHMgPSBhc3luYyAocmVxLCByZXMpID0+IHsKICB0cnkgewogICAgYXdhaXQgY29ubmVjdERiKCk7CiAgfSBjYXRjaCAoZXJyKSB7CiAgICBjb25zb2xlLmVycm9yKCdEYXRhYmFzZSBjb25uZWN0aW9uIGVycm9yOicsIGVyci5tZXNzYWdlKTsKICAgIHJlcy5zdGF0dXNDb2RlID0gNTAwOwogICAgcmVzLnNldEhlYWRlcignQ29udGVudC1UeXBlJywgJ2FwcGxpY2F0aW9uL2pzb24nKTsKICAgIHJldHVybiByZXMuZW5kKAogICAgICBKU09OLnN0cmluZ2lmeSh7CiAgICAgICAgc3VjY2VzczogZmFsc2UsCiAgICAgICAgcmVzdWx0OiBudWxsLAogICAgICAgIG1lc3NhZ2U6ICdEYXRhYmFzZSBjb25uZWN0aW9uIGZhaWxlZDogJyArIGVyci5tZXNzYWdlLAogICAgICB9KQogICAgKTsKICB9CiAgcmV0dXJuIGFwcChyZXEsIHJlcyk7Cn07Cg==",
"backend/vercel.json": "ewogICJ2ZXJzaW9uIjogMiwKICAiZnVuY3Rpb25zIjogewogICAgImFwaS9pbmRleC5qcyI6IHsKICAgICAgImluY2x1ZGVGaWxlcyI6ICJzcmMvKioiLAogICAgICAibWF4RHVyYXRpb24iOiAzMAogICAgfQogIH0sCiAgInJld3JpdGVzIjogW3sgInNvdXJjZSI6ICIvKC4qKSIsICJkZXN0aW5hdGlvbiI6ICIvYXBpIiB9XQp9Cg==",
"frontend/vercel.json": "ewogICJyZXdyaXRlcyI6IFt7ICJzb3VyY2UiOiAiLyguKikiLCAiZGVzdGluYXRpb24iOiAiL2luZGV4Lmh0bWwiIH1dCn0K"
};

if (!fs.existsSync('backend') || !fs.existsSync('frontend')) {
  console.log('Error: ye script idurar-erp-crm ke root folder se chalao (jahan backend aur frontend folders hain).');
  process.exit(1);
}

for (const [rel, b64] of Object.entries(FILES)) {
  const target = path.join(process.cwd(), rel);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, Buffer.from(b64, 'base64'));
  console.log('  + ' + rel);
}

// Vercel ko Node ka sirf major version chahiye (20.x), "20.9.0" jaisa exact version nahi.
const pkgPath = path.join(process.cwd(), 'backend', 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.engines = pkg.engines || {};
if (pkg.engines.node !== '20.x') {
  pkg.engines.node = '20.x';
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
  console.log('  ~ backend/package.json (engines.node = 20.x)');
}

console.log('\nDone! Ab git add, commit aur push karo.');
