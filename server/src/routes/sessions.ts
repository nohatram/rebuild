import { Router, Response } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

const CreateSessionSchema = z.object({
  workoutText: z.string().optional(),
  sessionType: z.string().optional(),
  status: z.enum(['draft', 'logged']).default('logged'),
});

const UpdateSessionSchema = z.object({
  workoutText: z.string().optional(),
  sessionType: z.string().optional(),
  status: z.enum(['draft', 'logged']).optional(),
});

function parseWorkoutText(text: string): Array<{
  exerciseName: string;
  setNumber: number;
  weightValue: number | null;
  weightUnit: string;
  reps: number | null;
}> {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  const sets: ReturnType<typeof parseWorkoutText> = [];

  for (const line of lines) {
    // format: "exercise name  weight  sets×reps"
    const match = line.match(/^(.+?)\s{2,}(\d+(?:\.\d+)?)(lb|kg)?\s+(\d+)[×x](\d+)\s*$/);
    if (!match) continue;

    const [, name, weight, unit, setsCount, reps] = match;
    const numSets = parseInt(setsCount);
    for (let i = 1; i <= numSets; i++) {
      sets.push({
        exerciseName: name.trim(),
        setNumber: i,
        weightValue: weight ? parseFloat(weight) : null,
        weightUnit: unit ?? 'lbs',
        reps: reps ? parseInt(reps) : null,
      });
    }
  }

  return sets;
}

router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = 20;

  const [sessions, total] = await Promise.all([
    prisma.session.findMany({
      where: { userId: req.userId! },
      include: { sets: { orderBy: [{ exerciseName: 'asc' }, { setNumber: 'asc' }] } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.session.count({ where: { userId: req.userId! } }),
  ]);

  res.json({ sessions, total, page });
});

router.get('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  const session = await prisma.session.findFirst({
    where: { id: req.params.id, userId: req.userId! },
    include: { sets: { orderBy: [{ exerciseName: 'asc' }, { setNumber: 'asc' }] } },
  });

  if (!session) return res.status(404).json({ error: 'session not found' });
  res.json({ session });
});

router.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
  const parsed = CreateSessionSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'invalid request' });
  }

  const { workoutText, sessionType, status } = parsed.data;
  const userId = req.userId!;

  const sessionCount = await prisma.session.count({ where: { userId } });

  const session = await prisma.session.create({
    data: {
      userId,
      sessionNumber: sessionCount + 1,
      sessionType,
      status,
      loggedAt: status === 'logged' ? new Date() : null,
    },
  });

  if (workoutText) {
    const setData = parseWorkoutText(workoutText);
    if (setData.length > 0) {
      await prisma.set.createMany({
        data: setData.map((s) => ({ ...s, sessionId: session.id })),
      });
    }
  }

  const full = await prisma.session.findUnique({
    where: { id: session.id },
    include: { sets: true },
  });

  res.status(201).json({ session: full });
});

router.put('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  const existing = await prisma.session.findFirst({
    where: { id: req.params.id, userId: req.userId! },
  });
  if (!existing) return res.status(404).json({ error: 'session not found' });

  const parsed = UpdateSessionSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'invalid request' });

  const { workoutText, sessionType, status } = parsed.data;

  const session = await prisma.session.update({
    where: { id: req.params.id },
    data: {
      sessionType: sessionType ?? existing.sessionType ?? undefined,
      status: status ?? existing.status,
      loggedAt:
        status === 'logged' && !existing.loggedAt ? new Date() : existing.loggedAt,
    },
  });

  if (workoutText !== undefined) {
    await prisma.set.deleteMany({ where: { sessionId: session.id } });
    const setData = parseWorkoutText(workoutText);
    if (setData.length > 0) {
      await prisma.set.createMany({
        data: setData.map((s) => ({ ...s, sessionId: session.id })),
      });
    }
  }

  res.json({ session });
});

router.delete('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  const existing = await prisma.session.findFirst({
    where: { id: req.params.id, userId: req.userId! },
  });
  if (!existing) return res.status(404).json({ error: 'session not found' });

  await prisma.set.deleteMany({ where: { sessionId: req.params.id } });
  await prisma.session.delete({ where: { id: req.params.id } });

  res.json({ message: 'deleted' });
});

export default router;
