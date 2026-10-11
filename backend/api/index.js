// Vercel serverless entry point for the IDURAR backend.
const path = require('path');
const moduleAlias = require('module-alias');

// src/ ke relative paths (globs, pug templates) ke liye
process.chdir(path.join(__dirname, '..'));
moduleAlias.addAlias('@', path.join(__dirname, '..', 'src'));

const mongoose = require('mongoose');
const { globSync } = require('glob');

// Saare models register karo (server.js bhi yehi karta hai)
for (const filePath of globSync('./src/models/**/*.js')) {
  require(path.resolve(filePath));
}

const app = require('../src/app');

let connecting = null;

async function connectDb() {
  if (mongoose.connection.readyState === 1) return;
  if (mongoose.connection.readyState === 0) connecting = null;
  if (!connecting) {
    connecting = mongoose
      .connect(process.env.DATABASE, { serverSelectionTimeoutMS: 8000, maxPoolSize: 5 })
      .catch((err) => {
        connecting = null;
        throw err;
      });
  }
  await connecting;
}

module.exports = async (req, res) => {
  try {
    await connectDb();
  } catch (err) {
    console.error('Database connection error:', err.message);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    return res.end(
      JSON.stringify({
        success: false,
        result: null,
        message: 'Database connection failed: ' + err.message,
      })
    );
  }
  return app(req, res);
};
