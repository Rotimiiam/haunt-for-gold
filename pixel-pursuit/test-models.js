try {
    const { User, GameHistory } = require('./models');
    const sequelize = require('./config/database');
    console.log('Models loaded successfully');

    sequelize.authenticate().then(() => {
        console.log('Database authenticated');
        process.exit(0);
    }).catch(err => {
        console.error('Database auth error:', err);
        process.exit(1);
    });
} catch (error) {
    console.error('Error loading models:', error);
    process.exit(1);
}
