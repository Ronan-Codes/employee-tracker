const inquirer = require('inquirer');
const cTable = require('console.table');
const mysql = require('mysql2');

// Connect to Database
const connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'password',
    database: 'employeesDB'
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
                { name: "View all of the departments", value: "viewDepartments" },
                { name: "View all of the roles", value: "viewRoles" },
                { name: "View all of the employees", value: "viewEmployees" },
                { name: "Add a department", value: "addDepartment" },
                { name: "Add a role", value: "addRole" },
                { name: "Add an employee", value: "addEmployee" },
                { name: "Update an employee's role", value: "updateRole" },
                { name: "Exit Application", value: "exit" }
            ]
        }
    ]);
};
