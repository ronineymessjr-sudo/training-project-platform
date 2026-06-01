-- =====================================================
-- Migration 007: Scoring System
-- =====================================================

-- Score dimensions table
CREATE TABLE IF NOT EXISTS `score_dimensions` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL COMMENT '维度名称',
    `description` TEXT COMMENT '维度描述',
    `default_weight` DECIMAL(5,2) DEFAULT 0 COMMENT '默认权重',
    `is_default` TINYINT DEFAULT 0 COMMENT '是否系统默认',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='评分维度表';

-- Project score configs table
CREATE TABLE IF NOT EXISTS `project_score_configs` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `project_id` BIGINT UNSIGNED NOT NULL,
    `dimension_id` INT UNSIGNED NOT NULL,
    `weight` DECIMAL(5,2) NOT NULL COMMENT '权重(%)',
    `max_score` DECIMAL(5,2) DEFAULT 100 COMMENT '满分',
    FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`dimension_id`) REFERENCES `score_dimensions`(`id`),
    UNIQUE KEY `uk_project_dimension` (`project_id`, `dimension_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='项目评分配置表';

-- Scores table
CREATE TABLE IF NOT EXISTS `scores` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `project_id` BIGINT UNSIGNED NOT NULL,
    `group_id` BIGINT UNSIGNED NOT NULL,
    `dimension_id` INT UNSIGNED NOT NULL,
    `score` DECIMAL(5,2) NOT NULL COMMENT '得分',
    `comment` TEXT COMMENT '评语',
    `scorer_id` BIGINT UNSIGNED NOT NULL COMMENT '评分人',
    `scored_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`group_id`) REFERENCES `groups`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`dimension_id`) REFERENCES `score_dimensions`(`id`),
    FOREIGN KEY (`scorer_id`) REFERENCES `users`(`id`),
    UNIQUE KEY `uk_project_group_dimension` (`project_id`, `group_id`, `dimension_id`, `scorer_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='评分记录表';

-- Score summaries table
CREATE TABLE IF NOT EXISTS `score_summaries` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `project_id` BIGINT UNSIGNED NOT NULL,
    `group_id` BIGINT UNSIGNED NOT NULL,
    `total_score` DECIMAL(6,2) NOT NULL COMMENT '总分',
    `weighted_score` DECIMAL(6,2) COMMENT '加权分',
    `rank` INT COMMENT '排名',
    `evaluator_id` BIGINT UNSIGNED COMMENT '最终评定人',
    `evaluated_at` TIMESTAMP NULL,
    FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`group_id`) REFERENCES `groups`(`id`) ON DELETE CASCADE,
    UNIQUE KEY `uk_project_group` (`project_id`, `group_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='评分汇总表';
