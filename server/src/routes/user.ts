import { Router, Response } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

const ProfileSchema = z.object({
  displayName: z.string().max(50).optional(),
  currentWeightLbs: z.number().positive().optional(),
  goalWeightLbs: z.number().positive().optional(),
  experienceLevel: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
});

const WeightSchema = z.object({
  weightLbs: z.number().positive(),
});

router.get('/profile', requireAuth, async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.findUnique({ where: { id: req.userId! } });
  if (!user) return res.status(404).json({ error: 'user not found' });
  res.json({ user });
});

router.put('/profile', requireAuth, async (req: AuthRequest, res: Response) => {
  const parsed = ProfileSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'invalid data' });

  const user = await prisma.user.update({
    where: { id: req.userId! },
    data: parsed.data,
  });
  res.json({ user });
});

router.post('/weight', requireAuth, async (req: AuthRequest, res: Response) => {
  const parsed = WeightSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'invalid weight' });

  const entry = await prisma.weightEntry.create({
    data: { userId: req.userId!, weightLbs: parsed.data.weightLbs },
  });

  await prisma.user.update({
    where: { id: req.userId! },
    data: { currentWeightLbs: parsed.data.weightLbs },
  });

  res.status(201).json({ entry });
});

router.get('/weight', requireAuth, async (req: AuthRequest, res: Response) => {
  const entries = await prisma.weightEntry.findMany({
    where: { userId: req.userId! },
    orderBy: { recordedAt: 'asc' },
    take: 90,
  });

  const formatted = entries.map((e) => ({
    date: e.recordedAt.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' }),
    weight: parseFloat(e.weightLbs.toString()),
  }));

  res.json({ entries: formatted });
});

export default router;
