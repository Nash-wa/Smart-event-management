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

        if (content.includes('http://localhost:5000/api')) {
            // Very simple replace
            content = content.replace(/http:\/\/localhost:5000\/api/g, '${import.meta.env.VITE_API_URL || \'http://localhost:5000/api\'}');
            // Fix double template literal wrappers if any
            content = content.replace(/'\$\{import\.meta\.env\.VITE_API_URL/g, '`${import.meta.env.VITE_API_URL');
            content = content.replace(/localhost:5000\/api\'\}'/g, 'localhost:5000/api\'}`');
            hasChanges = true;
        }

        if (content.includes('http://localhost:5000')) {
            content = content.replace(/'http:\/\/localhost:5000'/g, "(import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000')");
            content = content.replace(/http:\/\/localhost:5000/g, "${import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000'}");

            // fix single quotes turned literal
            content = content.replace(/'\$\{/g, '`${');
            content = content.replace(/5000\}'/g, '5000}`');

            hasChanges = true;
        }

        if (hasChanges) {
            console.log('Modified:', filePath);
            fs.writeFileSync(filePath, content, 'utf-8');
        }
    }
});
console.log('Done replacement again.');
