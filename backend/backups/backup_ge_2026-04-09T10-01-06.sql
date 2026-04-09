-- MySQL Database Backup
-- Host: localhost
-- Database: ge
-- Generated at: 2026-04-09T10:01:06.606Z

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";
SET FOREIGN_KEY_CHECKS = 0;


-- Table structure for `roles`
DROP TABLE IF EXISTS `roles`;
CREATE TABLE `roles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nom` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `nom` (`nom`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Data for table `roles`
INSERT INTO `roles` (`id`, `nom`, `description`, `created_at`) VALUES
(1, 'SuperAdmin', 'Accès complet à toutes les fonctionnalités', '2026-04-04 20:29:39'),
(2, 'Admin', 'Accès administratif standard', '2026-04-04 20:29:39'),
(3, 'FACTURIER', 'Accueil client et facturation', '2026-04-06 13:18:28'),
(4, 'STOCK/PRODUIT', 'Fonction approvisionnement et stock', '2026-04-06 13:20:52');


-- Table structure for `pages`
DROP TABLE IF EXISTS `pages`;
CREATE TABLE `pages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nom` varchar(100) NOT NULL,
  `chemin` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `chemin` (`chemin`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Data for table `pages`
INSERT INTO `pages` (`id`, `nom`, `chemin`, `description`) VALUES
(1, 'Tableau de Bord', '/dashboard', NULL),
(2, 'Utilisateurs', '/dashboard/users', NULL),
(3, 'Clients', '/dashboard/clients', NULL),
(4, 'Produits', '/dashboard/produits', NULL),
(5, 'Ventes', '/dashboard/factures2', NULL),
(6, 'Proformas', '/dashboard/proformas', NULL),
(7, 'Clients avec Factures', '/dashboard/clients-factures', NULL),
(8, 'Paramètres', '/dashboard/settings', NULL),
(9, 'Catégories', '/dashboard/categories', NULL),
(10, 'Dépenses', '/dashboard/depenses', NULL),
(11, 'Fournisseurs', '/dashboard/fournisseurs', NULL),
(12, 'Entrepots', '/dashboard/entrepots', NULL),
(13, 'Journal (Logs)', '/dashboard/logs', NULL);


-- Table structure for `role_pages`
DROP TABLE IF EXISTS `role_pages`;
CREATE TABLE `role_pages` (
  `role_id` int(11) NOT NULL,
  `page_id` int(11) NOT NULL,
  PRIMARY KEY (`role_id`,`page_id`),
  KEY `page_id` (`page_id`),
  CONSTRAINT `role_pages_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `role_pages_ibfk_2` FOREIGN KEY (`page_id`) REFERENCES `pages` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Data for table `role_pages`
INSERT INTO `role_pages` (`role_id`, `page_id`) VALUES
(1, 1),
(1, 2),
(1, 3),
(1, 4),
(1, 5),
(1, 6),
(1, 7),
(1, 8),
(1, 9),
(1, 10),
(1, 11),
(1, 12),
(1, 13),
(2, 3),
(2, 5),
(2, 13),
(3, 3),
(3, 5),
(3, 6),
(4, 4),
(4, 9),
(4, 11);


-- Table structure for `categories`
DROP TABLE IF EXISTS `categories`;
CREATE TABLE `categories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nom` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `nom` (`nom`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Data for table `categories`
INSERT INTO `categories` (`id`, `nom`, `description`, `created_at`) VALUES
(1, 'PPN', 'Marchandise générale
', '2026-04-06 13:27:12'),
(2, 'BOISSON', 'Boisson alcoolique et hygiènique', '2026-04-06 13:27:37'),
(3, 'QUINCAILLERIE', '', '2026-04-06 13:28:05');


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
  KEY `email` (`email`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Data for table `clients`
INSERT INTO `clients` (`id`, `nom`, `adresse`, `telephone`, `email`, `stat`, `nif`) VALUES
(1, 'ZARAZANDRY', 'Ambatoharanana', '038 89 522 40', NULL, NULL, NULL),
(2, 'ESCAL RESTO', 'Andalambemahitsy', '038 89 522 41', NULL, NULL, NULL),
(3, 'ERIC PIECE', 'MANANARA-CENTRE', '0287544422', NULL, NULL, NULL),
(4, 'BAOBAB MARKET', 'MANANARA-CENTRE', '032 56478 25', NULL, NULL, NULL);


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
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Data for table `fournisseurs`
INSERT INTO `fournisseurs` (`id`, `nom`, `telephone`, `email`, `adresse`, `description`, `created_at`) VALUES
(1, 'STAR', '034 75 896 45', '', 'TAMATAVE', '', '2026-04-06 13:24:48'),
(2, 'STEVEN', '038 759 66', '', 'Antanakoro/Mananara', '', '2026-04-06 13:28:48'),
(3, 'SULONE', '', '', 'BAZAR BE TVE', '', '2026-04-06 13:29:07'),
(4, 'ANICET', '', '', 'Andatsadrano/Mananara', '', '2026-04-06 13:29:28');


-- Table structure for `entrepots`
DROP TABLE IF EXISTS `entrepots`;
CREATE TABLE `entrepots` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nom` varchar(150) NOT NULL,
  `type` enum('entrepôt','magasin') NOT NULL DEFAULT 'entrepôt',
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Data for table `entrepots`
INSERT INTO `entrepots` (`id`, `nom`, `type`, `description`, `created_at`) VALUES
(1, 'MAGASIN SOA', 'magasin', 'Point de vente principal et de stockage', '2026-04-06 16:26:04');


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
  `role_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `fk_user_role` (`role_id`),
  CONSTRAINT `fk_user_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Data for table `users`
INSERT INTO `users` (`id`, `nom`, `prenom`, `email`, `mdp`, `role`, `image`, `created_at`, `validated`, `role_id`) VALUES
(17, 'Ravomanana', 'Brandon Fidelin', 'brandonravomanana.v@gmail.com', '$2b$10$0Bz7Hvz2B6K60g8/9KooHeCqiGPbF1A20kHkzWt8aqhprkPBNV3Ra', 'SuperAdmin', NULL, '2026-03-23 20:43:28', 1, 1),
(23, 'LOU', 'THIERRY', 'thierrylou@gmail.com', '$2b$10$0ovJjUnlURz6Z3JQ9Aq.ruK6F8oTi/Gnd97qo8hzSPNDAjFJ7kvU.', 'Admin', NULL, '2026-04-06 13:15:46', 1, 2),
(24, 'GERMAINE', 'SOA', 'germainesoa@gmail.com', '$2b$10$4Mwj.wHpXbRd7Pv8BoUAweqzEhCynXimPJe16XLavm8op6XwjKAqq', 'Admin', NULL, '2026-04-06 13:22:16', 1, 4);


-- Table structure for `produits`
DROP TABLE IF EXISTS `produits`;
CREATE TABLE `produits` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nom` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `nom_unite_gros` varchar(100) DEFAULT 'Gros',
  `quantite` decimal(15,3) NOT NULL,
  `prix` int(255) NOT NULL,
  `unité` varchar(100) NOT NULL,
  `category_id` int(11) DEFAULT NULL,
  `pieces_par_carton` int(11) NOT NULL DEFAULT 1,
  `prix_carton` int(255) NOT NULL DEFAULT 0,
  `prix_piece` int(255) NOT NULL DEFAULT 0,
  `prix_achat` int(255) DEFAULT 0,
  `fournisseur_id` int(11) DEFAULT NULL,
  `prix_achat_piece` int(255) DEFAULT 0,
  `stock_threshold` int(11) DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `fk_category` (`category_id`),
  KEY `fk_produit_fournisseur` (`fournisseur_id`),
  CONSTRAINT `fk_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_produit_fournisseur` FOREIGN KEY (`fournisseur_id`) REFERENCES `fournisseurs` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- Table structure for `depenses`
DROP TABLE IF EXISTS `depenses`;
CREATE TABLE `depenses` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nom` varchar(255) NOT NULL,
  `montant` bigint(255) NOT NULL,
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
  `prix_total` decimal(19,2) NOT NULL,
  `created_by_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `Objet` varchar(255) DEFAULT NULL,
  `commentaire` text DEFAULT NULL,
  `paiement` decimal(19,2) DEFAULT 0.00,
  `status` enum('facture','proforma') DEFAULT 'facture',
  `remise` decimal(19,2) DEFAULT 0.00,
  `date_paiement` date DEFAULT NULL,
  `dernier_paiement` decimal(19,2) DEFAULT 0.00,
  PRIMARY KEY (`id`),
  KEY `client_id` (`client_id`),
  KEY `numero_facture` (`numero_facture`),
  KEY `date_facture` (`date_facture`),
  KEY `created_by_id` (`created_by_id`),
  CONSTRAINT `factures_ibfk_1` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `factures_ibfk_2` FOREIGN KEY (`created_by_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- Table structure for `produit_achat`
DROP TABLE IF EXISTS `produit_achat`;
CREATE TABLE `produit_achat` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nom` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `quantite` decimal(15,3) DEFAULT 0.000,
  `prix_achat` int(255) NOT NULL DEFAULT 0,
  `prix_vente` int(255) NOT NULL DEFAULT 0,
  `unite` varchar(100) DEFAULT NULL,
  `category_id` int(11) DEFAULT NULL,
  `produit_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `fournisseur_id` int(11) DEFAULT NULL,
  `entrepot_id` int(11) DEFAULT NULL,
  `prix_achat_piece` int(255) DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `fk_achat_fournisseur` (`fournisseur_id`),
  CONSTRAINT `fk_achat_fournisseur` FOREIGN KEY (`fournisseur_id`) REFERENCES `fournisseurs` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- Table structure for `produit_entrepot`
DROP TABLE IF EXISTS `produit_entrepot`;
CREATE TABLE `produit_entrepot` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `produit_id` int(11) NOT NULL,
  `entrepot_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_produit_entrepot` (`produit_id`,`entrepot_id`),
  KEY `entrepot_id` (`entrepot_id`),
  CONSTRAINT `produit_entrepot_ibfk_1` FOREIGN KEY (`produit_id`) REFERENCES `produits` (`id`) ON DELETE CASCADE,
  CONSTRAINT `produit_entrepot_ibfk_2` FOREIGN KEY (`entrepot_id`) REFERENCES `entrepots` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- Table structure for `produit_fournisseurs`
DROP TABLE IF EXISTS `produit_fournisseurs`;
CREATE TABLE `produit_fournisseurs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `produit_id` int(11) NOT NULL,
  `fournisseur_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_produit_fournisseur` (`produit_id`,`fournisseur_id`),
  KEY `fournisseur_id` (`fournisseur_id`),
  CONSTRAINT `produit_fournisseurs_ibfk_1` FOREIGN KEY (`produit_id`) REFERENCES `produits` (`id`) ON DELETE CASCADE,
  CONSTRAINT `produit_fournisseurs_ibfk_2` FOREIGN KEY (`fournisseur_id`) REFERENCES `fournisseurs` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- Table structure for `system_logs`
DROP TABLE IF EXISTS `system_logs`;
CREATE TABLE `system_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `action_type` varchar(50) NOT NULL,
  `entity_type` varchar(50) NOT NULL,
  `entity_id` int(11) DEFAULT NULL,
  `old_value` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`old_value`)),
  `new_value` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`new_value`)),
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `system_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Data for table `system_logs`
INSERT INTO `system_logs` (`id`, `user_id`, `action_type`, `entity_type`, `entity_id`, `old_value`, `new_value`, `description`, `created_at`) VALUES
(1, 17, 'reset', 'system', NULL, NULL, NULL, 'Réinitialisation complète de la base de données (hors utilisateurs)', '2026-04-06 18:54:37'),
(2, 17, 'backup', 'system', NULL, NULL, NULL, 'Exportation de la base de données: backup_ge_2026-04-06T15-54-49.sql', '2026-04-06 18:54:49');


SET FOREIGN_KEY_CHECKS = 1;
