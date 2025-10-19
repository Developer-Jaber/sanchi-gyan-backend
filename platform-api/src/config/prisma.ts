import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
  log: [{ emit: 'event', level: 'query' }, 'error', 'warn'],
});

prisma.$on('query', (e) => {
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.log(`Query: ${e.query}`);
  }
});
