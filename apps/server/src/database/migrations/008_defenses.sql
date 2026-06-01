-- =====================================================
-- Migration 008: Defense System
-- =====================================================

-- Defenses table
CREATE TABLE IF NOT EXISTS `defenses` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `project_id` BIGINT UNSIGNED NOT NULL COMMENT '所属项目',
    `group_id` BIGINT UNSIGNED NOT NULL COMMENT '答辩分组',
    `title` VARCHAR(200) NOT NULL COMMENT '答辩标题',
    `defense_date` DATE NOT NULL COMMENT '答辩日期',
    `start_time` TIME NOT NULL COMMENT '开始时间',
    `end_time` TIME NOT NULL COMMENT '结束时间',
    `location` VARCHAR(200) COMMENT '答辩地点',
    `panel_teacher_ids` JSON COMMENT '评委教师ID列表',
    `secretary_id` BIGINT UNSIGNED COMMENT '答辩秘书ID',
    `status` TINYINT DEFAULT 0 COMMENT '状态: 0-待安排, 1-已安排, 2-进行中, 3-已完成',
    `max_duration` INT DEFAULT 30 COMMENT '每组最大答辩时长(分钟)',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`group_id`) REFERENCES `groups`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`secretary_id`) REFERENCES `users`(`id`),
    INDEX `idx_project_date` (`project_id`, `defense_date`),
    INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='答辩安排表';

-- Defense scores table
CREATE TABLE IF NOT EXISTS `defense_scores` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `defense_id` BIGINT UNSIGNED NOT NULL COMMENT '答辩安排ID',
    `group_id` BIGINT UNSIGNED NOT NULL COMMENT '答辩小组',
    `scorer_id` BIGINT UNSIGNED NOT NULL COMMENT '评分教师',
    `scorer_role` TINYINT NOT NULL COMMENT '评分角色: 1-指导教师, 2-评阅教师, 3-答辩评委',
    `presentation_score` DECIMAL(5,2) COMMENT '答辩展示分',
    `qa_score` DECIMAL(5,2) COMMENT '问答环节分',
    `document_score` DECIMAL(5,2) COMMENT '文档质量分',
    `total_score` DECIMAL(5,2) NOT NULL COMMENT '答辩总评分',
    `comment` TEXT COMMENT '评语',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`defense_id`) REFERENCES `defenses`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`group_id`) REFERENCES `groups`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`scorer_id`) REFERENCES `users`(`id`),
    UNIQUE KEY `uk_defense_group_scorer` (`defense_id`, `group_id`, `scorer_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='答辩评分表';
