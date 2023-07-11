// Import and require dependencies
const mysql = require('mysql2');
const inquirer = require("inquirer");
const cTable = require('console.table');


const db = mysql.createConnection(
    {
      host: 'localhost',
      // MySQL username,
      user: 'root',
      // MySQL password
      password: 'Atlas123!',
      database: 'employeeTracker_db'
    },
    db.connect((err) => {
        if (err) {
            throw err;
        }
        console.log(`Connected to the employeeTracker_db database.`);
        questions();
    })
);
// prompts for user to select from
function questions() {
    inquirer.prompt([
        {
        name:'begin',
        type: 'list',
        message: 'What would you like to do?',
        choices: [
            'View All Departments',
            'View All Roles',
            'View All Employees',
            'Add A Department',
            'Add A Role',
            'Add An Employee',
            'Update An Employee Role'
        ]
     }
    ]).then((answers) => {
        switch (answers.begin) {
            case 'View All Departments':
                viewDepartments();
                break;
            case 'View All Roles':
                viewRoles();
                break;
            case 'View All Employees':
                viewEmployees();
                break;
            case 'Add A Department':
                addDepartment();
                break;
            case 'Add A Role':
                addRole();
                break;
            case 'Add An Employee':
                addEmployee();
                break;
            case 'Update An Employee Role':
                updateEmployeeRole();
                break;
        }  
    });
};

// function to view all departments
const viewDepartments = () => {
    const action = `SELECT department_name FROM department`
    db.query(action, (err, res) => {
        if (err) throw err;
        console.table(res)
    })
};

