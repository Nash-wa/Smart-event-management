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

        // Fix `Authorization': `Bearer -> 'Authorization': `Bearer
        // OR `Content-Type': 'application/json' -> 'Content-Type': 'application/json'

        // Let's globally regex anything that starts a line or space with ` and ends with ':

        const lines = content.split('\n');
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i];

            // specifically for authorization
            if (line.includes("`Authorization':")) {
                lines[i] = line.replace("`Authorization':", "'Authorization':");
                hasChanges = true;
            }
            if (line.includes("`Content-Type':")) {
                lines[i] = line.replace("`Content-Type':", "'Content-Type':");
                hasChanges = true;
            }
            // just general properties like `something': 
            let re = /([ {]+)`([a-zA-Z0-9_-]+)':/g;
            if (re.test(line)) {
                lines[i] = line.replace(re, "$1'$2':");
                hasChanges = true;
            }
        }

        if (hasChanges) {
            console.log('Fixed quotes in props:', filePath);
            fs.writeFileSync(filePath, lines.join('\n'), 'utf-8');
        }
    }
});
console.log('Done fix quote props.');
