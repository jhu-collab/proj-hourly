const path = require('path');
const express = require('express');
const cors = require('cors');
const { StatusCodes } = require('http-status-codes');
const ApiError = require('./utils/ApiError');

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// routes
app.use('/api/course', require('./routes/api/courses'));
app.use('/api/account', require('./routes/api/accounts'));
app.use('/api/officeHour', require('./routes/api/officeHours'));

app.all('/api/*', (req, res, next) => {
  next(
    new ApiError(
      StatusCodes.NOT_FOUND,
      `Can't find ${req.originalUrl} on this server!`,
    ),
  );
});
// serve React app
app.use(express.static(path.join(__dirname, '../frontend/build')));
app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});

module.exports = app;
