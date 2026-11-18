import Database from 'better-sqlite3';
import {resolve} from 'node:path';

const databasePath = resolve(__dirname,'../../smartbet.db');

const db = new Database(databasePath, {fileMustExist:true});

db.pragma('foreign_keys = ON');
export default db;
