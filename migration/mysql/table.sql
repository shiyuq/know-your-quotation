CREATE TABLE `image` (
	`id` CHAR(36) NOT NULL COLLATE 'utf8mb4_0900_ai_ci',
	`tenant_id` CHAR(36) NOT NULL COLLATE 'utf8mb4_0900_ai_ci',
	`base64_data` LONGTEXT NOT NULL COLLATE 'utf8mb4_0900_ai_ci',
	`hash_data` VARCHAR(255) NOT NULL DEFAULT '' COLLATE 'utf8mb4_0900_ai_ci',
	`create_time` DATETIME NULL DEFAULT (now()),
	`update_time` DATETIME NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	PRIMARY KEY (`id`) USING BTREE,
	INDEX `idx_tenant` (`tenant_id`) USING BTREE,
	INDEX `hash_data` (`hash_data`) USING BTREE
)
COLLATE='utf8mb4_0900_ai_ci'
ENGINE=InnoDB
ROW_FORMAT=DYNAMIC
;

CREATE TABLE `product` (
	`id` CHAR(36) NOT NULL COLLATE 'utf8mb4_0900_ai_ci',
	`tenant_id` CHAR(36) NOT NULL COLLATE 'utf8mb4_0900_ai_ci',
	`name` VARCHAR(100) NOT NULL COLLATE 'utf8mb4_0900_ai_ci',
	`desc` VARCHAR(255) NULL DEFAULT NULL COLLATE 'utf8mb4_0900_ai_ci',
	`status` TINYINT(3) NOT NULL DEFAULT '1',
	`create_time` DATETIME NULL DEFAULT (now()),
	`update_time` DATETIME NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	PRIMARY KEY (`id`) USING BTREE,
	INDEX `idx_tenant` (`tenant_id`) USING BTREE,
	INDEX `status` (`status`) USING BTREE
)
COLLATE='utf8mb4_0900_ai_ci'
ENGINE=InnoDB
;

CREATE TABLE `quotation` (
	`id` CHAR(36) NOT NULL COLLATE 'utf8mb4_0900_ai_ci',
	`tenant_id` CHAR(36) NOT NULL COLLATE 'utf8mb4_0900_ai_ci',
	`user_id` CHAR(36) NOT NULL COLLATE 'utf8mb4_0900_ai_ci',
	`customer_id` CHAR(36) NOT NULL COLLATE 'utf8mb4_0900_ai_ci',
	`items` JSON NOT NULL COMMENT '产品明细',
	`total_amount` DECIMAL(12,2) NOT NULL,
	`status` TINYINT(3) NOT NULL DEFAULT '1' COMMENT '1有效 2作废',
	`create_time` DATETIME NOT NULL DEFAULT (now()),
	`update_time` DATETIME NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	PRIMARY KEY (`id`) USING BTREE,
	INDEX `idx_tenant` (`tenant_id`) USING BTREE,
	INDEX `idx_user` (`user_id`) USING BTREE,
	INDEX `customer_id` (`customer_id`) USING BTREE,
	INDEX `status` (`status`) USING BTREE
)
COLLATE='utf8mb4_0900_ai_ci'
ENGINE=InnoDB
;

CREATE TABLE `sku` (
	`id` CHAR(36) NOT NULL COLLATE 'utf8mb4_0900_ai_ci',
	`tenant_id` CHAR(36) NOT NULL COLLATE 'utf8mb4_0900_ai_ci',
	`product_id` CHAR(36) NOT NULL COLLATE 'utf8mb4_0900_ai_ci',
	`sku_code` VARCHAR(50) NOT NULL COLLATE 'utf8mb4_0900_ai_ci',
	`pricing_type` TINYINT(3) NOT NULL COMMENT '计价方式',
	`attribute_value` DECIMAL(10,2) NULL DEFAULT NULL COMMENT '每件产品的属性值',
	`desc` VARCHAR(255) NOT NULL COLLATE 'utf8mb4_0900_ai_ci',
	`image_id` CHAR(36) NOT NULL COLLATE 'utf8mb4_0900_ai_ci',
	`unit_price` DECIMAL(10,2) NOT NULL,
	`unit` VARCHAR(10) NOT NULL COLLATE 'utf8mb4_0900_ai_ci',
	`status` TINYINT(3) NOT NULL DEFAULT '1',
	`create_time` DATETIME NULL DEFAULT (now()),
	`update_time` DATETIME NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	PRIMARY KEY (`id`) USING BTREE,
	INDEX `idx_tenant` (`tenant_id`) USING BTREE,
	INDEX `idx_product` (`product_id`) USING BTREE,
	INDEX `idx_sku_code` (`sku_code`) USING BTREE
)
COLLATE='utf8mb4_0900_ai_ci'
ENGINE=InnoDB
;

CREATE TABLE `tenant` (
	`id` CHAR(36) NOT NULL COLLATE 'utf8mb4_0900_ai_ci',
	`name` VARCHAR(100) NOT NULL COLLATE 'utf8mb4_0900_ai_ci',
	`create_time` DATETIME NOT NULL DEFAULT (now()),
	`update_time` DATETIME NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	PRIMARY KEY (`id`) USING BTREE
)
COLLATE='utf8mb4_0900_ai_ci'
ENGINE=InnoDB
;

CREATE TABLE `user` (
	`id` CHAR(36) NOT NULL COLLATE 'utf8mb4_0900_ai_ci',
	`tenant_id` CHAR(36) NULL DEFAULT NULL COLLATE 'utf8mb4_0900_ai_ci',
	`username` VARCHAR(50) NOT NULL COLLATE 'utf8mb4_0900_ai_ci',
	`password` VARCHAR(255) NOT NULL COLLATE 'utf8mb4_0900_ai_ci',
	`salt` VARCHAR(255) NOT NULL COLLATE 'utf8mb4_0900_ai_ci',
	`phone` VARCHAR(20) NULL DEFAULT NULL COLLATE 'utf8mb4_0900_ai_ci',
	`role` ENUM('boss','staff','platform_admin') NOT NULL DEFAULT 'staff' COLLATE 'utf8mb4_0900_ai_ci',
	`status` TINYINT(3) NOT NULL DEFAULT '1',
	`create_time` DATETIME NOT NULL DEFAULT (now()),
	`update_time` DATETIME NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	PRIMARY KEY (`id`) USING BTREE,
	UNIQUE INDEX `unique_tenant_user` (`username`) USING BTREE,
	INDEX `idx_tenant` (`tenant_id`) USING BTREE,
	INDEX `status` (`status`) USING BTREE
)
COLLATE='utf8mb4_0900_ai_ci'
ENGINE=InnoDB
;

CREATE TABLE `customer` (
	`id` CHAR(36) NOT NULL COLLATE 'utf8mb4_0900_ai_ci',
	`tenant_id` CHAR(36) NOT NULL COLLATE 'utf8mb4_0900_ai_ci',
	`name` VARCHAR(100) NOT NULL COLLATE 'utf8mb4_0900_ai_ci',
	`phone` VARCHAR(50) NULL DEFAULT NULL COLLATE 'utf8mb4_0900_ai_ci',
	`email` VARCHAR(100) NULL DEFAULT NULL COLLATE 'utf8mb4_0900_ai_ci',
	`remark` TEXT NULL DEFAULT NULL COLLATE 'utf8mb4_0900_ai_ci',
	`create_time` DATETIME NOT NULL DEFAULT (now()),
	`update_time` DATETIME NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	PRIMARY KEY (`id`) USING BTREE,
	INDEX `idx_tenant` (`tenant_id`) USING BTREE,
	INDEX `name` (`name`) USING BTREE
)
COLLATE='utf8mb4_0900_ai_ci'
ENGINE=InnoDB
;
