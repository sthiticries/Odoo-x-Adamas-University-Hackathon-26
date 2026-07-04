const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../prisma');

router.post('/signup', async (req, res) => {
  const { email, password, role } = req.body;
  
  // Password validation: min 8 chars, uppercase, lowercase, number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  if (!passwordRegex.test(password)) {
    return res.status(400).json({ error: 'Password must be 8+ chars with uppercase, lowercase, and number' });
  }
  
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Invalid email format' });
  }
  
  const hash = await bcrypt.hash(password, 10);
  try {
    // Generate employee ID: EMP + timestamp + random
    const employeeId = `EMP${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const user = await prisma.user.create({
      data: { employeeId, email, password: hash, role: role?.toUpperCase() || 'EMPLOYEE', verified: true }
    });
    res.json({ id: user.id, email: user.email, employeeId: user.employeeId });
  } catch (e) {
    res.status(400).json({ error: 'Signup failed (duplicate email?)' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: user.id, role: user.role, email: user.email, employeeId: user.employeeId } });
});

// Admin: Get all employees with their attendance, leaves, payroll
router.get('/admin/employees', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });

    const employees = await prisma.user.findMany({
      select: {
        id: true,
        employeeId: true,
        email: true,
        role: true,
        profile: true,
        attendance: { select: { date: true, status: true, checkIn: true, checkOut: true } },
        leaves: { select: { startDate: true, endDate: true, status: true } },
        payroll: true
      }
    });
    res.json(employees);
  } catch (e) {
    res.status(401).json({ error: 'Unauthorized' });
  }
});

module.exports = router;
