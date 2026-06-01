import { Router, Request, Response } from 'express';
import { success } from '../utils/response';
import { authenticate, requireRole } from '../middlewares/auth.middleware';

const router = Router();
router.use(authenticate);

router.get('/', (req: Request, res: Response) => {
  res.json(success([]));
});

router.get('/:id', (req: Request, res: Response) => {
  res.json(success({}, '获取成功'));
});

router.post('/', requireRole('admin', 'teacher'), (req: Request, res: Response) => {
  res.json(success({ id: 1 }, '发布成功'));
});

router.put('/:id', requireRole('admin', 'teacher'), (req: Request, res: Response) => {
  res.json(success(null, '更新成功'));
});

router.post('/:id/read', (req: Request, res: Response) => {
  res.json(success(null, '已读标记成功'));
});

export default router;
