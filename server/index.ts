import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
  };
}

const authenticate = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const token = authHeader.replace('Bearer ', '');
  // TODO: validar JWT de fato (usar Firebase Admin, Auth0 etc.).
  req.user = { id: 'stub-user', token } as any;
  return next();
};

app.post('/progress/complete', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  const { user_id, content_type, content_id } = req.body ?? {};

  if (!user_id || !content_type || !content_id) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  // Exemplo de persistência (SQL fictício):
  // INSERT INTO user_progress (user_id, content_type, content_id) VALUES ($1, $2, $3);
  console.log('Progress received', { user_id, content_type, content_id });

  return res.status(201).json({ status: 'ok' });
});

const port = process.env.PORT ?? 3333;
app.listen(port, () => {
  console.log(`Progress API running on http://localhost:${port}`);
});
