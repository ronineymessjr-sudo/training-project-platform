import { Router, Request, Response } from 'express';
import { success } from '../utils/response';
import { authenticate, requireRole } from '../middlewares/auth.middleware';

const router = Router();
router.use(authenticate);

// Score dimensions
router.get('/dimensions', (req: Request, res: Response) => {
  res.json(success([
    { id: 1, name: '需求分析', defaultWeight: 15, isDefault: true },
    { id: 2, name: '系统设计', defaultWeight: 20, isDefault: true },
    { id: 3, name: '编码实现', defaultWeight: 30, isDefault: true },
    { id: 4, name: '测试验证', defaultWeight: 10, isDefault: true },
    { id: 5, name: '文档编写', defaultWeight: 10, isDefault: true },
    { id: 6, name: '答辩表现', defaultWeight: 15, isDefault: true },
  ]));
});

// Project score config
router.get('/projects/:projectId/config', (req: Request, res: Response) => {
  res.json(success([]));
});

router.put('/projects/:projectId/config', requireRole('admin', 'teacher'), (req: Request, res: Response) => {
  res.json(success(null, '配置更新成功'));
});

// Submit score
router.post('/', requireRole('admin', 'teacher'), (req: Request, res: Response) => {
  res.json(success({ id: 1 }, '评分成功'));
});

// Get project score summary
router.get('/projects/:projectId/summary', requireRole('admin', 'teacher'), (req: Request, res: Response) => {
  res.json(success([]));
});

export default router;
