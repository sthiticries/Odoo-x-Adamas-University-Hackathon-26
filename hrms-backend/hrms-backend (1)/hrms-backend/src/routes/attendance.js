const router = require('express').Router();
const prisma = require('../prisma');
const { auth, requireRole } = require('../middleware/auth');

// Admin only: Mark attendance for an employee
router.post('/mark-employee', auth, requireRole('ADMIN'), async (req, res) => {
  const { userId, status, date } = req.body;
  if (!userId || !status) throw new Error('userId and status required');
  
  const recordDate = date ? new Date(date) : new Date();
  const record = await prisma.attendance.create({
    data: { 
      userId: Number(userId), 
      status: status,
      date: recordDate,
      checkIn: new Date()
    }
  });
  res.json(record);
});

router.post('/checkin', auth, async (req, res) => {
  throw new Error('Employees cannot mark their own attendance. Contact admin.');
});

router.post('/checkout/:id', auth, async (req, res) => {
  throw new Error('Employees cannot mark their own attendance. Contact admin.');
});

router.get('/me', auth, async (req, res) => {
  const records = await prisma.attendance.findMany({ where: { userId: req.user.id } });
  res.json(records);
});

// Weekly view for employee
router.get('/me/week', auth, async (req, res) => {
  const today = new Date();
  const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(endOfWeek.getDate() + 6);
  
  const records = await prisma.attendance.findMany({
    where: { 
      userId: req.user.id,
      date: { gte: startOfWeek, lte: endOfWeek }
    }
  });
  res.json(records);
});

// Admin: view all
router.get('/all', auth, requireRole('ADMIN'), async (req, res) => {
  const records = await prisma.attendance.findMany({ include: { user: true } });
  res.json(records);
});

// Admin: view specific employee's attendance
router.get('/employee/:userId', auth, requireRole('ADMIN'), async (req, res) => {
  const records = await prisma.attendance.findMany({ where: { userId: Number(req.params.userId) } });
  res.json(records);
});

module.exports = router;
