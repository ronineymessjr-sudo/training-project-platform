-- =====================================================
-- Migration 010: Announcements
-- =====================================================

-- Announcements table
CREATE TABLE IF NOT EXISTS `announcements` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `project_id` BIGINT UNSIGNED COMMENT '关联项目(为空则全局公告)',
    `title` VARCHAR(200) NOT NULL COMMENT '公告标题',
    `content` TEXT NOT NULL COMMENT '公告内容',
    `type` TINYINT DEFAULT 1 COMMENT '类型: 1-通知, 2-公告, 3-提醒',
    `priority` TINYINT DEFAULT 0 COMMENT '优先级: 0-普通, 1-重要, 2-紧急',
    `publisher_id` BIGINT UNSIGNED NOT NULL COMMENT '发布人',
    `target_roles` JSON COMMENT '目标角色(为空则全员可见)',
    `status` TINYINT DEFAULT 1 COMMENT '状态: 0-草稿, 1-已发布, 2-已撤回',
    `published_at` TIMESTAMP NULL COMMENT '发布时间',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`publisher_id`) REFERENCES `users`(`id`),
    INDEX `idx_project_status` (`project_id`, `status`),
    INDEX `idx_published_at` (`published_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='公告表';

-- Announcement reads table
CREATE TABLE IF NOT EXISTS `announcement_reads` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `announcement_id` BIGINT UNSIGNED NOT NULL,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `read_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY `uk_announcement_user` (`announcement_id`, `user_id`),
    FOREIGN KEY (`announcement_id`) REFERENCES `announcements`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='公告阅读记录表';
