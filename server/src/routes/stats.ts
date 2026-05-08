import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

const MUSCLE_MAP: Record<string, string[]> = {
  quads: ['barbell squat', 'leg press', 'walking lunges', 'hack squat', 'leg extension'],
  hamstrings: ['romanian deadlift', 'leg curl', 'walking lunges', 'stiff leg deadlift'],
  chest: ['bench press', 'incline db', 'cable fly', 'dip', 'chest fly'],
  back: ['barbell row', 'lat pulldown', 'face pull', 'pull up', 'seated row', 'deadlift'],
  shoulders: ['ohp', 'lateral raise', 'face pull', 'overhead press', 'front raise'],
  biceps: ['bicep curl', 'hammer curl', 'chin up', 'ez bar curl', 'cable curl'],
  triceps: ['tricep', 'dip', 'skull crusher', 'close grip bench', 'pushdown'],
  glutes: ['hip thrust', 'glute bridge', 'walking lunges', 'barbell squat'],
  calves: ['calf raise', 'seated calf'],
};

router.get('/volume', requireAuth, async (req: AuthRequest, res: Response) => {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const sets = await prisma.set.findMany({
    where: {
      session: { userId: req.userId!, status: 'logged', loggedAt: { gte: oneWeekAgo } },
      completed: true,
    },
    select: { exerciseName: true },
  });

  const muscleSets: Record<string, number> = {};

  for (const set of sets) {
    const name = set.exerciseName.toLowerCase();
    for (const [muscle, exercises] of Object.entries(MUSCLE_MAP)) {
      if (exercises.some((e) => name.includes(e))) {
        muscleSets[muscle] = (muscleSets[muscle] ?? 0) + 1;
      }
    }
  }

  const muscles = Object.entries(muscleSets)
    .map(([name, sets]) => ({ name, sets }))
    .sort((a, b) => b.sets - a.sets);

  res.json({ muscles, weekStart: oneWeekAgo.toISOString() });
});

router.get('/prs', requireAuth, async (req: AuthRequest, res: Response) => {
  const sets = await prisma.set.findMany({
    where: {
      session: { userId: req.userId!, status: 'logged' },
      weightValue: { not: null },
      reps: { not: null },
    },
    orderBy: { weightValue: 'desc' },
    select: { exerciseName: true, weightValue: true, weightUnit: true, reps: true },
  });

  const prs: Record<
    string,
    { weight: number; unit: string; reps: number }
  > = {};

  for (const s of sets) {
    const name = s.exerciseName;
    const weight = parseFloat(s.weightValue!.toString());
    if (!prs[name] || weight > prs[name].weight) {
      prs[name] = { weight, unit: s.weightUnit, reps: s.reps! };
    }
  }

  res.json({
    prs: Object.entries(prs).map(([exercise, data]) => ({ exercise, ...data })),
  });
});

export default router;
