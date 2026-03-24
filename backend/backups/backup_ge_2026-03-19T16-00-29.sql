-- MySQL Database Backup
-- Host: localhost
-- Database: ge
-- Generated at: 2026-03-19T16:00:29.101Z

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";
SET FOREIGN_KEY_CHECKS = 0;


-- Table structure for `categories`
DROP TABLE IF EXISTS `categories`;
CREATE TABLE `categories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nom` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `nom` (`nom`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


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
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- Table structure for `depenses`
DROP TABLE IF EXISTS `depenses`;
CREATE TABLE `depenses` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nom` varchar(255) NOT NULL,
  `montant` decimal(10,2) NOT NULL,
  `description` text DEFAULT NULL,
  `date` date NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `fournisseur_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_depense_fournisseur` (`fournisseur_id`),
  CONSTRAINT `fk_depense_fournisseur` FOREIGN KEY (`fournisseur_id`) REFERENCES `fournisseurs` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- Table structure for `factures`
DROP TABLE IF EXISTS `factures`;
CREATE TABLE `factures` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `client_id` int(11) DEFAULT NULL,
  `temp_client_nom` varchar(255) DEFAULT NULL,
  `temp_client_adresse` text DEFAULT NULL,
  `temp_client_telephone` varchar(50) DEFAULT NULL,
  `temp_client_email` varchar(100) DEFAULT NULL,
  `numero_facture` varchar(20) NOT NULL,
  `date_facture` date NOT NULL,
  `liste_articles` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`liste_articles`)),
  `prix_total` decimal(65,0) NOT NULL,
  `created_by_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `Objet` varchar(255) DEFAULT NULL,
  `commentaire` text DEFAULT NULL,
  `paiement` decimal(15,2) DEFAULT 0.00,
  `status` enum('facture','proforma') DEFAULT 'facture',
  `remise` decimal(15,2) DEFAULT 0.00,
  `date_paiement` date DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `client_id` (`client_id`),
  KEY `numero_facture` (`numero_facture`),
  KEY `date_facture` (`date_facture`),
  KEY `created_by_id` (`created_by_id`),
  CONSTRAINT `factures_ibfk_1` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `factures_ibfk_2` FOREIGN KEY (`created_by_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- Table structure for `fournisseurs`
DROP TABLE IF EXISTS `fournisseurs`;
CREATE TABLE `fournisseurs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nom` varchar(255) NOT NULL,
  `telephone` varchar(50) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `adresse` text DEFAULT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- Table structure for `produit_achat`
DROP TABLE IF EXISTS `produit_achat`;
CREATE TABLE `produit_achat` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nom` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `quantite` decimal(10,2) DEFAULT 0.00,
  `prix_achat` decimal(10,2) NOT NULL DEFAULT 0.00,
  `prix_vente` decimal(10,2) NOT NULL DEFAULT 0.00,
  `unite` varchar(100) DEFAULT NULL,
  `category_id` int(11) DEFAULT NULL,
  `produit_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `fournisseur_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_achat_fournisseur` (`fournisseur_id`),
  CONSTRAINT `fk_achat_fournisseur` FOREIGN KEY (`fournisseur_id`) REFERENCES `fournisseurs` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=50 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- Table structure for `produits`
DROP TABLE IF EXISTS `produits`;
CREATE TABLE `produits` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nom` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `nom_unite_gros` varchar(100) DEFAULT 'Carton',
  `quantite` decimal(11,2) NOT NULL,
  `prix` decimal(10,2) NOT NULL,
  `unité` varchar(100) NOT NULL,
  `category_id` int(11) DEFAULT NULL,
  `pieces_par_carton` int(11) NOT NULL DEFAULT 1,
  `prix_carton` decimal(20,2) NOT NULL DEFAULT 0.00,
  `prix_piece` decimal(20,2) NOT NULL DEFAULT 0.00,
  `prix_achat` decimal(20,2) DEFAULT 0.00,
  `fournisseur_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_category` (`category_id`),
  KEY `fk_produit_fournisseur` (`fournisseur_id`),
  CONSTRAINT `fk_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_produit_fournisseur` FOREIGN KEY (`fournisseur_id`) REFERENCES `fournisseurs` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


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
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Data for table `categories`
INSERT INTO `categories` (`id`, `nom`, `description`, `created_at`) VALUES
(1, '     nouriture', 'sakafo', '2026-03-01 16:54:05');

-- Data for table `clients`
INSERT INTO `clients` (`id`, `nom`, `adresse`, `telephone`, `email`, `stat`, `nif`) VALUES
(1, 'santatrinianina feno nasandratra', 'tsst', '0383072485', 'santatriniainafeno01@gmail.com', NULL, NULL);

-- Data for table `factures`
INSERT INTO `factures` (`id`, `client_id`, `temp_client_nom`, `temp_client_adresse`, `temp_client_telephone`, `temp_client_email`, `numero_facture`, `date_facture`, `liste_articles`, `prix_total`, `created_by_id`, `created_at`, `Objet`, `commentaire`, `paiement`, `status`, `remise`, `date_paiement`) VALUES
(13, 1, NULL, NULL, NULL, NULL, 'Fact-001', '2026-03-03 21:00:00', '[{"produit_id":24,"nom":"ovyb","quantite":1,"prix":"12000.00","type_vente":"carton","unité":"sac","prix_carton":"12000.00","prix_piece":"1200.00","pieces_par_carton":10,"nom_unite_gros":"sac","unité_détail":"Pièce"}]', '12000', 3, '2026-03-04 19:05:40', NULL, NULL, '12000.00', 'facture', '0.00', NULL),
(14, 1, NULL, NULL, NULL, NULL, 'Fact-002', '2026-03-03 21:00:00', '[{"produit_id":24,"nom":"ovyb","quantite":10,"prix":"12000.00","type_vente":"carton","unité":"sac","prix_carton":"12000.00","prix_piece":"1200.00","pieces_par_carton":10,"nom_unite_gros":"sac","unité_détail":"Pièce"}]', '120000', 3, '2026-03-04 19:53:36', NULL, NULL, '115000.00', 'facture', '0.00', '2026-03-05 21:00:00'),
(15, 1, NULL, NULL, NULL, NULL, 'Fact-003', '2026-03-03 21:00:00', '[{"produit_id":24,"nom":"ovyb","quantite":1,"prix":"12000.00","type_vente":"carton","unité":"sac","prix_carton":"12000.00","prix_piece":"1200.00","pieces_par_carton":10,"nom_unite_gros":"sac","unité_détail":"Pièce"}]', '12000', 3, '2026-03-04 19:59:47', NULL, NULL, '12000.00', 'facture', '0.00', '2026-03-05 21:00:00'),
(16, 1, NULL, NULL, NULL, NULL, 'Fact-004', '2026-03-05 21:00:00', '[{"produit_id":25,"nom":"fer","quantite":1,"prix":"0.00","type_vente":"carton","unité":"Carton","prix_carton":"0.00","prix_piece":"0.00","pieces_par_carton":20,"nom_unite_gros":"Carton","unité_détail":"Pièce"},{"produit_id":24,"nom":"vary","quantite":1,"prix":"12000.00","type_vente":"carton","unité":"sac","prix_carton":"12000.00","prix_piece":"1200.00","pieces_par_carton":10,"nom_unite_gros":"sac","unité_détail":"kg"}]', '12000', 3, '2026-03-06 09:30:22', 'dfdf', NULL, '0.00', 'proforma', '0.00', NULL),
(17, 1, NULL, NULL, NULL, NULL, 'Fact-005', '2026-03-18 21:00:00', '[{"produit_id":24,"nom":"vary","quantite":1,"prix":"12000.00","type_vente":"carton","unité":"sac","prix_carton":"12000.00","prix_piece":"1200.00","pieces_par_carton":10,"nom_unite_gros":"sac","unité_détail":"kg"}]', '12000', 3, '2026-03-19 15:36:22', 'dfdf', 'dfdfd', '2000.00', 'facture', '0.00', '2026-03-18 21:00:00');

-- Data for table `fournisseurs`
INSERT INTO `fournisseurs` (`id`, `nom`, `telephone`, `email`, `adresse`, `description`, `created_at`) VALUES
(1, 'koto', '032568452', '', 'uguig', '', '2026-03-01 16:54:05');

-- Data for table `produit_achat`
INSERT INTO `produit_achat` (`id`, `nom`, `description`, `quantite`, `prix_achat`, `prix_vente`, `unite`, `category_id`, `produit_id`, `created_at`, `fournisseur_id`) VALUES
(46, 'vary', 'Achat via Dépenses', '22.00', '1100.00', '0.00', 'sac', NULL, 24, '2026-03-04 18:09:00', 1),
(47, 'vary', 'Approvisionnement', '21.00', '1100.00', '12000.00', 'sac', NULL, 24, '2026-03-04 18:31:58', 1),
(48, 'fer', 'Stock Initial', '10.50', '0.00', '0.00', 'Carton', 1, 25, '2026-03-06 09:22:18', 1),
(49, 'sucre', 'Stock Initial', '50.00', '8000.00', '10000.00', 'sac', 1, 26, '2026-03-19 15:38:57', 1);

-- Data for table `produits`
INSERT INTO `produits` (`id`, `nom`, `description`, `nom_unite_gros`, `quantite`, `prix`, `unité`, `category_id`, `pieces_par_carton`, `prix_carton`, `prix_piece`, `prix_achat`, `fournisseur_id`) VALUES
(24, 'vary', 'Approvisionnement via Dépenses', 'sac', '300.00', '12000.00', 'kg', NULL, 10, '12000.00', '1200.00', '1100.00', 1),
(25, 'fer', 'gvgv', 'Carton', '210.00', '0.00', 'Pièce', 1, 20, '0.00', '0.00', '0.00', 1),
(26, 'sucre', 'dsdsd', 'sac', '50000.00', '10000.00', 'kapoaka', 1, 1000, '10000.00', '12000.00', '8000.00', 1);

-- Data for table `users`
INSERT INTO `users` (`id`, `nom`, `prenom`, `email`, `mdp`, `role`, `image`, `created_at`, `validated`) VALUES
(3, 'santatriniaina', 'feno nasandratra', 'santatriniainafeno01@gmail.com', '$2b$10$1.Ald1IUCK4ynyr75xIj/ul6QZEFUKa1sebmdot1QIvYN9bm9eeee', 'SuperAdmin', 'Prince.L ð¤´20250307_101604_Eden Garden by Prince ð».jpg', '2026-03-01 16:54:05', 1),
(6, 'First ', 'Admin', 's@gmail.com', '$2b$10$pYa12AG0ixLxnjSQUf.sVeoKvoTNySs/pbjKSbCwgvzlRAI/LvZcK', 'Admin', NULL, '2026-03-01 16:54:05', 1),
(15, 'santatriniaina', 'feno nasandratra', 'santatriniainafeno@gmail.com', '$2b$10$WIN3St4GTc0m/TBvTjgN/OuemKAHag0MZphdnjTXi6YEyFkFTkf1u', 'Admin', NULL, '2026-03-01 16:54:05', 1),
(16, 'Test', 'User', 'admin@gmail.com', '$2b$10$yHqTxlF0vTm1lusc7sdv8OAyqEMTCNSkJcx5qmBw0oglnzfebAxhi', 'Admin', NULL, '2026-03-01 16:54:05', 0);


SET FOREIGN_KEY_CHECKS = 1;
