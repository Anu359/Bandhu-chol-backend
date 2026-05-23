require('dotenv').config();
const { createClient } = require('@libsql/client');

async function checkTables() {
  const client = createClient({
    url: process.env.TURSO_CONNECTION_URL,
    authToken: process.env.TURSO_AUTH_TOKEN
  });
  
  const result = await client.execute(`
    SELECT name FROM sqlite_master 
    WHERE type='table' AND name NOT LIKE 'sqlite_%'
  `);
  
  console.log('Tables in database:');
  result.rows.forEach(row => {
    console.log(`  - ${row.name}`);
  });
}

checkTables().catch(console.error);