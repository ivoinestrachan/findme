import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

type Data = {
  id?: number;
  latitude?: number;
  longitude?: number;
  createdAt?: Date;
  updatedAt?: Date;
  message?: string;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method === 'POST') {
    const { latitude, longitude } = req.body;
    try {
      const location = await prisma.location.create({
        data: {
          latitude: new Prisma.Decimal(latitude),
          longitude: new Prisma.Decimal(longitude),
        },
      });
      res.status(201).json({
        id: location.id,
        latitude: Number(location.latitude),
        longitude: Number(location.longitude),
        createdAt: location.createdAt,
        updatedAt: location.updatedAt,
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update location', message: (error instanceof Error) ? error.message : 'Unknown error' });
    }
  } else if (req.method === 'GET') {
    try {
      const location = await prisma.location.findFirst({
        orderBy: {
          createdAt: 'desc',
        },
      });
      if (location) {
        res.status(200).json({
          id: location.id,
          latitude: Number(location.latitude),
          longitude: Number(location.longitude),
          createdAt: location.createdAt,
          updatedAt: location.updatedAt,
        });
      } else {
        res.status(404).json({ message: 'No location found' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch location', message: (error instanceof Error) ? error.message : 'Unknown error' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
