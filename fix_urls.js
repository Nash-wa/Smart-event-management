const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    if (!fs.existsSync(dir)) return results;
    const list = fs.readdirSync(dir);
    list.forEach(function (file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk('./frontend/src');

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // Pattern for single quoted urls: 'http://localhost:5000/api/endpoint...'
    // Replace with: `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/endpoint...`
    content = content.replace(/'http:\/\/localhost:5000\/api([^']*)'/g, "`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}$1`");

    // Pattern for double quoted urls: "http://localhost:5000/api/endpoint..."
    content = content.replace(/"http:\/\/localhost:5000\/api([^"]*)"/g, "`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}$1`");

    // Pattern for template literals that use the raw URL: `http://localhost:5000/api/endpoint...`
    // We replace the raw URL part
    content = content.replace(/http:\/\/localhost:5000\/api/g, "${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}");

    // There are some urls that are just `http://localhost:5000` or `http://localhost:5000/` that we should change.
    // Replace: `http://localhost:5000/` with `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/`
    // But since VITE_API_URL already has /api, if we see `http://localhost:5000/endpoints`, and they are NOT `/api`, wait, all routes in server.js are behind `/api`.
    // Wait, the logs show some files use `http://localhost:5000/api/events/...` so the above regex covers it!

    if (original !== content) {
        // We might have accidentally double replaced some if the third regex hit the first two.
        // Actually, let's reset and just do a simple replacement for all `http://localhost:5000/api`
        // First convert 'http://localhost:5000/api...' to `http://localhost:5000/api...`
        original = original.replace(/'http:\/\/localhost:5000\/api([^']*)'/g, "`http://localhost:5000/api$1`");
        original = original.replace(/"http:\/\/localhost:5000\/api([^"]*)"/g, "`http://localhost:5000/api$1`");

        // Then convert `http://localhost:5000/api` to `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}`
        original = original.replace(/http:\/\/localhost:5000\/api/g, "${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}");

        fs.writeFileSync(file, original, 'utf8');
        console.log(`Updated: ${file}`);
    }
});
