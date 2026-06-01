import { Router } from 'express';
import { groupController } from '../controllers/group.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// 所有分组相关接口都需要认证
router.use(authenticate);

// 获取分组列表
router.get('/', groupController.getList);

// 获取我的分组
router.get('/my', groupController.getMyGroups);

// 获取分组详情
router.get('/:id', groupController.getDetail);

// 创建分组
router.post('/', groupController.create);

// 更新分组
router.put('/:id', groupController.update);

// 删除分组
router.delete('/:id', groupController.delete);

// 添加成员
router.post('/:id/members', groupController.addMember);

// 移除成员
router.delete('/:id/members/:studentId', groupController.removeMember);

export default router;
