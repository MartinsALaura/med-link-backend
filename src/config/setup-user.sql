-- One-time setup: run as MySQL root.
--   sudo mysql < src/config/setup-user.sql
-- Creates the application database and a dedicated user for the backend.

CREATE DATABASE IF NOT EXISTS medlink
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'medlink'@'localhost'
  IDENTIFIED BY 'M22JkWbrvsEPvsOzA2Aa9!#';

GRANT ALL PRIVILEGES ON medlink.* TO 'medlink'@'localhost';
FLUSH PRIVILEGES;
