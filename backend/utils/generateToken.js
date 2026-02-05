const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'smart_event_secret_123', {
        expiresIn: '30d',
    });
};

module.exports = generateToken;
