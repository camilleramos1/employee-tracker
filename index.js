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
);

db.connect((err) => {
    if (err) {
        throw err;
    }
    console.log(`Connected to the employeeTracker_db database.`);
    questions();
});
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

// function to view all departments name and id
function viewDepartments() {
    let action = `SELECT department.id AS Id, department_name AS Department FROM department`;
    db.query(action, (err, res) => {
        if (err) throw err;
        console.table(res)
        questions();
    })
};
// function to view all roles including role id, salary, title, and dept name
function viewRoles() {
    let action = `SELECT R.id AS Id, R.title AS Title, R.salary AS Salary, department.department_name AS Department 
    FROM role R JOIN department ON role.department_id = department.id order by role.id ASC;`
    db.query(action, (err,res) => {
        if (err) throw err;
        console.table(res);
        questions();
    })
};

function viewEmployees() {
    let action = `SELECT 
    E.id AS Id, 
    E.first_name AS "First Name", 
    E.last_name AS "Last Name", 
    role.title AS Title, 
    role.salary AS Salary, 
    department.department_name AS Department, 
    CONCAT(m.first_name,' ',m.last_name) AS Manager
    FROM employee E 
    INNER JOIN role ON role_id = role.id 
    INNER JOIN department ON department.id = role.department_id
    LEFT JOIN employee m on e.manager_id = m.id
    order by E.id;`
    db.query(action, (err, res) => {
        if (err) throw err;
        console.table(res);
        questions();
    })
};

// function updateEmployeeRole() {
//     db.query
// }
// db.query