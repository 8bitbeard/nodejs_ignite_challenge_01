const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  if(!user) {
    return response.status(404).json({
      error: "User not found!"
    })
  }

  request.username = username;

  next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const user = users.find((user) => user.username === username);

  if(user) {
    return response.status(400).json({
      error: "Users already exists!"
    })
  }

  const userData = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(userData);

  return response.status(201).json(userData)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { username } = request;
  const user = users.find((user) => user.username === username);

  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { username } = request;

  const todoData = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  };

  const user = users.find((user) => user.username === username);

  user.todos.push(todoData);

  return response.status(201).json(todoData);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { id } = request.params;
  const { username } = request;

  const user = users.find((user) => user.username === username);

  const todoIndex = user.todos.findIndex((todo) => todo.id === id);

  if(todoIndex < 0) {
    return response.status(404).json({
      error: "Todo not found!"
    })
  }

  user.todos[todoIndex] = Object.assign(user.todos[todoIndex], {
    title: title,
    deadline: new Date(deadline),
  })

  return response.status(201).json({
    "deadline": user.todos[todoIndex].deadline,
    "done": user.todos[todoIndex].done,
    "title": user.todos[todoIndex].title
  });
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { username } = request;

  const user = users.find((user) => user.username === username);

  const todoIndex = user.todos.findIndex((todo) => todo.id === id);

  if(todoIndex < 0) {
    return response.status(404).json({
      error: "Todo not found!"
    })
  }

  user.todos[todoIndex].done = true;

  return response.status(201).json(user.todos[todoIndex]);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { username } = request;

  const user = users.find((user) => user.username === username);

  const todoIndex = user.todos.findIndex((todo) => todo.id === id);

  if(todoIndex < 0) {
    return response.status(404).json({
      error: "Todo not found!"
    })
  }

  user.todos.splice(todoIndex, 1);

  return response.status(204).send()
});

module.exports = app;