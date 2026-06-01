import { Router } from 'express';
import { projectController } from '../controllers/project.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

// 所有项目相关接口都需要认证
router.use(authenticate);

// 获取项目列表
router.get('/', projectController.getList);

// 获取我的项目
router.get('/my', projectController.getMyProjects);

// 获取项目详情
router.get('/:id', projectController.getDetail);

// 创建项目（教师/管理员）
router.post('/', authorize(['teacher', 'admin']), projectController.create);

// 更新项目
router.put('/:id', projectController.update);

// 删除项目
router.delete('/:id', authorize(['teacher', 'admin']), projectController.delete);

export default router;
