// Placeholder routes - to be implemented
import { Router, Request, Response, NextFunction } from 'express';
import { success } from '../utils/response';

const router = Router();

// Topic routes
router.get('/topics', (req: Request, res: Response) => {
  res.json(success([], '获取成功'));
});

router.get('/topics/:id', (req: Request, res: Response) => {
  res.json(success({}, '获取成功'));
});

router.post('/topics', (req: Request, res: Response) => {
  res.json(success({ id: 1 }, '创建成功'));
});

router.put('/topics/:id', (req: Request, res: Response) => {
  res.json(success(null, '更新成功'));
});

router.delete('/topics/:id', (req: Request, res: Response) => {
  res.json(success(null, '删除成功'));
});

export default router;
