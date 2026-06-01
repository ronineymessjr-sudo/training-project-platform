-- =====================================================
-- Migration 009: Workload Tracking
-- =====================================================

-- Workloads table
CREATE TABLE IF NOT EXISTS `workloads` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `project_id` BIGINT UNSIGNED NOT NULL,
    `group_id` BIGINT UNSIGNED NOT NULL,
    `student_id` BIGINT UNSIGNED NOT NULL COMMENT '学生',
    `task_name` VARCHAR(200) NOT NULL COMMENT '任务名称',
    `task_description` TEXT COMMENT '任务描述',
    `task_type` TINYINT DEFAULT 1 COMMENT '任务类型: 1-需求分析, 2-设计, 3-编码, 4-测试, 5-文档, 6-部署',
    `estimated_hours` DECIMAL(6,2) COMMENT '预估工时',
    `actual_hours` DECIMAL(6,2) COMMENT '实际工时',
    `completion_rate` INT DEFAULT 0 COMMENT '完成百分比',
    `contribution_ratio` DECIMAL(5,2) COMMENT '贡献占比(%)',
    `status` TINYINT DEFAULT 0 COMMENT '状态: 0-未开始, 1-进行中, 2-已完成',
    `report_date` DATE COMMENT '填报日期',
    `verified_by` BIGINT UNSIGNED COMMENT '审核人',
    `verified_at` TIMESTAMP NULL COMMENT '审核时间',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`group_id`) REFERENCES `groups`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`student_id`) REFERENCES `users`(`id`),
    FOREIGN KEY (`verified_by`) REFERENCES `users`(`id`),
    INDEX `idx_project_group` (`project_id`, `group_id`),
    INDEX `idx_student` (`student_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='个人工作量表';
