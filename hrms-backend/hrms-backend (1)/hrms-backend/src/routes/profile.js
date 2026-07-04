const router = require('express').Router();
const prisma = require('../prisma');
const { auth, requireRole } = require('../middleware/auth');

router.get('/me', auth, async (req, res) => {
  const profile = await prisma.profile.findUnique({ where: { userId: req.user.id } });
  res.json(profile);
});

router.put('/me', auth, async (req, res) => {
  const { phone, address, photoUrl } = req.body;
  const profile = await prisma.profile.upsert({
    where: { userId: req.user.id },
    update: { phone, address, photoUrl },
    create: { userId: req.user.id, phone, address, photoUrl }
  });
  res.json(profile);
});

// Admin: edit any employee's full profile
router.put('/:userId', auth, requireRole('ADMIN'), async (req, res) => {
  const userId = Number(req.params.userId);
  const profile = await prisma.profile.upsert({
    where: { userId },
    update: req.body,
    create: { userId, ...req.body }
  });
  res.json(profile);
});

module.exports = router;
