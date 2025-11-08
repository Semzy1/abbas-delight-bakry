const express = require('express');
const morgan = require('morgan');
const app = express();

app.use(morgan('dev'));

// Your existing middlewares and routes here

module.exports = app;