import { Router, Request, Response } from 'express';
import { success, pageSuccess, getPagination } from '../utils/response';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();
router.use(authenticate);

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

router.post('/', (req: Request, res: Response) => {
  res.json(success({ id: 1 }, '上传成功'));
});

router.delete('/:id', (req: Request, res: Response) => {
  res.json(success(null, '删除成功'));
});

export default router;
