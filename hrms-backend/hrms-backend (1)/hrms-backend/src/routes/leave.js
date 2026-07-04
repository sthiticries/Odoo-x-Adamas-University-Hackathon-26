const router = require('express').Router();
const prisma = require('../prisma');
const { auth, requireRole } = require('../middleware/auth');

router.post('/apply', auth, async (req, res) => {
  const { type, startDate, endDate, remarks } = req.body;
  const leave = await prisma.leaveRequest.create({
    data: { userId: req.user.id, type, startDate: new Date(startDate), endDate: new Date(endDate), remarks }
  });
  res.json(leave);
});

router.get('/me', auth, async (req, res) => {
  const leaves = await prisma.leaveRequest.findMany({ where: { userId: req.user.id } });
  res.json(leaves);
});

router.get('/all', auth, requireRole('ADMIN'), async (req, res) => {
  const leaves = await prisma.leaveRequest.findMany({ include: { user: true } });
  res.json(leaves);
});

router.put('/:id/review', auth, requireRole('ADMIN'), async (req, res) => {
  const { status, comment } = req.body; // status: APPROVED | REJECTED
  const leave = await prisma.leaveRequest.update({
    where: { id: Number(req.params.id) },
    data: { status, comment, reviewedBy: req.user.id }
  });
  res.json(leave);
});

module.exports = router;
