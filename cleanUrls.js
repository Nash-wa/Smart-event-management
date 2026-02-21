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

        // Nuke the existing broken logic completely using regex matching any start and end of that specific literal injection
        const brokenRegex = /`?\$\{[^{]*import\.meta\.env\.VITE_API_URL[^}]*\}[^\n]*/g;

        // Instead of nuking, let's just properly fix the strings containing `.../api'}` or similar mismatched quotes.
        // Basically, any `fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/events', {`
        // needs to become `fetch(\`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/events\`, {`

        const lines = content.split('\n');
        const newLines = lines.map(line => {
            if (line.includes('import.meta.env.VITE_API_URL || \'http://localhost:5000/api\'}')) {
                // It has the interpolation. 
                // If it lacks a starting backtick, add it.
                // Note: earlier scripts might have left something like `await fetch(${import...}/events', {` (no backtick before $)

                // A safe way is to extract the URI path after api} and rebuild the string.
                // E.g. match `/events',` or `/admin/users'};`
                const match = line.match(/\$\{import\.meta\.env\.VITE_API_URL \|\| 'http:\/\/localhost:5000\/api'\}([^'"`]*)['"`]/);
                if (match) {
                    const pathParts = match[1];
                    // Just rebuild the line securely
                    let newLine = line.replace(match[0], `\$\{import.meta.env.VITE_API_URL || 'http://localhost:5000/api'\}${pathParts}\``);
                    // Ensure it starts with a backtick at the right place.
                    if (newLine.includes('fetch($')) newLine = newLine.replace('fetch($', 'fetch(`$');
                    if (newLine.includes('fetch(`${import')) newLine = newLine; // already fine
                    if (newLine.includes('url = $')) newLine = newLine.replace('url = $', 'url = `$');
                    if (newLine.includes('localUrl = $')) newLine = newLine.replace('localUrl = $', 'localUrl = `$');

                    hasChanges = true;
                    return newLine;
                }
            }
            return line;
        });

        if (hasChanges) {
            console.log('Cleaned:', filePath);
            fs.writeFileSync(filePath, newLines.join('\n'), 'utf-8');
        }
    }
});
console.log('Done cleanup.');
