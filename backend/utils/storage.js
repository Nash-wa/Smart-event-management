const fs = require('fs');
const path = require('path');

const STORAGE_DIR = path.join(__dirname, '../data');

if (!fs.existsSync(STORAGE_DIR)) {
    fs.mkdirSync(STORAGE_DIR);
}

const getFilePath = (collection) => path.join(STORAGE_DIR, `${collection}.json`);

const readData = (collection) => {
    const filePath = getFilePath(collection);
    if (!fs.existsSync(filePath)) return [];
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(content);
    } catch (e) {
        return [];
    }
};

const writeData = (collection, data) => {
    const filePath = getFilePath(collection);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
};

const storage = {
    find: (collection, query = {}) => {
        const data = readData(collection);
        if (Object.keys(query).length === 0) return data;
        return data.filter(item => {
            return Object.keys(query).every(key => item[key] === query[key]);
        });
    },
    findOne: (collection, query = {}) => {
        const data = readData(collection);
        return data.find(item => {
            return Object.keys(query).every(key => item[key] === query[key]);
        });
    },
    findById: (collection, id) => {
        const data = readData(collection);
        return data.find(item => (item._id || item.id) === id);
    },
    create: (collection, item) => {
        const data = readData(collection);
        const newItem = {
            _id: Math.random().toString(36).substr(2, 9),
            createdAt: new Date().toISOString(),
            ...item
        };
        data.push(newItem);
        writeData(collection, data);
        return newItem;
    },
    update: (collection, id, updates) => {
        let data = readData(collection);
        let updatedItem = null;
        data = data.map(item => {
            if ((item._id || item.id) === id) {
                updatedItem = { ...item, ...updates, updatedAt: new Date().toISOString() };
                return updatedItem;
            }
            return item;
        });
        writeData(collection, data);
        return updatedItem;
    },
    delete: (collection, id) => {
        let data = readData(collection);
        const filtered = data.filter(item => (item._id || item.id) !== id);
        writeData(collection, filtered);
        return true;
    }
};

module.exports = storage;
