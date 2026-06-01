-- =====================================================
-- Migration 004: Groups and Members
-- =====================================================

-- Groups table
CREATE TABLE IF NOT EXISTS `groups` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `project_id` BIGINT UNSIGNED NOT NULL COMMENT '所属项目',
    `name` VARCHAR(100) NOT NULL COMMENT '组名',
    `description` TEXT COMMENT '组描述',
    `leader_id` BIGINT UNSIGNED COMMENT '组长ID',
    `max_members` INT DEFAULT 4 COMMENT '最大成员数',
    `status` TINYINT DEFAULT 1 COMMENT '状态: 0-解散, 1-正常',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`leader_id`) REFERENCES `users`(`id`),
    INDEX `idx_project` (`project_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='分组表';

-- Group members table
CREATE TABLE IF NOT EXISTS `group_members` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `group_id` BIGINT UNSIGNED NOT NULL,
    `student_id` BIGINT UNSIGNED NOT NULL,
    `role` TINYINT DEFAULT 0 COMMENT '角色: 0-成员, 1-组长',
    `joined_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `status` TINYINT DEFAULT 1 COMMENT '状态',
    UNIQUE KEY `uk_group_student` (`group_id`, `student_id`),
    FOREIGN KEY (`group_id`) REFERENCES `groups`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`student_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='组成员表';

-- Group applications table
CREATE TABLE IF NOT EXISTS `group_applications` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `group_id` BIGINT UNSIGNED NOT NULL,
    `student_id` BIGINT UNSIGNED NOT NULL COMMENT '申请学生',
    `type` TINYINT NOT NULL COMMENT '类型: 1-申请加入, 2-邀请加入',
    `status` TINYINT DEFAULT 0 COMMENT '状态: 0-待处理, 1-已同意, 2-已拒绝',
    `message` VARCHAR(500) COMMENT '留言',
    `processed_by` BIGINT UNSIGNED COMMENT '处理人',
    `processed_at` TIMESTAMP NULL COMMENT '处理时间',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`group_id`) REFERENCES `groups`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`student_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='分组申请表';
