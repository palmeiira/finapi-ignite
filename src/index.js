const { response, request } = require("express");
const express = require("express");
const { v4: uuidv4 } = require("uuid");


const customers = []

const app = express();

app.use(express.json());

app.post("/account", (request, response) => {

    const { cpf, name } = request.body;

    const alreadyExists = customers.some((customer) =>
        customer.cpf === cpf
    );

    if (alreadyExists) {
        return response.status(400).json({ error: "Customer already exists." });
    }

    customers.push({
        cpf,
        name,
        id: uuidv4(),
        statement: [],
    });

    response.status(201).send();

});

app.use(verifyIfAccountExists);

app.get("/statement", (request, response) => {
    const customer = request.customer;

    return response.status(200).json(customer.statement);


});

app.post("/deposit", (request, response) => {
    const customer = request.customer;

    const statementOperation = {
        description: "deposit",
        amount: amount,
        created_at: new Date(),
        type: 'C'
    }

    customer.statement.push(statementOperation);

    return response.status(201).json();
});

app.post("/withdraw", (request, response) => {
    const { amount } = request.body;
    const customer = request.customer;

    const currentBalance = getBalance(customer.statement);
    if (currentBalance >= amount) {
        const statementOperation = {
            description: "withdraw",
            amount: amount,
            created_at: new Date(),
            type: 'D'
        }

        customer.statement.push(statementOperation);

        return response.status(201).json();
    } else {
        return response.status(400).json({ error: "Insufficient funds." })
    }
});

app.delete("/account", (request, response) => {
    const customer = request.customer;

    customers.splice(customer, 1);

    return response.status(204).json();

});

app.get("/account", (request, response) => {
    const customer = request.customer;

    return response.status(200).json(customer);

})

app.put("/account", (request, response) => {
    const { name } = request.body;

    const customer = request.customer;

    customer.name = name;

    return response.status(201).json();
})

function verifyIfAccountExists(request, response, next) {
    const { cpf } = request.body;

    const customer = customers.find((customer => customer.cpf === cpf));

    if (!customer) {
        return response.status(400).json({ error: "Customer not found." })
    }

    request.customer = customer;

    next();
}

function getBalance(statement) {
    const balance = statement.reduce((acc, current) => {
        if (current.type === 'C') {
            return acc + current.amount;
        } else {
            return acc - current.amount;
        }
    }, 0);

    return balance;
}

app.listen(3333);

