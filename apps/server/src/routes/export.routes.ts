import { Router, Request, Response } from 'express';
import { success } from '../utils/response';
import { authenticate, requireRole } from '../middlewares/auth.middleware';

const router = Router();
router.use(authenticate);

// Export routes - Placeholder implementation
// In production, these would use exceljs, pdfkit, docx to generate files

router.get('/project-list', requireRole('admin', 'teacher'), (req: Request, res: Response) => {
  res.json(success({ url: '/exports/project-list.xlsx' }, '导出成功'));
});

router.get('/group-table', requireRole('admin', 'teacher'), (req: Request, res: Response) => {
  res.json(success({ url: '/exports/group-table.xlsx' }, '导出成功'));
});

router.get('/score-table', requireRole('admin', 'teacher'), (req: Request, res: Response) => {
  res.json(success({ url: '/exports/score-table.xlsx' }, '导出成功'));
});

router.get('/defense-schedule', requireRole('admin', 'teacher'), (req: Request, res: Response) => {
  res.json(success({ url: '/exports/defense-schedule.xlsx' }, '导出成功'));
});

export default router;
