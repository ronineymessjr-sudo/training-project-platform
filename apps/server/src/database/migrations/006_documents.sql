-- =====================================================
-- Migration 006: Documents
-- =====================================================

-- Documents table
CREATE TABLE IF NOT EXISTS `documents` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `project_id` BIGINT UNSIGNED NOT NULL,
    `group_id` BIGINT UNSIGNED COMMENT '所属分组(可选)',
    `uploader_id` BIGINT UNSIGNED NOT NULL,
    `name` VARCHAR(255) NOT NULL COMMENT '文档名称',
    `type` VARCHAR(50) COMMENT '文档类型',
    `file_url` VARCHAR(500) NOT NULL COMMENT '文件URL',
    `file_size` BIGINT COMMENT '文件大小(字节)',
    `file_hash` VARCHAR(64) COMMENT '文件MD5',
    `description` TEXT COMMENT '描述',
    `category` TINYINT DEFAULT 1 COMMENT '分类: 1-需求, 2-设计, 3-代码, 4-测试, 5-报告, 6-其他',
    `status` TINYINT DEFAULT 1,
    `download_count` INT DEFAULT 0 COMMENT '下载次数',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`group_id`) REFERENCES `groups`(`id`) ON DELETE SET NULL,
    FOREIGN KEY (`uploader_id`) REFERENCES `users`(`id`),
    INDEX `idx_project` (`project_id`),
    INDEX `idx_category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文档表';

-- Document versions table
CREATE TABLE IF NOT EXISTS `document_versions` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `document_id` BIGINT UNSIGNED NOT NULL,
    `version` VARCHAR(20) NOT NULL COMMENT '版本号',
    `file_url` VARCHAR(500) NOT NULL,
    `file_size` BIGINT,
    `change_log` TEXT COMMENT '变更说明',
    `created_by` BIGINT UNSIGNED NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`document_id`) REFERENCES `documents`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`created_by`) REFERENCES `users`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文档版本表';
