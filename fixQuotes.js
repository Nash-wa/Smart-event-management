const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'frontend/src');

function walkDir(rootDir, callback) {
    fs.readdirSync(rootDir).forEach(f => {
        let dirPath = path.join(rootDir, f);
        if (fs.statSync(dirPath).isDirectory()) {
            walkDir(dirPath, callback);
        } else {
            callback(dirPath);
        }
    });
}

walkDir(dir, (filePath) => {
    if (filePath.endsWith('.js') || filePath.endsWith('.jsx')) {
        let content = fs.readFileSync(filePath, 'utf-8');
        let hasChanges = false;

        // Fix instances of: `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/events', {
        // and correctly change them to:
        // `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/events`, {

        const badSuffixRegex = /(\$\{import\.meta\.env\.VITE_API_URL \|\| 'http:\/\/localhost:5000\/api'\}[^'"`]*)[^\w/]'/g;

        // Actually, let's just use string replacement on line by line
        const lines = content.split('\n');
        const newLines = lines.map(line => {
            if (line.includes("VITE_API_URL")) {
                // We have a problem line
                // fetch(`${...}/events', {
                // fetch(`${...}/events`);
                // url = `${...}/search?district=${...}`;

                // A safer approach: simply replace all occurrences of `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}` with just:
                // import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
                // If we are passing it to fetch and adding something, we should just import it via a central api.js!

                // BUT api.js already exists!
            }
            return line;
        });

        // Instead of messing with lines, let's just revert to the static url and then properly enforce `api.get()` elsewhere where needed, or just revert to standard URL strings but wrapped correctly.
        // The easiest fix is just reversing the bad string.

        let fixedContent = content;
        // Fix `fetch(`${import.meta.env...}/...'`, ...
        // Specifically finding apostrophes that close template literals...
        fixedContent = fixedContent.replace(/\$\{import\.meta\.env\.VITE_API_URL \|\| 'http:\/\/localhost:5000\/api'\}([^']*?)'/g,
            "`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}$1`");

        // Handle api.js directly:
        if (filePath.endsWith('api.js')) {
            fixedContent = fixedContent.replace("`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}`", "import.meta.env.VITE_API_URL || 'http://localhost:5000/api'");
        }

        if (fixedContent !== content) {
            console.log('Fixed quotes in:', filePath);
            fs.writeFileSync(filePath, fixedContent, 'utf-8');
        }
    }
});
console.log('Done fix quotes.');
