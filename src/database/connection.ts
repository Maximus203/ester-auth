import path from 'path';
import sqlite3 from 'sqlite3';

export class Database {
 private db: sqlite3.Database;
 private static instance: Database;

 private constructor() {
  const dbPath = process.env.DB_PATH || path.join(__dirname, '../../database/app.db');

  // Activer le mode verbose pour le développement
  const sqlite = sqlite3.verbose();

  this.db = new sqlite.Database(dbPath, (err) => {
   if (err) {
    console.error('❌ Erreur lors de la connexion à SQLite:', err.message);
   } else {
    console.log('✅ Connexion à SQLite établie');
    // Activer les clés étrangères
    this.db.run('PRAGMA foreign_keys = ON');
   }
  });
 }

 public static getInstance(): Database {
  if (!Database.instance) {
   Database.instance = new Database();
  }
  return Database.instance;
 }

 public getDatabase(): sqlite3.Database {
  return this.db;
 }

 public async run(sql: string, params: any[] = []): Promise<sqlite3.RunResult> {
  return new Promise((resolve, reject) => {
   this.db.run(sql, params, function (err) {
    if (err) {
     reject(err);
    } else {
     resolve(this);
    }
   });
  });
 }

 public async get<T = any>(sql: string, params: any[] = []): Promise<T | undefined> {
  return new Promise((resolve, reject) => {
   this.db.get(sql, params, (err, row) => {
    if (err) {
     reject(err);
    } else {
     resolve(row as T);
    }
   });
  });
 }

 public async all<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  return new Promise((resolve, reject) => {
   this.db.all(sql, params, (err, rows) => {
    if (err) {
     reject(err);
    } else {
     resolve(rows as T[]);
    }
   });
  });
 }

 public close(): void {
  this.db.close((err) => {
   if (err) {
    console.error('❌ Erreur lors de la fermeture de la base de données:', err.message);
   } else {
    console.log('✅ Connexion à la base de données fermée');
   }
  });
 }
}

export default Database.getInstance();
