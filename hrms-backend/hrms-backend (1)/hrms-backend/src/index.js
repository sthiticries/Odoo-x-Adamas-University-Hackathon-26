require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Auto-wrap every route handler so a thrown/rejected error goes to
// Express's error handler instead of crashing the whole process.
const wrapAsync = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
// Patch Router prototype so every mounted router auto-catches async errors
const routerProto = express.Router().constructor.prototype;
['get', 'post', 'put', 'delete', 'patch'].forEach((method) => {
  const orig = routerProto[method];
  routerProto[method] = function (path, ...handlers) {
    const wrapped = handlers.map((h) => (typeof h === 'function' ? wrapAsync(h) : h));
    return orig.call(this, path, ...wrapped);
  };
});

app.use('/auth', require('./routes/auth'));
app.use('/profile', require('./routes/profile'));
app.use('/attendance', require('./routes/attendance'));
app.use('/leave', require('./routes/leave'));
app.use('/payroll', require('./routes/payroll'));

app.get('/', (req, res) => res.send('HRMS API running'));

// Catch errors thrown inside routes instead of crashing the process
app.use((err, req, res, next) => {
  console.error('Request error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

// Catch anything unexpected so the server stays alive
process.on('unhandledRejection', (err) => console.error('Unhandled rejection:', err));
process.on('uncaughtException', (err) => console.error('Uncaught exception:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server on port ${PORT}`));
