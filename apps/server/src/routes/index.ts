import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import projectRoutes from './project.routes';
import groupRoutes from './group.routes';
import progressRoutes from './progress.routes';
import documentRoutes from './document.routes';
import scoreRoutes from './score.routes';
import topicRoutes from './topic.routes';
import classRoutes from './class.routes';
import defenseRoutes from './defense.routes';
import workloadRoutes from './workload.routes';
import announcementRoutes from './announcement.routes';
import exportRoutes from './export.routes';
import adminRoutes from './admin.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/projects', projectRoutes);
router.use('/groups', groupRoutes);
router.use('/progress', progressRoutes);
router.use('/documents', documentRoutes);
router.use('/scores', scoreRoutes);
router.use('/topics', topicRoutes);
router.use('/classes', classRoutes);
router.use('/defenses', defenseRoutes);
router.use('/workloads', workloadRoutes);
router.use('/announcements', announcementRoutes);
router.use('/exports', exportRoutes);
router.use('/admin', adminRoutes);

export default router;
