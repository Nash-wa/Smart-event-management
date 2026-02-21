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

        // Fix ``${import.meta.env...
        if (content.includes('``${import')) {
            content = content.replace(/``\$\{import/g, '`${import');
            hasChanges = true;
        }

        if (hasChanges) {
            console.log('Fixed double backticks in:', filePath);
            fs.writeFileSync(filePath, content, 'utf-8');
        }
    }
});
console.log('Done.');
