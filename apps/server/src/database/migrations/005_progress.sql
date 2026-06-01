-- =====================================================
-- Migration 005: Progress Tracking
-- =====================================================

-- Progress records table
CREATE TABLE IF NOT EXISTS `progress` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `project_id` BIGINT UNSIGNED NOT NULL,
    `group_id` BIGINT UNSIGNED NOT NULL,
    `phase_id` BIGINT UNSIGNED COMMENT '所属阶段',
    `title` VARCHAR(200) NOT NULL COMMENT '进度标题',
    `content` TEXT COMMENT '进度内容',
    `completion_rate` INT DEFAULT 0 COMMENT '完成百分比',
    `reporter_id` BIGINT UNSIGNED NOT NULL COMMENT '报告人',
    `report_date` DATE NOT NULL COMMENT '报告日期',
    `status` TINYINT DEFAULT 1 COMMENT '状态',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`group_id`) REFERENCES `groups`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`phase_id`) REFERENCES `project_phases`(`id`),
    FOREIGN KEY (`reporter_id`) REFERENCES `users`(`id`),
    INDEX `idx_project_group` (`project_id`, `group_id`),
    INDEX `idx_report_date` (`report_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='进度记录表';

-- Progress logs table
CREATE TABLE IF NOT EXISTS `progress_logs` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `progress_id` BIGINT UNSIGNED NOT NULL,
    `content` TEXT NOT NULL COMMENT '日志内容',
    `created_by` BIGINT UNSIGNED NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`progress_id`) REFERENCES `progress`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`created_by`) REFERENCES `users`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='进度日志表';
