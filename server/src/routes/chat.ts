import { Router, Response } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { chatWithClaude, generateWorkout } from '../services/claude';

const router = Router();
const prisma = new PrismaClient();

const ChatSchema = z.object({
  message: z.string().min(1).max(2000),
  currentWorkout: z.string().optional(),
});

router.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
  const parsed = ChatSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'invalid request' });
  }

  const { message, currentWorkout } = parsed.data;
  const userId = req.userId!;

  try {
    // fetch user profile and recent context
    const [user, recentMessages, recentSessions] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.message.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      prisma.session.findMany({
        where: { userId, status: 'logged' },
        include: { sets: true },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

    const userContext = [
      user?.currentWeightLbs ? `weight: ${user.currentWeightLbs}lb` : '',
      user?.goalWeightLbs ? `goal: ${user.goalWeightLbs}lb` : '',
      user?.experienceLevel ? `level: ${user.experienceLevel}` : '',
    ]
      .filter(Boolean)
      .join(' · ');

    const sessionSummaries = recentSessions.map((s) => {
      const exercises = [...new Set(s.sets.map((set) => set.exerciseName))].join(', ');
      return `${s.createdAt.toLocaleDateString()} ${s.sessionType ?? ''}: ${exercises}`;
    });

    const history = recentMessages
      .reverse()
      .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }));

    const { reply, workoutUpdate } = await chatWithClaude(
      message,
      currentWorkout ?? null,
      history,
      [userContext, ...sessionSummaries].join('\n')
    );

    // persist messages
    await prisma.message.createMany({
      data: [
        { userId, role: 'user', content: message },
        { userId, role: 'assistant', content: reply },
      ],
    });

    res.json({ reply, workoutUpdate: workoutUpdate ?? undefined });
  } catch (e) {
    console.error('chat error:', e);
    res.status(500).json({ error: 'ai unavailable — try again' });
  }
});

router.get('/history', requireAuth, async (req: AuthRequest, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = 20;

  const [messages, total] = await Promise.all([
    prisma.message.findMany({
      where: { userId: req.userId! },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.message.count({ where: { userId: req.userId! } }),
  ]);

  res.json({ messages: messages.reverse(), total, page });
});

export default router;
