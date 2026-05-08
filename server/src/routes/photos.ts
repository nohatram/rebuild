import { Router, Response } from 'express';
import multer from 'multer';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { PrismaClient } from '@prisma/client';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

const s3 = new S3Client({
  region: process.env.AWS_REGION ?? 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET = process.env.AWS_S3_BUCKET!;

router.post(
  '/',
  requireAuth,
  upload.single('photo'),
  async (req: AuthRequest, res: Response) => {
    if (!req.file) return res.status(400).json({ error: 'no file' });

    const key = `photos/${req.userId}/${Date.now()}.jpg`;

    await s3.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: req.file.buffer,
        ContentType: 'image/jpeg',
      })
    );

    const photoUrl = `https://${BUCKET}.s3.amazonaws.com/${key}`;
    const photoDate = req.body.date ? new Date(req.body.date) : new Date();

    const photo = await prisma.progressPhoto.create({
      data: {
        userId: req.userId!,
        photoUrl,
        photoDate,
      },
    });

    res.status(201).json({ photo });
  }
);

router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  const photos = await prisma.progressPhoto.findMany({
    where: { userId: req.userId! },
    orderBy: { photoDate: 'desc' },
  });

  const withUrls = await Promise.all(
    photos.map(async (p) => {
      const key = p.photoUrl.split('.amazonaws.com/')[1];
      const url = await getSignedUrl(
        s3,
        new GetObjectCommand({ Bucket: BUCKET, Key: key }),
        { expiresIn: 3600 }
      );
      return { ...p, signedUrl: url };
    })
  );

  res.json({ photos: withUrls });
});

export default router;
