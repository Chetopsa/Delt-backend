'use strict';
// require('dotenv').config();

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const basename = path.basename(__filename);
const env = 'production'; // process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env];
const db = {};

console.log("process.env.DATABASE_URL: ", process.env.DATABASE_URL);
const databaseUrl = process.env.DATABASE_URL; // Assuming it's something like 'postgres://username:password@localhost:5432/mydb'

// const parsedUrl = new URL(databaseUrl);

// Extract components
// const username = parsedUrl.username;
// const password = parsedUrl.password;
// const host = parsedUrl.hostname;
// const port = parsedUrl.port;
// const database = parsedUrl.pathname.split('/')[1]; // Removes the leading "/"
  
// console.log({
//   username,
//   password,
//   host,
//   port,
//   database,
// });
// const sequelize = new Sequelize({
//   dialect: 'postgres',
//   database: database,
//   username: username,
//   password: password,
//   host: host,
//   port: port,
//   dialectOptions: {
//     ssl: {
//       require: true,
//       rejectUnauthorized: false,
//     },
//   },
// });

let sequelize = new Sequelize(databaseUrl, {
  dialect: 'postgres',
  protocol: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
});
sequelize.authenticate()
  .then(() => console.log('Database connected'))
  .catch(err => console.error('Database connection error:', err));

// let sequelize;
// if (config.use_env_variable) {
//   sequelize = new Sequelize(process.env[config.use_env_variable], config);
// } else {
//   // should use this one
//   // console.log("config: ", config + " " + config.database + " " + config.username + " " + config.password);
//   sequelize = new Sequelize(config.database, config.username, config.password, config);
//   // sequelize = new Sequelize("postgres://chet:funny@postgres:5432/Deltdb");
// }

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
