
INSERT INTO department (name)
VALUES ("Engineering"), ("Sales"), ("Legal"), ("Finance");

INSERT INTO role (title, salary, department_id)
VALUES ("Lead Engineer", "150000", 1 ), ("Legal Team Lead", "200000", 3), ("Back-End Developer", "90000", 1), ("Accountant", "95000", 4), ("Software Engineer", "100000", 1), ("Sales Person", "80000", 2);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("Ronan", "Galvez", 1, null), ("John", "Doe", 3, 1);
