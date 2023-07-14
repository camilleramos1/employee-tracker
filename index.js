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
            'Update An Employee Role',
            'Remove A Department',
            'Remove A Role',
            'Remove An Employee'
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
            case 'Remove A Department':
                deleteDepartment();
                break;
            case 'Remove A Role':
                deleteRole();
                break;
            case 'Remove An Employee':
                deleteEmployee();
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
    FROM role R JOIN department ON R.department_id = department.id order by R.id ASC;`
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

function addDepartment() {
    inquirer.prompt([
        {
        name: 'newName',
        type: 'input',
        message: 'Enter Name of New Department'
        }
    ]).then((data) => {
        const sql = `INSERT INTO department (department_name)
        VALUES (?);`;
        const params = [data.newName];
        db.query(sql, params, (err, res) => {
            if(res){
                console.log("New Department Has Been Added!")
            }else{
                throw err
            }
            questions();
        });
    })
}

function addRole() {
    db.query(`SELECT * FROM department;`, (err, result) => {
        if (err) throw err;
        inquirer.prompt([
            {
                name: 'newTitle',
                type: 'input',
                message: 'Enter Title of New Role'
            },
            {
                name: 'newSalary',
                type: 'input',
                message: 'Enter Salary of New Role'
            },
            {
                name: 'newDept',
                type: 'list',
                message: 'Which Department Does Role Belong In?',
                choices: result.map(department => ({
                    name: `${department.department_name}`,
                    value: department.id
                }))
            }
        ]).then((res) => {
          db.query(`INSERT INTO role SET ?;`,
            {
                title: res.newTitle,
                salary: res.newSalary, 
                department_id: res.newDept,
            },(err, result) => {
                if (err) throw err;
                console.log('New Role Has Been Added!')
                questions();
            })
        })
    })
}

function addEmployee() {
    // db.query(`SELECT * FROM role`, (err, res) => {
    inquirer.prompt([
    {
        type: 'input',
        name: 'newFirstName',
        message: "Enter Employee's first name"
    },
    {
        type: 'input',
        name: 'newLastName',
        message: "Enter Employee's last name"
    },
    ]).then((data) => {
        const input = [data.newFirstName, data.newLastName];
        const roleSql = `SELECT role.id, role.title FROM role`;
        db.query(roleSql, (err, data) => {
            if (err) throw err;
            const roleData = data.map(({ id, title }) => ({ 
                name: title, 
                value: id
            }));
            inquirer.prompt ([
                {
                    type: 'list',
                    name: 'newRole',
                    message: "Please Select Employee's role",
                    choices: roleData
                },
            ]).then((newRoleChoice) => {
                const newRole = newRoleChoice.newRole
                input.push(newRole);
                const managerSql = `SELECT * FROM  employee`;
                db.query(managerSql, (err, data) => {
                    if (err) throw err;
                    const managers = data.map(({ id, first_name, last_name }) => ({
                        name: first_name + " " + last_name,
                        value: id,
                    }));
                    inquirer.prompt([
                        {
                            type: 'list',
                            name: 'manager',
                            message: "Please Select Employee's Manager",
                            choices: managers
                        }
                    ]).then((managerChoice) => {
                        const newManager = managerChoice.manager;
                        input.push(newManager);
                        const sql = `INSERT INTO employee (first_name, last_name, role_id, manager_id) 
                        VALUES (?, ?, ?, ?);`;
                        db.query(sql, input, (err) => {
                            if (err) throw err;
                            console.log('New Employee Has Been Added!');
                            questions();
                        });
                    });
                });
            });
        });
    });
};

function updateEmployeeRole() {
    db.query(`SELECT * FROM employee`, (err, employee) => {
        if (err) throw err;
        db.query(`SELECT * FROM role`, (err, roles) => {
            const employeeChoice = employee.map(data => ({
                name: `${data.first_name} ${data.last_name} - Role ID:${data.role_id}`,
                value: data.id
            }))
            if (err) throw err;
            inquirer.prompt([
                {
                type: "list",
                name: "employee",
                message: "Which Employee Would You Like to Update?",
                choices: employeeChoice
                },
                {
                type: 'list',
                name: 'updatedRole',
                message: 'Please Select New Role:',
                choices: roles.map(newRole => ({
                    name: `${newRole.title}`,
                    value: newRole.id
                }))
                }
            ]).then((answers) => {
                db.query(`UPDATE employee SET ? WHERE ?`, [{ role_id: answers.updatedRole }, { id: answers.employee }], (err, res) => {
                    if (err) throw err;
                    console.log('Employee Role Has Been Updated!')
                    questions();
                })
            })
        })
    })
};    

function deleteDepartment() {
    db.query(`SELECT * FROM department`, (err, departments) => {
        if (err) throw err;
        inquirer.prompt([
            {
                type: 'list',
                name: 'deleteDept',
                message: 'Please Select Which Department To Remove',
                choices: departments.map(res => ({
                    name: `${res.department_name}`,
                    value: res.id
                }))
            }
        ]).then((data) => {
            db.query(`DELETE FROM department WHERE id = ${data.deleteDept}`, (err, res) => {
                if (err) throw err;
                console.log('Department Has Been Deleted.');
                questions();
            })
        })
    })
}