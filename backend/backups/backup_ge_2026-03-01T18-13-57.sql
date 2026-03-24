-- MySQL Database Backup
-- Host: localhost
-- Database: ge
-- Generated at: 2026-03-01T18:13:57.287Z

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


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
  `prix_total` decimal(10,2) NOT NULL,
  `created_by_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `Objet` varchar(255) DEFAULT NULL,
  `commentaire` text DEFAULT NULL,
  `paiement` decimal(15,2) DEFAULT 0.00,
  `status` enum('facture','proforma') DEFAULT 'facture',
  `remise` decimal(15,2) DEFAULT 0.00,
  PRIMARY KEY (`id`),
  KEY `client_id` (`client_id`),
  KEY `numero_facture` (`numero_facture`),
  KEY `date_facture` (`date_facture`),
  KEY `created_by_id` (`created_by_id`),
  CONSTRAINT `factures_ibfk_1` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `factures_ibfk_2` FOREIGN KEY (`created_by_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


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
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


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
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


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
(1, '     nouriture', 'sakafo', 'Sun Mar 01 2026 16:49:34 GMT+0100 (heure normale d’Europe centrale)');

-- Data for table `clients`
INSERT INTO `clients` (`id`, `nom`, `adresse`, `telephone`, `email`, `stat`, `nif`) VALUES
(1, 'santatrinianina feno nasandratra', 'tsst', '0383072485', 'santatriniainafeno01@gmail.com', NULL, NULL);

-- Data for table `factures`
INSERT INTO `factures` (`id`, `client_id`, `temp_client_nom`, `temp_client_adresse`, `temp_client_telephone`, `temp_client_email`, `numero_facture`, `date_facture`, `liste_articles`, `prix_total`, `created_by_id`, `created_at`, `Objet`, `commentaire`, `paiement`, `status`, `remise`) VALUES
(2, 1, NULL, NULL, NULL, NULL, 'Fact-002', 'Sun Mar 01 2026 00:00:00 GMT+0100 (heure normale d’Europe centrale)', '[{"produit_id":2,"nom":"vary","quantite":100,"prix":"4000.00","type_vente":"piece","unité":"kg","prix_carton":"200000.00","prix_piece":"4000.00","pieces_par_carton":250,"nom_unite_gros":"sac","unité_détail":"kg"}]', '400000.00', 3, 'Sun Mar 01 2026 17:15:01 GMT+0100 (heure normale d’Europe centrale)', NULL, NULL, '200000.00', 'facture', '0.00');

-- Data for table `fournisseurs`
INSERT INTO `fournisseurs` (`id`, `nom`, `telephone`, `email`, `adresse`, `description`, `created_at`) VALUES
(1, 'koto', '032568452', '', 'uguig', '', 'Sun Mar 01 2026 16:51:42 GMT+0100 (heure normale d’Europe centrale)');

-- Data for table `produit_achat`
INSERT INTO `produit_achat` (`id`, `nom`, `description`, `quantite`, `prix_achat`, `prix_vente`, `unite`, `category_id`, `produit_id`, `created_at`, `fournisseur_id`) VALUES
(1, 'biscuit ', 'Achat via Dépenses', '60.00', '10000.00', '0.00', 'carton', NULL, 1, 'Sun Mar 01 2026 16:52:27 GMT+0100 (heure normale d’Europe centrale)', 1),
(3, 'vary', 'Achat via Dépenses', '10.00', '150000.00', '0.00', 'sac', NULL, 2, 'Sun Mar 01 2026 17:09:52 GMT+0100 (heure normale d’Europe centrale)', 1);

-- Data for table `produits`
INSERT INTO `produits` (`id`, `nom`, `description`, `nom_unite_gros`, `quantite`, `prix`, `unité`, `category_id`, `pieces_par_carton`, `prix_carton`, `prix_piece`, `prix_achat`, `fournisseur_id`) VALUES
(1, 'biscuit ', '', 'carton', '100.00', '15000.00', 'Pièce', 1, 10, '15000.00', '1500.00', '10000.00', 1),
(2, 'vary', '', 'sac', '2400.00', '200000.00', 'kg', 1, 250, '200000.00', '4000.00', '150000.00', 1);

-- Data for table `users`
INSERT INTO `users` (`id`, `nom`, `prenom`, `email`, `mdp`, `role`, `image`, `created_at`, `validated`) VALUES
(3, 'santatriniaina', 'feno nasandratra', 'santatriniainafeno01@gmail.com', '$2b$10$1.Ald1IUCK4ynyr75xIj/ul6QZEFUKa1sebmdot1QIvYN9bm9eeee', 'SuperAdmin', 'Prince.L ð¤´20250307_101604_Eden Garden by Prince ð».jpg', 'Thu Mar 20 2025 13:47:53 GMT+0100 (heure normale d’Europe centrale)', 1),
(6, 'First ', 'Admin', 's@gmail.com', '$2b$10$pYa12AG0ixLxnjSQUf.sVeoKvoTNySs/pbjKSbCwgvzlRAI/LvZcK', 'Admin', NULL, 'Fri Mar 21 2025 06:36:50 GMT+0100 (heure normale d’Europe centrale)', 1),
(15, 'santatriniaina', 'feno nasandratra', 'santatriniainafeno@gmail.com', '$2b$10$WIN3St4GTc0m/TBvTjgN/OuemKAHag0MZphdnjTXi6YEyFkFTkf1u', 'Admin', NULL, 'Sat Feb 07 2026 20:13:27 GMT+0100 (heure normale d’Europe centrale)', 1),
(16, 'Test', 'User', 'admin@gmail.com', '$2b$10$yHqTxlF0vTm1lusc7sdv8OAyqEMTCNSkJcx5qmBw0oglnzfebAxhi', 'Admin', NULL, 'Mon Feb 23 2026 17:36:10 GMT+0100 (heure normale d’Europe centrale)', 0);

