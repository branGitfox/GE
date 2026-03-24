-- MySQL Database Backup
-- Host: localhost
-- Database: gestion_facture
-- Generated at: 2026-02-07T19:24:57.881Z

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


-- Table structure for `clients`
DROP TABLE IF EXISTS `clients`;
CREATE TABLE `clients` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nom` varchar(100) DEFAULT NULL,
  `adresse` text DEFAULT NULL,
  `telephone` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `stat` varchar(100) DEFAULT NULL,
  `nif` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=42 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- Table structure for `factures`
DROP TABLE IF EXISTS `factures`;
CREATE TABLE `factures` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `client_id` int(11) NOT NULL,
  `numero_facture` varchar(20) NOT NULL,
  `date_facture` date NOT NULL,
  `liste_articles` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`liste_articles`)),
  `prix_total` decimal(10,2) NOT NULL,
  `created_by_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `Objet` varchar(255) DEFAULT NULL,
  `commentaire` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `client_id` (`client_id`),
  KEY `numero_facture` (`numero_facture`),
  KEY `date_facture` (`date_facture`),
  KEY `created_by_id` (`created_by_id`),
  CONSTRAINT `factures_ibfk_1` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`),
  CONSTRAINT `factures_ibfk_2` FOREIGN KEY (`created_by_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=54 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- Table structure for `produits`
DROP TABLE IF EXISTS `produits`;
CREATE TABLE `produits` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nom` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `quantite` decimal(11,2) NOT NULL,
  `prix` decimal(10,2) NOT NULL,
  `unité` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- Table structure for `users`
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nom` varchar(100) NOT NULL,
  `prenom` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `mdp` varchar(255) NOT NULL,
  `role` enum('Admin','SuperAdmin') DEFAULT 'Admin',
  `image` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `validated` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Data for table `clients`
INSERT INTO `clients` (`id`, `nom`, `adresse`, `telephone`, `email`, `stat`, `nif`) VALUES
(11, 'santatriniana feno nasandratra', 'Antanifotsy', '0329042042', 'santatriniainafeno01@gmail.com', NULL, NULL),
(26, 'Solo', 'Anosy', '0325623125', 'solo@yff.com', NULL, NULL),
(36, 'Tovy', '67Ha sud', '0332545685', 'Tovy@gmail.com', NULL, NULL),
(37, 'Rakoto', 'itaosy', '03265421', 'Rakoto@gmail.com', NULL, NULL),
(40, 'GGke', 'Fenofitiah', '025896314', 'gjg@gmail.com', '1023', '15620'),
(41, 'rakoto', 'bema', '03333333', 'no@gmail.com', NULL, NULL);

-- Data for table `factures`
INSERT INTO `factures` (`id`, `client_id`, `numero_facture`, `date_facture`, `liste_articles`, `prix_total`, `created_by_id`, `created_at`, `Objet`, `commentaire`) VALUES
(47, 11, '4K-001', 'Fri Apr 04 2025 00:00:00 GMT+0200 (heure d’été d’Europe centrale)', '[{"produit_id":24,"nom":"Impression sur Bache","quantite":"10","prix":17000,"unité":"m²"},{"produit_id":23,"nom":"Impression autocollant","quantite":"100","prix":16500,"unité":"m²"},{"produit_id":22,"nom":"ENCRE DTF BLANC","quantite":1,"prix":80000,"unité":"L"}]', '1900000.00', 3, 'Fri Apr 04 2025 07:58:08 GMT+0200 (heure d’été d’Europe centrale)', NULL, NULL),
(48, 37, '4K-002', 'Fri Apr 04 2025 00:00:00 GMT+0200 (heure d’été d’Europe centrale)', '[{"produit_id":24,"nom":"Impression sur Bache","quantite":"10","prix":17000,"unité":"m²"},{"produit_id":23,"nom":"Impression autocollant","quantite":1,"prix":16500,"unité":"m²"}]', '186500.00', 3, 'Fri Apr 04 2025 07:59:27 GMT+0200 (heure d’été d’Europe centrale)', 'rien', NULL),
(49, 26, '4K-003', 'Fri Apr 04 2025 00:00:00 GMT+0200 (heure d’été d’Europe centrale)', '[{"produit_id":22,"nom":"ENCRE DTF BLANC","quantite":1,"prix":80000,"unité":"L"}]', '80000.00', 3, 'Fri Apr 04 2025 07:59:53 GMT+0200 (heure d’été d’Europe centrale)', NULL, NULL),
(50, 11, '4K-004', 'Fri Apr 04 2025 00:00:00 GMT+0200 (heure d’été d’Europe centrale)', '[{"produit_id":24,"nom":"Impression sur Bache","quantite":"10","prix":17000,"unité":"m²"}]', '170000.00', 3, 'Fri Apr 04 2025 08:00:18 GMT+0200 (heure d’été d’Europe centrale)', NULL, NULL),
(51, 37, '4K-005', 'Fri Apr 04 2025 00:00:00 GMT+0200 (heure d’été d’Europe centrale)', '[{"produit_id":24,"nom":"Impression sur Bache","quantite":"9","prix":17000,"unité":"m²"}]', '153000.00', 3, 'Fri Apr 04 2025 08:02:04 GMT+0200 (heure d’été d’Europe centrale)', NULL, NULL),
(53, 41, '4K-007', 'Sat Feb 07 2026 00:00:00 GMT+0100 (heure normale d’Europe centrale)', '[{"produit_id":31,"nom":"tv","quantite":1,"prix":"21212121.00","unité":"pouce"}]', '21212121.00', 3, 'Sat Feb 07 2026 19:39:30 GMT+0100 (heure normale d’Europe centrale)', NULL, NULL);

-- Data for table `produits`
INSERT INTO `produits` (`id`, `nom`, `description`, `quantite`, `prix`, `unité`) VALUES
(22, 'ENCRE DTF BLANC', 'Fournisseur FULL DREAM', '40.00', '80000.00', 'L'),
(23, 'Impression autocollant', 'Autocollant sans decoupe', '279.00', '16500.00', 'm²'),
(24, 'Impression sur Bache', 'Bache', '648.00', '17000.00', 'm²'),
(31, 'tv', 'dfdfddfdfd', '1.00', '21212121.00', 'pouce');

-- Data for table `users`
INSERT INTO `users` (`id`, `nom`, `prenom`, `email`, `mdp`, `role`, `image`, `created_at`, `validated`) VALUES
(3, 'santatriniaina', 'feno nasandratra', 'santatriniainafeno01@gmail.com', '$2b$10$1.Ald1IUCK4ynyr75xIj/ul6QZEFUKa1sebmdot1QIvYN9bm9eeee', 'SuperAdmin', 'Prince.L ð¤´20250307_101604_Eden Garden by Prince ð».jpg', 'Thu Mar 20 2025 14:47:53 GMT+0100 (heure normale d’Europe centrale)', 1),
(6, 'First ', 'Admin', 's@gmail.com', '$2b$10$pYa12AG0ixLxnjSQUf.sVeoKvoTNySs/pbjKSbCwgvzlRAI/LvZcK', 'Admin', NULL, 'Fri Mar 21 2025 07:36:50 GMT+0100 (heure normale d’Europe centrale)', 1);

