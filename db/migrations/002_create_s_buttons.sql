DROP TABLE IF EXISTS `s_buttons`;

CREATE TABLE `s_buttons` (
  `id`         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id`    INT(11)      NOT NULL,
  `caption`    VARCHAR(64)  NOT NULL,
  `url`        TEXT         NOT NULL,
  `target`     ENUM('_blank','_self') NOT NULL DEFAULT '_blank',
  `variant`    VARCHAR(32)  NOT NULL DEFAULT 'btn-default',
  `icon`       VARCHAR(64)  DEFAULT NULL,
  `img_url`    VARCHAR(255) DEFAULT NULL,
  `sort`       INT          NOT NULL DEFAULT 100,
  `created_at` TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_sort` (`user_id`, `sort`),
  CONSTRAINT `fk_s_buttons_user`
    FOREIGN KEY (`user_id`) REFERENCES `auth_accounts`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
