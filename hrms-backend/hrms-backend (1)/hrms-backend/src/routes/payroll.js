const router = require('express').Router();
const prisma = require('../prisma');
const { auth, requireRole } = require('../middleware/auth');

router.get('/me', auth, async (req, res) => {
  const payroll = await prisma.payroll.findUnique({ where: { userId: req.user.id } });
  res.json(payroll);
});

router.get('/all', auth, requireRole('ADMIN'), async (req, res) => {
  const all = await prisma.payroll.findMany({ include: { user: true } });
  res.json(all);
});

router.put('/:userId', auth, requireRole('ADMIN'), async (req, res) => {
  const userId = Number(req.params.userId);
  const { baseSalary, structure } = req.body;
  const structureStr = structure ? JSON.stringify(structure) : undefined;
  const payroll = await prisma.payroll.upsert({
    where: { userId },
    update: { baseSalary, structure: structureStr, updatedBy: req.user.id },
    create: { userId, baseSalary, structure: structureStr, updatedBy: req.user.id }
  });
  res.json(payroll);
});

module.exports = router;
