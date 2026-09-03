import mysql from "mysql2/promise";

/**
 * Creates all tables in the database if they don't exist yet.
 * Safe to run every time the server starts — CREATE TABLE IF NOT EXISTS
 * does nothing when the table is already there.
 */
export async function ensureTablesExist() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.warn("[InitDB] DATABASE_URL not set, skipping table creation.");
    return;
  }

  let connection: mysql.Connection | null = null;
  try {
    connection = await mysql.createConnection(connectionString);
    console.log("[InitDB] Connected. Checking/creating tables...");

    const statements = [
      `CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        openId VARCHAR(64) NOT NULL UNIQUE,
        name TEXT,
        email VARCHAR(320),
        loginMethod VARCHAR(64),
        role ENUM('user','admin') NOT NULL DEFAULT 'user',
        createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        lastSignedIn TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS servers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        idMestre VARCHAR(36) NOT NULL UNIQUE,
        matricula VARCHAR(32) NOT NULL UNIQUE,
        nomeOriginal TEXT NOT NULL,
        nomeNormalizado VARCHAR(255) NOT NULL,
        setor VARCHAR(180),
        cargo VARCHAR(180),
        categoria VARCHAR(80),
        status VARCHAR(64) DEFAULT 'Ativo',
        cpf VARCHAR(32) UNIQUE,
        rg VARCHAR(64),
        telefone VARCHAR(64),
        emailInstitucional VARCHAR(320),
        emailPessoal VARCHAR(320),
        cargaHoraria VARCHAR(32),
        dataNascimento DATE,
        dataContratacao DATE,
        dataTerminoVigencia DATE,
        participarComemoracao ENUM('Sim','Não') DEFAULT 'Sim',
        motivoNaoParticipar VARCHAR(255),
        docenteClasse VARCHAR(80),
        docenteNivel VARCHAR(32),
        tecnicoNivel INT,
        grau INT,
        referencia INT,
        estagiarioCalculaVigencia ENUM('Sim','Não') DEFAULT 'Não',
        contagemRenovacao INT DEFAULT 0,
        terceirizadoSubstituto ENUM('Sim','Não') DEFAULT 'Não',
        idServidorSubstituido INT,
        incentivoTipo VARCHAR(120),
        incentivoPortaria VARCHAR(180),
        incentivoDataInicio DATE,
        incentivoDataValidade DATE,
        afastamentoMotivo VARCHAR(80),
        afastamentoDataInicio DATE,
        afastamentoDataFim DATE,
        afastamentoDocumentoSei VARCHAR(180),
        ultimaVarredura TIMESTAMP NULL,
        createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS terceirizados (
        id INT AUTO_INCREMENT PRIMARY KEY,
        serverId INT,
        nomeOriginal TEXT NOT NULL,
        nomeNormalizado VARCHAR(255) NOT NULL,
        cpf VARCHAR(32) UNIQUE,
        cargoFuncao VARCHAR(180),
        setor VARCHAR(180),
        localLotacao VARCHAR(180),
        telefone VARCHAR(64),
        email VARCHAR(320),
        empresa VARCHAR(255) NOT NULL,
        contrato VARCHAR(120) NOT NULL,
        numeroContrato VARCHAR(120),
        inicioContrato DATE,
        fimContrato DATE,
        situacaoContrato VARCHAR(64),
        dataNascimento DATE,
        observacoes TEXT,
        sourceModule VARCHAR(120) NOT NULL,
        createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (serverId) REFERENCES servers(id)
      )`,
      `CREATE TABLE IF NOT EXISTS contacts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        serverId INT,
        terceirizadoId INT,
        nomeOriginal TEXT NOT NULL,
        setorOriginal VARCHAR(180),
        telefoneOriginal VARCHAR(64),
        emailOriginal VARCHAR(320),
        sourceModule VARCHAR(120) NOT NULL,
        createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (serverId) REFERENCES servers(id),
        FOREIGN KEY (terceirizadoId) REFERENCES terceirizados(id)
      )`,
      `CREATE TABLE IF NOT EXISTS serviceRecords (
        id INT AUTO_INCREMENT PRIMARY KEY,
        serverId INT,
        nomeOriginal TEXT NOT NULL,
        setor VARCHAR(180),
        cargo VARCHAR(180),
        dataNascimento DATE,
        dataContratacao DATE,
        averbacaoDias INT,
        sourceModule VARCHAR(120) NOT NULL,
        createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (serverId) REFERENCES servers(id)
      )`,
      `CREATE TABLE IF NOT EXISTS interns (
        id INT AUTO_INCREMENT PRIMARY KEY,
        serverId INT,
        matricula VARCHAR(32),
        nomeOriginal TEXT NOT NULL,
        cursando VARCHAR(180),
        setorAtuacao VARCHAR(180),
        turno VARCHAR(64),
        responsavel VARCHAR(180),
        numeroProcesso VARCHAR(120),
        bolsa VARCHAR(100),
        dataContratacao DATE,
        dataNascimento DATE,
        vencimento DATE,
        renovacao VARCHAR(32),
        sourceModule VARCHAR(120) NOT NULL,
        createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (serverId) REFERENCES servers(id)
      )`,
      `CREATE TABLE IF NOT EXISTS frequenciasTerceirizados (
        id INT AUTO_INCREMENT PRIMARY KEY,
        terceirizadoId INT,
        nomeOriginal TEXT NOT NULL,
        empresa VARCHAR(255) NOT NULL,
        contrato VARCHAR(120) NOT NULL,
        pagina INT,
        mesReferencia VARCHAR(64),
        dataEmissao VARCHAR(64),
        funcao VARCHAR(180),
        turno VARCHAR(64),
        ocorrencias TEXT,
        dias INT,
        substituto VARCHAR(180),
        sourceModule VARCHAR(120) NOT NULL,
        createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (terceirizadoId) REFERENCES terceirizados(id)
      )`,
      `CREATE TABLE IF NOT EXISTS functionalActs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        serverId INT,
        tipo VARCHAR(100) NOT NULL,
        portaria VARCHAR(180),
        processoSei VARCHAR(180),
        setor VARCHAR(180),
        cargaHoraria VARCHAR(32),
        sourceModule VARCHAR(120) NOT NULL,
        createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (serverId) REFERENCES servers(id)
      )`,
      `CREATE TABLE IF NOT EXISTS productionIncentives (
        id INT AUTO_INCREMENT PRIMARY KEY,
        serverId INT,
        matricula VARCHAR(32),
        nomeOriginal TEXT NOT NULL,
        numeroPortaria VARCHAR(180),
        colegiado VARCHAR(180),
        dataInicio DATE,
        dataTermino DATE,
        diasFaltantes VARCHAR(64),
        sourceModule VARCHAR(120) NOT NULL,
        createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (serverId) REFERENCES servers(id)
      )`,
      `CREATE TABLE IF NOT EXISTS serverChangeHistory (
        id INT AUTO_INCREMENT PRIMARY KEY,
        serverId INT,
        matricula VARCHAR(32),
        fieldName VARCHAR(120) NOT NULL,
        previousValue TEXT,
        newValue TEXT,
        changedBy VARCHAR(255) NOT NULL,
        reason VARCHAR(255),
        eventType VARCHAR(80),
        processSei VARCHAR(180),
        publicationNumber VARCHAR(180),
        doeLink VARCHAR(500),
        startDate DATE,
        endDate DATE,
        publicationDate DATE,
        createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (serverId) REFERENCES servers(id)
      )`,
      `CREATE TABLE IF NOT EXISTS importRuns (
        id INT AUTO_INCREMENT PRIMARY KEY,
        source VARCHAR(255) NOT NULL,
        version VARCHAR(64) NOT NULL,
        status ENUM('dry_run','committed','failed') NOT NULL,
        insertedCount INT NOT NULL DEFAULT 0,
        updatedCount INT NOT NULL DEFAULT 0,
        pendingCount INT NOT NULL DEFAULT 0,
        notes TEXT,
        scheduleCronTaskUid VARCHAR(65) UNIQUE,
        createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS detectedPublications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        serverId INT,
        matricula VARCHAR(32),
        nomeOriginal TEXT,
        sourceKey VARCHAR(80) NOT NULL,
        sourceLabel VARCHAR(180) NOT NULL,
        sourceUrl VARCHAR(500) NOT NULL,
        documentUrl VARCHAR(500),
        eventType VARCHAR(80) NOT NULL,
        publicationDate DATE,
        description TEXT,
        documentText TEXT,
        scanMode ENUM('historical','daily') NOT NULL,
        fingerprint VARCHAR(64) NOT NULL UNIQUE,
        reviewStatus ENUM('pending','approved','discarded') NOT NULL DEFAULT 'pending',
        createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (serverId) REFERENCES servers(id)
      )`,
      `CREATE TABLE IF NOT EXISTS importConflicts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        runId INT,
        serverId INT,
        module VARCHAR(120) NOT NULL,
        recordKey VARCHAR(120),
        conflictType VARCHAR(100) NOT NULL,
        details TEXT NOT NULL,
        status ENUM('pending','resolved','ignored') NOT NULL DEFAULT 'pending',
        createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (runId) REFERENCES importRuns(id),
        FOREIGN KEY (serverId) REFERENCES servers(id)
      )`,
    ];

    for (const statement of statements) {
      await connection.query(statement);
    }
    // Adiciona colunas novas em tabelas já existentes, sem apagar dados.
    const columnsToAdd: Array<{ table: string; column: string; definition: string }> = [
      { table: "servers", column: "cargoComissionado", definition: "VARCHAR(80)" },
      { table: "servers", column: "substitutoComissionado", definition: "VARCHAR(180)" },
      { table: "servers", column: "portariaSubstituicao", definition: "VARCHAR(180)" },
    ];

    for (const { table, column, definition } of columnsToAdd) {
      const [rows] = await connection.query(
        `SELECT COUNT(*) as cnt FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
        [table, column]
      );
      const exists = (rows as any)[0]?.cnt > 0;
      if (!exists) {
        await connection.query(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
        console.log(`[InitDB] Added column ${column} to ${table}.`);
      }
    }
    console.log("[InitDB] All tables verified/created successfully.");
  } catch (error) {
    console.error("[InitDB] Failed to create tables:", error);
  } finally {
    if (connection) await connection.end();
  }
}
