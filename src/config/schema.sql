-- MedLink database schema (MySQL).
-- Status values are stored in Portuguese to match the frontend (see docs/modelo-de-dados.md).
-- Files are stored as BLOBs directly in the database (decision 10).
-- Table order: partners → users → donations → requests (FK dependencies).

CREATE TABLE IF NOT EXISTS partners (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  trade_name      VARCHAR(255) NOT NULL,
  legal_name      VARCHAR(255) NOT NULL,
  cnpj            VARCHAR(18) NOT NULL UNIQUE,
  responsible     VARCHAR(255) NOT NULL,
  email           VARCHAR(255) NOT NULL,
  phone           VARCHAR(20) NOT NULL,
  mobile          VARCHAR(20) NOT NULL,
  cep             VARCHAR(10) NOT NULL,
  address         VARCHAR(255) NOT NULL,
  number          VARCHAR(20) NOT NULL,
  complement      VARCHAR(255) NULL,
  neighborhood    VARCHAR(255) NOT NULL,
  city            VARCHAR(255) NOT NULL,
  state           CHAR(2) NOT NULL,
  business_hours  VARCHAR(255) NOT NULL,
  latitude        DECIMAL(10, 7) NULL,
  longitude       DECIMAL(10, 7) NULL,
  notes           TEXT NULL,
  status          ENUM('pendente', 'ativo', 'inativo') NOT NULL DEFAULT 'pendente',
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS users (
  id                      INT AUTO_INCREMENT PRIMARY KEY,
  name                    VARCHAR(255) NOT NULL,
  cpf                     VARCHAR(14) NOT NULL UNIQUE,
  birth_date              DATE NOT NULL,
  phone                   VARCHAR(20) NOT NULL,
  email                   VARCHAR(255) NOT NULL UNIQUE,
  password_hash           VARCHAR(255) NOT NULL,
  cep                     VARCHAR(10) NOT NULL,
  address                 VARCHAR(255) NOT NULL,
  number                  VARCHAR(20) NOT NULL,
  complement              VARCHAR(255) NULL,
  neighborhood            VARCHAR(255) NOT NULL,
  city                    VARCHAR(255) NOT NULL,
  state                   CHAR(2) NOT NULL,
  identity_document       MEDIUMBLOB NOT NULL,
  identity_document_name  VARCHAR(255) NOT NULL,
  identity_document_type  VARCHAR(100) NOT NULL,
  sus_card_number         VARCHAR(20) NOT NULL,
  -- Null for regular users; set by ADMIN to link a PROFESSIONAL to their pharmacy.
  partner_id              INT NULL,
  photo                   MEDIUMBLOB NULL,
  photo_name              VARCHAR(255) NULL,
  photo_type              VARCHAR(100) NULL,
  role                    ENUM('USER', 'PROFESSIONAL', 'ADMIN') NOT NULL DEFAULT 'USER',
  status                  ENUM('ativo', 'bloqueado') NOT NULL DEFAULT 'ativo',
  created_at              DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at              DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_users_partner FOREIGN KEY (partner_id) REFERENCES partners(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS donations (
  id                      INT AUTO_INCREMENT PRIMARY KEY,
  donor_id                INT NOT NULL,
  pickup_point_id         INT NULL,
  triaged_by              INT NULL,
  name                    VARCHAR(255) NOT NULL,
  active_ingredient       VARCHAR(255) NOT NULL,
  concentration           VARCHAR(100) NOT NULL,
  dosage_form             VARCHAR(100) NOT NULL,
  laboratory              VARCHAR(255) NOT NULL,
  category                VARCHAR(100) NOT NULL,
  tarja                   VARCHAR(100) NOT NULL,
  quantity                INT NOT NULL,
  lote                    VARCHAR(100) NULL,
  expiration_date         DATE NOT NULL,
  description             TEXT NULL,
  donor_address           VARCHAR(255) NOT NULL,
  sealed                  BOOLEAN NOT NULL,
  original_packaging      BOOLEAN NOT NULL,
  requires_prescription   BOOLEAN NOT NULL,
  photo                   MEDIUMBLOB NOT NULL,
  photo_name              VARCHAR(255) NOT NULL,
  photo_type              VARCHAR(100) NOT NULL,
  indication              TEXT NULL,
  contraindication        TEXT NULL,
  care_notes              TEXT NULL,
  status                  ENUM('pendente', 'aprovado', 'recusado', 'concluido') NOT NULL DEFAULT 'pendente',
  created_at              DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at              DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_donations_donor FOREIGN KEY (donor_id) REFERENCES users(id),
  CONSTRAINT fk_donations_pickup FOREIGN KEY (pickup_point_id) REFERENCES partners(id),
  CONSTRAINT fk_donations_triaged_by FOREIGN KEY (triaged_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS requests (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  beneficiary_id  INT NOT NULL,
  donation_id     INT NOT NULL,
  status          ENUM('pendente', 'aprovado', 'recusado', 'entregue', 'cancelado') NOT NULL DEFAULT 'pendente',
  requested_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_requests_beneficiary FOREIGN KEY (beneficiary_id) REFERENCES users(id),
  CONSTRAINT fk_requests_donation FOREIGN KEY (donation_id) REFERENCES donations(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
