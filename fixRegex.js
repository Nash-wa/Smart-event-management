const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'frontend/src');

function walkDir(rootDir, callback) {
    fs.readdirSync(rootDir).forEach(f => {
        let dirPath = path.join(rootDir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
    });
}

walkDir(dir, (filePath) => {
    if (filePath.endsWith('.js') || filePath.endsWith('.jsx')) {
        let content = fs.readFileSync(filePath, 'utf-8');
        let hasChanges = false;

        // The completely broken nested template literally created
        const badString1 = "${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000'}/api'}";
        const goodString1 = "${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}";

        // A slightly broken string 
        const badString2 = "(import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000')";
        const goodString2 = "(import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000')"; // actually this one was fine if just matching hostname

        // Another broken variation
        const badString3 = "${import.meta.env.VITE_API_URL || '`${import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000'}/api'}'";
        const badString4 = "${import.meta.env.VITE_API_URL || '${import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : ''http://localhost:5000''}/api'}".replace(/''/g, "'");

        // General match to wipe out the huge nested block
        const regex1 = /\$\{import\.meta\.env\.VITE_API_URL \|\| `\$\{import\.meta\.env\.VITE_API_URL \? import\.meta\.env\.VITE_API_URL\.replace\('\/api', ''\) : 'http:\/\/localhost:5000'\}\/api'\}/g;

        const regex2 = /`\$\{import\.meta\.env\.VITE_API_URL \? import\.meta\.env\.VITE_API_URL\.replace\('\/api', ''\) : 'http:\/\/localhost:5000'\}\/api'/g;

        if (content.match(regex1)) {
            content = content.replace(regex1, goodString1);
            hasChanges = true;
        }

        // If not matched by regex1, maybe it looks like this:
        // `${import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000'}/api'
        if (content.match(regex2)) {
            // we basically want to replace that whole mess with just the good string or url
            content = content.replace(regex2, "`" + goodString1);
            hasChanges = true;
        }

        // Hard fallback: just completely find exact string
        if (content.includes(badString1)) {
            content = content.split(badString1).join(goodString1);
            hasChanges = true;
        }

        if (hasChanges) {
            console.log('Fixed:', filePath);
            fs.writeFileSync(filePath, content, 'utf-8');
        }
    }
});
console.log('Done fix.');
