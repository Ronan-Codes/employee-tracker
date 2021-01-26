const inquirer = require('inquirer');
const cTable = require('console.table');
const mysql = require('mysql2');

// Connect to Database
const connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '26signs',
    database: 'employeeDB'
});

connection.connect(err => {
    if (err) throw err;

    console.log('Connected as id ' + connection.threadId + '\n');
    startApp();
});

function showMenu() {
    return inquirer.prompt([
        {
            type: "list",
            name: "mainMenu",
            message: 'Which action would you like to do? ',
            choices: [
                { name: "View all of the departments", value: "getDepartments" },
                { name: "View all of the roles", value: "getRoles" },
                { name: "View all of the employees", value: "getEmployees" },
                { name: "Add a department", value: "addDepartment" },
                { name: "Add a role", value: "addRole" },
                { name: "Add an employee", value: "addEmployee" },
                { name: "Update an employee's role", value: "updateRole" },
                { name: "Exit Application", value: "exit" }
            ]
        }
    ]);
};

function getDepartments() {
    connection.query('SELECT department.id, department.name AS department FROM department',
        function(err, res) {
            if (err) throw err;
            console.table(res);

            startApp();
        }
    );
};

function getRoles() {
    const sql = `SELECT role.id, role.title, role.salary, department.name AS department
                FROM role
                LEFT JOIN department
                ON role.department_id = department.id`;

    connection.query(sql,
        function(err, res) {
            if (err) throw err;
            console.table(res);

            startApp();
        }
    );
};

function getEmployees() {
    const sql = `SELECT employee1.id, employee1.first_name, employee1.last_name, role.title, department.name AS department, role.salary, CONCAT(employee2.first_name, " ", employee2.last_name) AS manager
            FROM employee AS employee1
            LEFT JOIN role ON employee1.role_id = role.id
            LEFT JOIN department ON role.department_id = department.id
            LEFT JOIN employee AS employee2 ON employee1.manager_id = employee2.id`;

    connection.query(sql,
        function(err, res) {
            if (err) throw err;
            console.table(res);

            startApp();
        }
    );
};


// -------

async function addDepartment() {
    const response = await inquirer.prompt([
        {
            type: 'input',
            name: 'name',
            message: "Enter the department's name:",
            validate: nameInput_1 => {
                if (nameInput_1) {
                    return true;
                } else {
                    return "Please enter the department's name";
                }
            }
        }
    ]);
    connection.query('INSERT INTO department (name) VALUES (?)', [response.name],
        function (err, res) {
            if (err)
                throw err;
            console.log('Added department to ID: ' + res.insertId);

            startApp();
        }
    );
};


async function addRole() {
    let departmentList = [];
    connection.query('SELECT * FROM department',
        function(err, res) {
            if (err) throw err;

            for (var i = 0; i < res.length; i++) {
                departmentList.push({
                    name: res[i].name,
                    value: res[i].id
                });
            };
        }
    );
    const response = await inquirer.prompt([
        {
            type: 'input',
            name: 'title',
            message: "Enter the role title: ",
            validate: titleInput_1 => {
                if (titleInput_1) {
                    return true;
                } else {
                    return "Please enter the role title";
                }
            }
        },
        {
            type: 'input',
            name: 'salary',
            message: "Enter the role's salary: ",
            validate: salaryInput_1 => {
                if (salaryInput_1) {
                    return true;
                } else {
                    return "Please enter role's salary";
                }
            }
        },
        {
            type: 'list',
            name: 'department',
            message: "Select which department the role belong to: ",
            choices: departmentList
        }
    ]);
    connection.query(`INSERT INTO role (title, salary, department_id ) VALUES (?, ?, ?)`, [response.title, response.salary, response.department],
        function (err_1, res_1) {
            if (err_1)
                throw err_1;
            console.log('Successfully added ' + response.title + ' to department ' + response.department);

            startApp();
        }
    );
};

async function addEmployee() {
    let roleList = [];
    let managerList = [{name: "None", value: null}];

    connection.query('SELECT * FROM role',
        function(err, res) {
            if (err) throw err;

            for (var i = 0; i < res.length; i++) {
                roleList.push({
                    name: res[i].title,
                    value: res[i].id
                });
            };
        }
    );
    connection.query('SELECT * FROM employee WHERE employee.manager_id IS NULL',
        function(err, res) {
            if (err) throw err;
            for (var i = 0; i < res.length; i++) {
                managerList.push({
                    name: (res[i].first_name + " " + res[i].last_name),
                    value: res[i].id
                });
            };
        }
    );
    const response = await inquirer.prompt([
        {
            type: 'input',
            name: 'first_name',
            message: "What is the employee's first name?",
            validate: firstInput_1 => {
                if (firstInput_1) {
                    return true;
                } else {
                    return "Please enter the first name!";
                }
            }
        },
        {
            type: 'input',
            name: 'last_name',
            message: "What is the employee's last name?",
            validate: lastInput_1 => {
                if (lastInput_1) {
                    return true;
                } else {
                    return "Please employee's last name!";
                }
            }
        },
        {
            type: 'list',
            name: 'role',
            message: "What is the employee's role?",
            choices: roleList
        },
        {
            type: 'list',
            name: 'manager',
            message: "If available, provide the employee's manager.",
            choices: managerList
        }
    ]);
    connection.query(`INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)`, [response.first_name, response.last_name, response.role, response.manager],
        function (err_2, res_2) {
            if (err_2)
                throw err_2;
            console.log('Employee ' + response.first_name + ' ' + response.last_name + ' added');
            startApp();
        }
    );
}

async function updateRole(empList) {
    let roleList = [];
    connection.query('SELECT * FROM role',
        function (err, res) {
            if (err) throw err;

            for (var i = 0; i < res.length; i++) {
                roleList.push({
                    name: res[i].title,
                    value: res[i].id
                });
            };
        }
    );

    const response = await inquirer.prompt([
        {
            type: 'list',
            name: 'employee',
            message: "Which employee would you like to edit? ",
            choices: empList
        },
        {
            type: 'list',
            name: 'role',
            message: "Select a new role for the employee.",
            choices: roleList
        }
    ]);
    connection.query(`UPDATE employee SET role_id = ? WHERE employee.id = ?`, [response.role, response.employee],
        function (err_2, res_2) {
            if (err_2) throw err_2;
            console.log("The employee's role has been updated");
            startApp();
        }
    );
}

const startApp = async () => {
    await showMenu()
        .then(response => {
            if (response.mainMenu === "getDepartments") {
                return getDepartments();
            }
            if (response.mainMenu === "getRoles") {
                return getRoles();
            }
            if (response.mainMenu === "getEmployees") {
                return getEmployees();
            }
            if (response.mainMenu === "addDepartment") {
                return addDepartment();
            }
            if (response.mainMenu === "addRole") {
                return addRole();
            }
            if (response.mainMenu === "addEmployee") {
                return addEmployee();
            }
            if (response.mainMenu === "updateRole") {
                connection.promise().query('SELECT * FROM employee')
                .then((rows,field) => {
                    let empList = [];

                    for (var i = 0; i < rows[0].length; i++) {
                        empList.push({
                            name: (rows[0][i].first_name + ' ' + rows[0][i].last_name),
                            value: rows[0][i].id
                        });
                    };
                    console.log(empList);
                    return updateRole(empList);
                })
            }
            if (response.mainMenu === "exit") {
                console.log("Bye!");
                return process.exit();
            }
        })
        .catch(err => {
            console.log(err);
        });
}
