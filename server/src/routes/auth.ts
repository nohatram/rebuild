import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { sendVerificationCode, checkVerificationCode } from '../services/twilio';

const router = Router();
const prisma = new PrismaClient();

const SendCodeSchema = z.object({
  phone: z.string().regex(/^\+1\d{10}$/, 'use format +1XXXXXXXXXX'),
});

const VerifySchema = z.object({
  phone: z.string(),
  code: z.string().length(6),
});

router.post('/send-code', async (req: Request, res: Response) => {
  const parsed = SendCodeSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }
  const { phone } = parsed.data;
  try {
    await sendVerificationCode(phone);
    res.json({ message: 'code sent' });
  } catch (e) {
    console.error('twilio error:', e);
    res.status(500).json({ error: 'failed to send code' });
  }
});

router.post('/verify', async (req: Request, res: Response) => {
  const parsed = VerifySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'invalid request' });
  }
  const { phone, code } = parsed.data;
  try {
    const approved = await checkVerificationCode(phone, code);
    if (!approved) {
      return res.status(401).json({ error: 'incorrect code' });
    }

    const user = await prisma.user.upsert({
      where: { phone },
      update: {},
      create: { phone },
    });

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET!,
      { expiresIn: '90d' }
    );

    res.json({ token, user: { id: user.id, phone: user.phone } });
  } catch (e) {
    console.error('verify error:', e);
    res.status(500).json({ error: 'verification failed' });
  }
});

router.get('/refresh', async (req: Request, res: Response) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'missing token' });
  }
  try {
    const payload = jwt.verify(
      header.slice(7),
      process.env.JWT_SECRET!
    ) as { userId: string };
    const token = jwt.sign(
      { userId: payload.userId },
      process.env.JWT_SECRET!,
      { expiresIn: '90d' }
    );
    res.json({ token });
  } catch {
    res.status(401).json({ error: 'invalid token' });
  }
});

export default router;
