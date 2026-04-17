-- Migration 006: add img_url to s_feeds
-- DB: jardyx_auth  User: suche
-- Idempotent: ADD COLUMN IF NOT EXISTS (MariaDB 10.3+)

USE jardyx_auth;

ALTER TABLE `s_feeds` ADD `img_url` VARCHAR(255) NULL DEFAULT NULL AFTER `url`;
