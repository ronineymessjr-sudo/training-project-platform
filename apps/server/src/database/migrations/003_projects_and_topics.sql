-- =====================================================
-- Migration 003: Projects and Topics
-- =====================================================

-- Topics table
CREATE TABLE IF NOT EXISTS `topics` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `title` VARCHAR(200) NOT NULL COMMENT '题目名称',
    `description` TEXT COMMENT '题目描述',
    `requirements` TEXT COMMENT '具体要求',
    `difficulty` TINYINT DEFAULT 1 COMMENT '难度: 1-简单, 2-中等, 3-困难',
    `estimated_days` INT COMMENT '预计完成天数',
    `tech_stack` JSON COMMENT '技术栈要求',
    `max_group_size` INT DEFAULT 4 COMMENT '最大小组人数',
    `min_group_size` INT DEFAULT 1 COMMENT '最小小组人数',
    `creator_id` BIGINT UNSIGNED NOT NULL COMMENT '创建人',
    `status` TINYINT DEFAULT 1 COMMENT '状态: 0-草稿, 1-已发布, 2-已归档',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`creator_id`) REFERENCES `users`(`id`),
    INDEX `idx_status` (`status`),
    FULLTEXT INDEX `idx_title_desc` (`title`, `description`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='实训题目表';

-- Projects table
CREATE TABLE IF NOT EXISTS `projects` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `topic_id` BIGINT UNSIGNED COMMENT '关联题目ID',
    `name` VARCHAR(200) NOT NULL COMMENT '项目名称',
    `description` TEXT COMMENT '项目描述',
    `class_id` INT UNSIGNED NOT NULL COMMENT '所属班级',
    `teacher_id` BIGINT UNSIGNED NOT NULL COMMENT '指导教师',
    `start_date` DATE NOT NULL COMMENT '开始日期',
    `end_date` DATE NOT NULL COMMENT '结束日期',
    `status` TINYINT DEFAULT 0 COMMENT '状态: 0-未开始, 1-进行中, 2-已结束, 3-已归档',
    `config` JSON COMMENT '项目配置(评分权重等)',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`topic_id`) REFERENCES `topics`(`id`),
    FOREIGN KEY (`class_id`) REFERENCES `classes`(`id`),
    FOREIGN KEY (`teacher_id`) REFERENCES `users`(`id`),
    INDEX `idx_class_status` (`class_id`, `status`),
    INDEX `idx_teacher` (`teacher_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='实训项目表';

-- Project phases table
CREATE TABLE IF NOT EXISTS `project_phases` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `project_id` BIGINT UNSIGNED NOT NULL COMMENT '所属项目',
    `name` VARCHAR(100) NOT NULL COMMENT '阶段名称',
    `description` TEXT COMMENT '阶段描述',
    `start_date` DATE NOT NULL,
    `end_date` DATE NOT NULL,
    `weight` DECIMAL(5,2) DEFAULT 0 COMMENT '权重(%)',
    `sort_order` INT DEFAULT 0 COMMENT '排序',
    `status` TINYINT DEFAULT 1,
    FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='项目阶段表';
