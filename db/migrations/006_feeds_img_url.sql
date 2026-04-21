-- Migration 006: add img_url to s_feeds
-- DB: auth  User: suche
-- Idempotent: ADD COLUMN IF NOT EXISTS (MariaDB 10.3+)

USE auth;

ALTER TABLE `s_feeds` ADD COLUMN IF NOT EXISTS `img_url` VARCHAR(255) NULL DEFAULT NULL AFTER `url`;
