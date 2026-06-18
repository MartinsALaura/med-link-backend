import mysql from "mysql2/promise";
import { env } from "./env";

// Shared connection pool. Every model imports this single instance.
export const pool = mysql.createPool({
  host: env.db.host,
  port: env.db.port,
  user: env.db.user,
  password: env.db.password,
  database: env.db.database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // Required so MEDIUMBLOB/LONGBLOB columns come back as Buffer.
  // mysql2 returns Buffer for binary types by default.
  dateStrings: true,
});
