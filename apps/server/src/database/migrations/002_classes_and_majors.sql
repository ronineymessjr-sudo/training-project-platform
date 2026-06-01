-- =====================================================
-- Migration 002: Classes and Majors
-- =====================================================

-- Majors table
CREATE TABLE IF NOT EXISTS `majors` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `code` VARCHAR(20) NOT NULL UNIQUE COMMENT '专业代码',
    `name` VARCHAR(100) NOT NULL COMMENT '专业名称',
    `department` VARCHAR(100) COMMENT '所属院系',
    `description` TEXT COMMENT '专业描述',
    `status` TINYINT DEFAULT 1 COMMENT '状态',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='专业表';

-- Classes table
CREATE TABLE IF NOT EXISTS `classes` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `major_id` INT UNSIGNED NOT NULL COMMENT '专业ID',
    `grade` YEAR NOT NULL COMMENT '年级',
    `class_no` INT NOT NULL COMMENT '班级号',
    `name` VARCHAR(100) NOT NULL COMMENT '班级名称',
    `counselor_id` BIGINT UNSIGNED COMMENT '辅导员ID',
    `student_count` INT DEFAULT 0 COMMENT '学生人数',
    `status` TINYINT DEFAULT 1,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY `uk_major_grade_class` (`major_id`, `grade`, `class_no`),
    FOREIGN KEY (`major_id`) REFERENCES `majors`(`id`),
    FOREIGN KEY (`counselor_id`) REFERENCES `users`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='班级表';

-- Student classes junction table
CREATE TABLE IF NOT EXISTS `student_classes` (
    `student_id` BIGINT UNSIGNED NOT NULL,
    `class_id` INT UNSIGNED NOT NULL,
    `is_current` TINYINT DEFAULT 1 COMMENT '是否当前班级',
    `joined_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`student_id`, `class_id`),
    FOREIGN KEY (`student_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`class_id`) REFERENCES `classes`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='学生班级关联表';

-- Student import logs table
CREATE TABLE IF NOT EXISTS `student_import_logs` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `class_id` INT UNSIGNED NOT NULL COMMENT '导入班级',
    `operator_id` BIGINT UNSIGNED NOT NULL COMMENT '操作人',
    `total_count` INT DEFAULT 0 COMMENT '总记录数',
    `success_count` INT DEFAULT 0 COMMENT '成功数',
    `fail_count` INT DEFAULT 0 COMMENT '失败数',
    `error_detail` TEXT COMMENT '失败详情(JSON)',
    `file_url` VARCHAR(500) COMMENT '导入文件URL',
    `status` TINYINT DEFAULT 1 COMMENT '状态: 0-处理中, 1-完成, 2-部分失败',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`class_id`) REFERENCES `classes`(`id`),
    FOREIGN KEY (`operator_id`) REFERENCES `users`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='学生导入记录表';
