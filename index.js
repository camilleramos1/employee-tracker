// Import and require mysql2
const mysql = require('mysql2');


const db = mysql.createConnection(
    {
      host: 'localhost',
      // MySQL username,
      user: 'root',
      // MySQL password
      password: 'Atlas123!',
      database: 'employeetracker_db'
    },
    console.log(`Connected to the employeetracker_db database.`)
  );