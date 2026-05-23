// Database initialization - Creates all tables
const { getClient } = require('./client');

async function initDatabase() {
  const db = getClient();
  
  // Users table (matches your User model)
  await db.execute(`
    CREATE TABLE IF NOT EXISTS users (
      _id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      rollNo TEXT UNIQUE NOT NULL,
      department TEXT NOT NULL,
      year INTEGER NOT NULL,
      section TEXT NOT NULL,
      isBatchCoordinator INTEGER DEFAULT 0,
      isUnionMember INTEGER DEFAULT 0,
      unionId TEXT,
      profilePic TEXT DEFAULT '',
      isVerified INTEGER DEFAULT 0,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // Messages table (with file upload support)
  await db.execute(`
    CREATE TABLE IF NOT EXISTS messages (
      _id TEXT PRIMARY KEY,
      sender TEXT NOT NULL,
      text TEXT NOT NULL,
      room TEXT NOT NULL,
      file TEXT DEFAULT '',
      messageType TEXT DEFAULT 'text',
      fileUrl TEXT DEFAULT '',
      fileName TEXT DEFAULT '',
      fileSize INTEGER DEFAULT 0,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // Notes table (UPDATED with fileType for links/files)
  await db.execute(`
    CREATE TABLE IF NOT EXISTS notes (
      _id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      fileUrl TEXT NOT NULL,
      fileType TEXT DEFAULT 'file',
      subject TEXT NOT NULL,
      department TEXT NOT NULL,
      year INTEGER NOT NULL,
      uploadedBy TEXT NOT NULL,
      downloads INTEGER DEFAULT 0,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // Syllabus table (matches your Syllabus model)
  await db.execute(`
    CREATE TABLE IF NOT EXISTS syllabus (
      _id TEXT PRIMARY KEY,
      subject TEXT NOT NULL,
      semester INTEGER NOT NULL,
      type TEXT DEFAULT 'syllabus',
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      link TEXT DEFAULT '',
      department TEXT NOT NULL,
      year INTEGER NOT NULL,
      uploadedBy TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // PYQ table (matches your PYQ model)
  await db.execute(`
    CREATE TABLE IF NOT EXISTS pyqs (
      _id TEXT PRIMARY KEY,
      subject TEXT NOT NULL,
      semester INTEGER NOT NULL,
      year INTEGER NOT NULL,
      fileUrl TEXT NOT NULL,
      department TEXT NOT NULL,
      uploadedBy TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  console.log('✅ All tables created/verified');
}

module.exports = { initDatabase };