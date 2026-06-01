import { Router, Request, Response } from 'express';
import { success, pageSuccess, getPagination } from '../utils/response';
import { authenticate, requireRole } from '../middlewares/auth.middleware';

const router = Router();
router.use(authenticate);
router.use(requireRole('admin'));

// Admin routes
router.get('/students/import-logs', (req: Request, res: Response) => {
  const { offset, limit } = getPagination(
    parseInt(req.query.page as string),
    parseInt(req.query.pageSize as string)
  );
  res.json(pageSuccess([], 0, 1, limit));
});

router.post('/students/import', (req: Request, res: Response) => {
  res.json(success({ successCount: 0, failCount: 0 }, '导入成功'));
});

router.get('/roles', (req: Request, res: Response) => {
  res.json(success([]));
});

router.post('/roles', (req: Request, res: Response) => {
  res.json(success({ id: 1 }, '创建成功'));
});

router.put('/roles/:id', (req: Request, res: Response) => {
  res.json(success(null, '更新成功'));
});

router.get('/menus', (req: Request, res: Response) => {
  res.json(success([]));
});

router.get('/operation-logs', (req: Request, res: Response) => {
  const { offset, limit } = getPagination(
    parseInt(req.query.page as string),
    parseInt(req.query.pageSize as string)
  );
  res.json(pageSuccess([], 0, 1, limit));
});

export default router;
