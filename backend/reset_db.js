const db = require('./models');
const { execSync } = require('child_process');

async function resetDB() {
  try {
    console.log('Force syncing database (dropping and recreating tables)...');
    await db.sequelize.sync({ force: true });
    console.log('Database synced successfully.');
    
    console.log('Running seeders...');
    execSync('npx sequelize-cli db:seed:all', { stdio: 'inherit' });
    console.log('Seeders completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error resetting DB:', error);
    process.exit(1);
  }
}

resetDB();
