import { Router, Request, Response } from 'express';
import { success, pageSuccess, getPagination } from '../utils/response';
import { authenticate, requireRole } from '../middlewares/auth.middleware';

const router = Router();
router.use(authenticate);

// Class routes
router.get('/', async (req: Request, res: Response) => {
  const { offset, limit } = getPagination(
    parseInt(req.query.page as string),
    parseInt(req.query.pageSize as string)
  );
  res.json(pageSuccess([], 0, 1, limit));
});

router.get('/:id', (req: Request, res: Response) => {
  res.json(success({}, '获取成功'));
});

router.post('/', requireRole('admin'), (req: Request, res: Response) => {
  res.json(success({ id: 1 }, '创建成功'));
});

router.put('/:id', requireRole('admin'), (req: Request, res: Response) => {
  res.json(success(null, '更新成功'));
});

router.delete('/:id', requireRole('admin'), (req: Request, res: Response) => {
  res.json(success(null, '删除成功'));
});

export default router;
