// Import and require dependencies
const mysql = require('mysql2');
const inquirer = require("inquirer");
const cTable = require('console.table');

// creates connection to mysql
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
// this catches errs, and let's user know they are connected to the db if sucessful
db.connect((err) => {
    if (err) {
        throw err;
    }
    console.log(`Connected to the employeeTracker_db database.`);
    questions();
});
// prompts for user to select from using inquirer
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
            'Remove An Employee',
            'View Employees by Manager',
            'View Employees by Department',
            'View The Total Utilized Budget of a Department'
        ]
     }
    //  using a switch case since we have so many options. seemed easiest
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
            case 'View Employees by Manager':
                viewEmployeesByManager();
                break;
            case 'View Employees by Department':
                viewEmployeesByDepartment();
                break;
            case 'View The Total Utilized Budget of a Department':
                totalBudget();
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
// function to view all employees, using concatenate to view their manager as a name rather than an Id
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
// function to add a department
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
// function to add a role, user inputs title, salary, and department for role. using .map to retrieve info from seeds
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
// function to add an employee, using .map to grab info from seeds.sql for the list of roles
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
// function to update an exisitng employee's role
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
// function to delete a department from the list of options
function deleteDepartment() {
    db.query("SELECT * FROM department", (err, departments) => {
      if (err) throw err;
        inquirer.prompt([
          {
            type: "list",
            name: "departmentId",
            message: "Select the department to delete:",
            choices: departments.map((department) => ({
              name: department.department_name,
              value: department.id,
            })),
          },
        ])
        .then((answers) => {
          const departmentId = answers.departmentId;
          // Update the role table to set department_id to NULL for the selected department, 
        //   without this user will get an error because of foreign key constraints
          db.query(
            "UPDATE role SET department_id = NULL WHERE department_id = ?",
            [departmentId],
            (err, result) => {
              if (err) throw err;
              db.query(
                "DELETE FROM department WHERE id = ?",
                [departmentId],
                (err, result) => {
                  if (err) throw err;
                  console.log("Department has been deleted!");
                  questions();
                }
              );
            }
          );
        });
    });
  };
// function to delete a role from list of roles
  function deleteRole() {
    db.query("SELECT * FROM role", (err, roles) => {
      if (err) throw err;
      inquirer.prompt([
          {
            type: "list",
            name: "roleId",
            message: "Select the role to delete:",
            choices: roles.map((role) => ({
              name: role.title,
              value: role.id,
            })),
          },
        ])
        .then((answers) => {
          const roleId = answers.roleId;
          db.query("DELETE FROM role WHERE id = ?", [roleId], (err, result) => {
            if (err) throw err;
            console.log("Role has been deleted!");
            questions();
          });
        });
    });
  };
// function to delete an employee using id
  function deleteEmployee() {
    db.query("SELECT * FROM employee", (err, employees) => {
      if (err) throw err;
      inquirer.prompt([
          {
            type: "list",
            name: "employeeId",
            message: "Select the employee to delete:",
            choices: employees.map((employee) => ({
              name: `${employee.first_name} ${employee.last_name}`,
              value: employee.id,
            })),
          },
        ])
        .then((answers) => {
          const employeeId = answers.employeeId;
          db.query("DELETE FROM employee WHERE id = ?", [employeeId], (err, result) => {
            if (err) throw err;
            console.log("Employee has been deleted!");
            questions();
          });
        });
    });
  };
// function to view employees by manager, using concatenate again to pull managers as names rather than ids
  function viewEmployeesByManager() {
    db.query("SELECT * FROM employee", (err, employees) => {
      if (err) throw err;
      inquirer.prompt([
          {
            type: "list",
            name: "managerId",
            message: "Select the manager to view employees:",
            choices: employees.map((employee) => ({
              name: `${employee.first_name} ${employee.last_name}`,
              value: employee.id,
            })),
          },
        ]).then((answers) => {
          const managerId = answers.managerId;
          let action = `SELECT 
            E.id AS Id, 
            E.first_name AS "First Name", 
            E.last_name AS "Last Name", 
            role.title AS Title, 
            role.salary AS Salary, 
            department.department_name AS Department, 
            CONCAT(m.first_name, ' ', m.last_name) AS Manager
            FROM employee E
            INNER JOIN role ON E.role_id = role.id
            INNER JOIN department ON role.department_id = department.id
            LEFT JOIN employee m ON E.manager_id = m.id
            WHERE E.manager_id = ?;`;
          db.query(action, [managerId], (err, res) => {
            if (err) throw err;
            console.table(res);
            questions();
          });
        });
    });
  }
// function to view employees by department, again using concatenate to pull manager as name, so user can see managers as well as dept
  function viewEmployeesByDepartment() {
    db.query("SELECT * FROM department", (err, departments) => {
      if (err) throw err;
      inquirer.prompt([
          {
            type: "list",
            name: "departmentId",
            message: "Select the department to view employees:",
            choices: departments.map((department) => ({
              name: department.department_name,
              value: department.id,
            })),
          },
        ]).then((answers) => {
            const departmentId = answers.departmentId;
            let action = `SELECT 
            E.id AS Id, 
            E.first_name AS "First Name", 
            E.last_name AS "Last Name", 
            role.title AS Title, 
            role.salary AS Salary, 
            department.department_name AS Department, 
            CONCAT(m.first_name, ' ', m.last_name) AS Manager
            FROM 
            employee E
            INNER JOIN role ON E.role_id = role.id
            INNER JOIN department ON role.department_id = department.id
            LEFT JOIN employee m ON E.manager_id = m.id
            WHERE 
            department.id = ?;`;
            db.query(action, [departmentId], (err, res) => {
                if (err) throw err;
                console.table(res);
                questions();
            });
        });
    });
  };
// function to view the total utilized budget/combined salaries for a specific department
  function totalBudget() {
    db.query("SELECT * FROM department", (err, departments) => {
      if (err) throw err;
      inquirer.prompt([
          {
            type: "list",
            name: "departmentBudget",
            message: "Select the department to view total salary:",
            choices: departments.map((department) => ({
              name: department.department_name,
              value: department.id,
            })),
          },
        ]).then((answers) => {
            const departmentSalary = answers.departmentBudget;
            let action = `SELECT SUM(role.salary) AS 'Total Salary' FROM employee
            INNER JOIN role ON employee.role_id = role.id
            INNER JOIN department ON role.department_id = department.id WHERE department.id = ?;`;
            db.query(action, [departmentSalary], (err, res) => {
                if (err) throw err;
                console.table(res);
                questions();
            });
        });
    });
  }