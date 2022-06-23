const path = require('path');
const express = require('express');

const app = express();

// middleware
app.use(express.json());

// routes
app.use('/api/course', require('./routes/api/courses'));
app.use('/api/account', require('./routes/api/accounts'));
// serve React app
app.use(express.static(path.join(__dirname, '../frontend/build')));
app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});

module.exports = app;
