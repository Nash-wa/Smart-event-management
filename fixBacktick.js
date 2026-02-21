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

        // Fix `http...'} -> 'http...'}
        if (content.includes("`http://localhost:5000/api'}") || content.includes("|| `http://localhost:5000/api'}")) {
            content = content.replace(/`http:\/\/localhost:5000\/api'\}/g, "'http://localhost:5000/api'}");
            hasChanges = true;
        }

        if (hasChanges) {
            console.log('Fixed backtick in:', filePath);
            fs.writeFileSync(filePath, content, 'utf-8');
        }
    }
});
console.log('Done fix backtick.');
