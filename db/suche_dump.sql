/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-12.2.2-MariaDB, for osx10.21 (arm64)
--
-- Host: localhost    Database: jardyx_auth
-- ------------------------------------------------------
-- Server version	12.2.2-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

--
-- Table structure for table `s_db_migrations`
--

DROP TABLE IF EXISTS `s_db_migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `s_db_migrations` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `filename` varchar(128) NOT NULL,
  `applied_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_filename` (`filename`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `s_db_migrations`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `s_db_migrations` WRITE;
/*!40000 ALTER TABLE `s_db_migrations` DISABLE KEYS */;
INSERT INTO `s_db_migrations` VALUES
(2,'001_create_s_db_migrations.sql','2026-04-15 19:52:30'),
(3,'002_create_s_buttons.sql','2026-04-15 19:52:30'),
(4,'003_create_s_feeds.sql','2026-04-15 19:52:30'),
(5,'004_seed_s_buttons.sql','2026-04-15 19:52:30'),
(6,'005_seed_s_feeds.sql','2026-04-15 19:52:30');
/*!40000 ALTER TABLE `s_db_migrations` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `s_buttons`
--

DROP TABLE IF EXISTS `s_buttons`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `s_buttons` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `caption` varchar(64) NOT NULL,
  `url` text NOT NULL,
  `target` enum('_blank','_self') NOT NULL DEFAULT '_blank',
  `variant` varchar(32) NOT NULL DEFAULT 'btn-default',
  `icon` varchar(64) DEFAULT NULL,
  `img_url` varchar(255) DEFAULT NULL,
  `sort` int(11) NOT NULL DEFAULT 100,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_user_sort` (`user_id`,`sort`),
  CONSTRAINT `fk_s_buttons_user` FOREIGN KEY (`user_id`) REFERENCES `auth_accounts` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `s_buttons`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `s_buttons` WRITE;
/*!40000 ALTER TABLE `s_buttons` DISABLE KEYS */;
INSERT INTO `s_buttons` VALUES
(1,4,'WLAN Kennwort','https://edasapp1.wien.tuev.at/start/browse/Webseiten/IT/WLAN-Key%20UpInTheAir','_blank','btn-primary',NULL,NULL,200,'2026-04-15 19:52:30','2026-04-16 05:02:46'),
(2,4,'Gehaltszettel des Technischen Überwachungsvereins','https://tppsap.wien.tuev.at/irj/portal','_blank','btn-primary',NULL,NULL,100,'2026-04-15 19:52:30','2026-04-16 06:04:45'),
(3,4,'IT Tickets','http://servicedesk.tuev.at','_blank','btn-danger',NULL,NULL,300,'2026-04-15 19:52:30','2026-04-16 05:02:27'),
(4,4,'Moodle :: Humboldt','http://hdl.online-campus.at/login/index.php','_blank','btn-dark',NULL,NULL,400,'2026-04-15 19:52:30','2026-04-16 05:02:27'),
(5,4,'Moodle :: Akademie','https://www.tuv-elearning.at/','_blank','btn-danger',NULL,NULL,500,'2026-04-15 19:52:30','2026-04-16 05:02:27'),
(6,4,'Moodle :: 2me.org','http://2me.org/tuv','_blank','btn-success',NULL,NULL,600,'2026-04-15 19:52:30','2026-04-16 05:02:27'),
(7,4,'Umfragen','http://survey.jardyx.com/admin/','_blank','btn-success',NULL,NULL,700,'2026-04-15 19:52:30','2026-04-16 05:02:27'),
(8,4,'Facebook','https://www.facebook.com/erik.accart.huemer','_blank','btn-primary',NULL,NULL,800,'2026-04-15 19:52:30','2026-04-16 05:02:27'),
(9,4,'Dropbox','https://www.dropbox.com/home/','_blank','btn-primary',NULL,NULL,900,'2026-04-15 19:52:30','2026-04-16 05:02:27'),
(10,4,'Doodle','https://doodle.com','_blank','btn-primary',NULL,NULL,1000,'2026-04-15 19:52:30','2026-04-16 05:02:27'),
(11,4,'Ö1','http://oe1.orf.at/konsole?show=live','_blank','btn-default',NULL,NULL,1100,'2026-04-15 19:52:30','2026-04-16 05:02:27'),
(12,4,'Der Standard','http://derstandard.at/','_blank','btn-default',NULL,NULL,1200,'2026-04-15 19:52:30','2026-04-16 05:02:27'),
(13,4,'Die Presse','http://diepresse.com/','_blank','btn-light',NULL,NULL,1300,'2026-04-15 19:52:30','2026-04-16 05:02:27'),
(14,6,'Der Standard','http://derstandard.at/','_blank','btn-default',NULL,NULL,100,'2026-04-15 19:52:30','2026-04-15 19:52:30'),
(15,6,'Ö1','http://oe1.orf.at/konsole?show=live','_blank','btn-default',NULL,NULL,200,'2026-04-15 19:52:30','2026-04-15 19:52:30'),
(16,6,'Facebook','https://www.facebook.com/AtheFUAtheFU','_blank','btn-primary',NULL,NULL,300,'2026-04-15 19:52:30','2026-04-15 19:52:30'),
(17,6,'FroKnowsPhoto','http://froknowsphoto.com/','_blank','btn-danger',NULL,NULL,400,'2026-04-15 19:52:30','2026-04-15 19:52:30');
/*!40000 ALTER TABLE `s_buttons` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `s_feeds`
--

DROP TABLE IF EXISTS `s_feeds`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `s_feeds` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `title` varchar(64) NOT NULL,
  `url` text NOT NULL,
  `sort` int(11) NOT NULL DEFAULT 100,
  `enabled` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_user_sort` (`user_id`,`sort`),
  CONSTRAINT `fk_s_feeds_user` FOREIGN KEY (`user_id`) REFERENCES `auth_accounts` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `s_feeds`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `s_feeds` WRITE;
/*!40000 ALTER TABLE `s_feeds` DISABLE KEYS */;
INSERT INTO `s_feeds` VALUES
(1,4,'MacTechNews.de','https://www.mactechnews.de/Rss/News.x',100,1,'2026-04-15 19:52:30','2026-04-15 19:52:30'),
(2,4,'Standard','https://www.derstandard.at/rss',200,1,'2026-04-15 19:52:30','2026-04-15 19:52:30'),
(3,4,'Standard / Web','https://www.derstandard.at/rss/web',300,1,'2026-04-15 19:52:30','2026-04-15 19:52:30'),
(4,4,'ORF Science','https://rss.orf.at/science.xml',400,1,'2026-04-15 19:52:30','2026-04-15 19:52:30'),
(5,6,'MacTechNews.de','https://www.mactechnews.de/Rss/News.x',100,1,'2026-04-15 19:52:30','2026-04-15 19:52:30'),
(6,6,'Standard','https://www.derstandard.at/rss',200,1,'2026-04-15 19:52:30','2026-04-15 19:52:30'),
(7,6,'Standard / Web','https://www.derstandard.at/rss/web',300,1,'2026-04-15 19:52:30','2026-04-15 19:52:30'),
(8,6,'ORF Science','https://rss.orf.at/science.xml',400,1,'2026-04-15 19:52:30','2026-04-15 19:52:30');
/*!40000 ALTER TABLE `s_feeds` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2026-04-17  5:45:52
