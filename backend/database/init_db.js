const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const { pool } = require("../config/db");

const runSQL = async () => {
  try {
    console.log("Starting database initialization...");

    // 1. Read and run schema.sql
    const schemaPath = path.join(__dirname, "schema.sql");
    const schemaSql = fs.readFileSync(schemaPath, "utf8");
    console.log("Executing schema.sql...");
    await pool.query(schemaSql);
    console.log("Schema created successfully.");

    // 2. Read and run seed.sql
    const seedPath = path.join(__dirname, "seed.sql");
    const seedSql = fs.readFileSync(seedPath, "utf8");
    console.log("Executing seed.sql...");
    await pool.query(seedSql);
    console.log("Categories and products seeded successfully.");

    // 3. Seed users dynamically using bcryptjs
    console.log("Seeding default users...");
    const adminEmail = "admin@eshop.com";
    const adminPassword = "admin123";
    const userEmail = "user@eshop.com";
    const userPassword = "user123";

    const salt = await bcrypt.genSalt(10);
    const adminHash = await bcrypt.hash(adminPassword, salt);
    const userHash = await bcrypt.hash(userPassword, salt);

    // Insert admin user
    await pool.query(
      `INSERT INTO users (name, email, password, role) 
       VALUES ($1, $2, $3, $4) 
       ON CONFLICT (email) DO NOTHING`,
      ["Shop Admin", adminEmail, adminHash, "admin"]
    );
    console.log(`Admin user created: ${adminEmail} (password: ${adminPassword})`);

    // Insert regular test user
    await pool.query(
      `INSERT INTO users (name, email, password, role) 
       VALUES ($1, $2, $3, $4) 
       ON CONFLICT (email) DO NOTHING`,
      ["John Doe", userEmail, userHash, "user"]
    );
    console.log(`Regular test user created: ${userEmail} (password: ${userPassword})`);

    console.log("Database initialization completed successfully!");
  } catch (err) {
    console.error("Database initialization failed:", err);
  } finally {
    await pool.end();
  }
};

runSQL();
