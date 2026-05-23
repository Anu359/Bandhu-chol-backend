// Turso Database Client - Wrapper to keep existing code working
const { createClient } = require('@libsql/client');
const bcrypt = require('bcryptjs');  // ADD THIS AT TOP

let client = null;

function getClient() {
  if (!client) {
    client = createClient({
      url: process.env.TURSO_CONNECTION_URL,
      authToken: process.env.TURSO_AUTH_TOKEN
    });
  }
  return client;
}

// Mimic Mongoose functions so existing routes work without changes
class TursoModel {
  constructor(tableName) {
    this.table = tableName;
  }

  async find(query = {}) {
    const db = getClient();
    let sql = `SELECT * FROM ${this.table}`;
    const params = [];
    
    if (Object.keys(query).length > 0) {
      const conditions = [];
      for (const [key, value] of Object.entries(query)) {
        conditions.push(`${key} = ?`);
        params.push(value);
      }
      sql += ` WHERE ${conditions.join(' AND ')}`;
    }
    
    const result = await db.execute({ sql, args: params });
    return { rows: result.rows };
  }

  async findOne(query) {
    const result = await this.find(query);
    return result.rows[0] || null;
  }

  async findById(id) {
    const result = await this.find({ _id: id });
    return result.rows[0] || null;
  }

  async insert(data) {
    const db = getClient();
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map(() => '?').join(',');
    
    const sql = `INSERT INTO ${this.table} (${keys.join(',')}) VALUES (${placeholders})`;
    await db.execute({ sql, args: values });
    return { insertedId: values[0] };
  }

  async save() {
    // This is for Mongoose compatibility
    // For Turso, we use insert or update
    if (this._id) {
      return await this.update({ _id: this._id }, this);
    } else {
      return await this.insert(this);
    }
  }

  async update(query, data) {
    const db = getClient();
    const setClause = Object.keys(data).map(k => `${k} = ?`).join(',');
    const whereClause = Object.keys(query).map(k => `${k} = ?`).join(' AND ');
    
    const sql = `UPDATE ${this.table} SET ${setClause} WHERE ${whereClause}`;
    const params = [...Object.values(data), ...Object.values(query)];
    await db.execute({ sql, args: params });
    return { modifiedCount: 1 };
  }

  async delete(query) {
    const db = getClient();
    const whereClause = Object.keys(query).map(k => `${k} = ?`).join(' AND ');
    const sql = `DELETE FROM ${this.table} WHERE ${whereClause}`;
    await db.execute({ sql, args: Object.values(query) });
    return { deletedCount: 1 };
  }

  async comparePassword(plainPassword) {
    return await bcrypt.compare(plainPassword, this.password);
  }
}

// Export models that match your existing models
const User = new TursoModel('users');
const Message = new TursoModel('messages');
const Note = new TursoModel('notes');
const Syllabus = new TursoModel('syllabus');
const PYQ = new TursoModel('pyqs');

module.exports = { User, Message, Note, Syllabus, PYQ, getClient };