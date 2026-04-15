DROP TABLE IF EXISTS `s_feeds`;

CREATE TABLE `s_feeds` (
  `id`         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id`    INT(11)      NOT NULL,
  `title`      VARCHAR(64)  NOT NULL,
  `url`        TEXT         NOT NULL,
  `sort`       INT          NOT NULL DEFAULT 100,
  `enabled`    TINYINT(1)   NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_sort` (`user_id`, `sort`),
  CONSTRAINT `fk_s_feeds_user`
    FOREIGN KEY (`user_id`) REFERENCES `auth_accounts`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
