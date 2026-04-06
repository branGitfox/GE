-- MySQL Database Backup
-- Host: localhost
-- Database: ge
-- Generated at: 2026-04-06T13:57:22.325Z

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
  KEY `email` (`email`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


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


-- Table structure for `entrepots`
DROP TABLE IF EXISTS `entrepots`;
CREATE TABLE `entrepots` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nom` varchar(150) NOT NULL,
  `type` enum('entrepôt','magasin') NOT NULL DEFAULT 'entrepôt',
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


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
) ENGINE=InnoDB AUTO_INCREMENT=100 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


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
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


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


-- Table structure for `roles`
DROP TABLE IF EXISTS `roles`;
CREATE TABLE `roles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nom` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `nom` (`nom`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


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
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


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
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Data for table `categories`
INSERT INTO `categories` (`id`, `nom`, `description`, `created_at`) VALUES
(1, 'ppn', '', '2026-04-06 11:44:05');

-- Data for table `clients`
INSERT INTO `clients` (`id`, `nom`, `adresse`, `telephone`, `email`, `stat`, `nif`) VALUES
(1, 'Brandon Fidelin Ravomanana', 'Mananara', '0325656128', 'brandonravomanana.v@gmail.com', NULL, NULL);

-- Data for table `factures`
INSERT INTO `factures` (`id`, `client_id`, `temp_client_nom`, `temp_client_adresse`, `temp_client_telephone`, `temp_client_email`, `numero_facture`, `date_facture`, `liste_articles`, `prix_total`, `created_by_id`, `created_at`, `Objet`, `commentaire`, `paiement`, `status`, `remise`, `date_paiement`, `dernier_paiement`) VALUES
(2, 1, NULL, NULL, NULL, NULL, 'Fact-001', '2026-04-05 21:00:00', '[{"produit_id":1,"nom":"Riz","quantite":1,"prix":1000,"type_vente":"carton","unité":"Carton","prix_carton":1000,"prix_piece":200,"prix_achat":500,"prix_achat_piece":200,"pieces_par_carton":5,"nom_unite_gros":"Carton","unité_détail":"Pièce"}]', '1000.00', 22, '2026-04-06 12:46:12', NULL, NULL, '0.00', 'facture', '0.00', NULL, '0.00');

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

-- Data for table `produit_achat`
INSERT INTO `produit_achat` (`id`, `nom`, `description`, `quantite`, `prix_achat`, `prix_vente`, `unite`, `category_id`, `produit_id`, `created_at`, `fournisseur_id`, `entrepot_id`, `prix_achat_piece`) VALUES
(1, 'Riz', 'Stock Initial', '10.000', 500, 1000, 'Carton', 1, 1, '2026-04-06 11:44:34', NULL, NULL, 0);

-- Data for table `produits`
INSERT INTO `produits` (`id`, `nom`, `description`, `nom_unite_gros`, `quantite`, `prix`, `unité`, `category_id`, `pieces_par_carton`, `prix_carton`, `prix_piece`, `prix_achat`, `fournisseur_id`, `prix_achat_piece`, `stock_threshold`) VALUES
(1, 'Riz', 'dsdsd', 'Carton', '45.000', 1000, 'Pièce', 1, 5, 1000, 200, 500, NULL, 200, 5);

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
(2, 5);

-- Data for table `roles`
INSERT INTO `roles` (`id`, `nom`, `description`, `created_at`) VALUES
(1, 'SuperAdmin', 'Accès complet à toutes les fonctionnalités', '2026-04-04 17:29:39'),
(2, 'Admin', 'Accès administratif standard', '2026-04-04 17:29:39');

-- Data for table `system_logs`
INSERT INTO `system_logs` (`id`, `user_id`, `action_type`, `entity_type`, `entity_id`, `old_value`, `new_value`, `description`, `created_at`) VALUES
(1, 17, 'reset', 'system', NULL, NULL, NULL, 'Réinitialisation complète de la base de données (hors utilisateurs)', '2026-04-06 08:02:01'),
(2, 17, 'backup', 'system', NULL, NULL, NULL, 'Exportation de la base de données: backup_ge_2026-04-06T08-02-13.sql', '2026-04-06 08:02:13'),
(3, 17, 'add', 'client', 1, NULL, '{"nom":"Brandon Fidelin Ravomanana","adresse":"Mananara","telephone":"0325656128","email":"brandonravomanana.v@gmail.com"}', 'Création du client: Brandon Fidelin Ravomanana', '2026-04-06 11:43:58'),
(4, 17, 'add', 'categorie', 1, NULL, '{"nom":"ppn","description":""}', 'Création de la catégorie: ppn', '2026-04-06 11:44:05'),
(5, 17, 'add', 'produit', 1, NULL, '{"nom":"Riz","description":"dsdsd","stock_cartons":"10","stock_pieces":0,"prix_carton":"1000","prix_piece":"200","pieces_par_carton":"5","prix_achat":"500","prix_achat_piece":0,"unité":"Pièce","nom_unite_gros":"Carton","category_id":1,"fournisseur_id":"","fournisseur_ids":[],"entrepot_ids":[],"importSourceId":null,"stock_threshold":"5","quantite":50}', 'Création du produit: Riz', '2026-04-06 11:44:34'),
(6, 17, 'update', 'produit', 1, NULL, '{"nom":"Riz","description":"dsdsd","stock_cartons":10,"stock_pieces":0,"prix_carton":1000,"prix_piece":200,"pieces_par_carton":5,"prix_achat":500,"prix_achat_piece":"200","unité":"Pièce","nom_unite_gros":"Carton","category_id":1,"fournisseur_id":"","fournisseur_ids":[],"entrepot_ids":[],"stock_threshold":5,"quantite":50}', 'Mise à jour du produit: Riz', '2026-04-06 11:44:43'),
(7, 17, 'update', 'user', 21, NULL, '{"nom":"Ravomanana","prenom":"Brandon","email":"brandonravomanana2.v@gmail.com","role_id":"2"}', 'Mise à jour de l''utilisateur: Ravomanana Brandon', '2026-04-06 11:55:19'),
(8, 17, 'update', 'user', 21, NULL, '{"nom":"Ravomanana","prenom":"Brandon","email":"brandonravomanana2.v@gmail.com","role_id":2}', 'Mise à jour de l''utilisateur: Ravomanana Brandon', '2026-04-06 11:55:37'),
(9, 17, 'add', 'facture', 1, NULL, '{"client_id":1,"numero_facture":"","date_facture":"2026-04-06","liste_articles":[{"produit_id":1,"nom":"Riz","quantite":10,"prix":1000,"type_vente":"carton","unité":"Carton","prix_carton":1000,"prix_piece":200,"prix_achat":500,"prix_achat_piece":200,"pieces_par_carton":5,"nom_unite_gros":"Carton","unité_détail":"Pièce"}],"prix_total":10000,"Objet":null,"commentaire":null,"paiement":0,"isTempClient":false,"temp_client_nom":null,"temp_client_adresse":null,"temp_client_telephone":null,"temp_client_email":"","remise":"","created_by_id":17}', 'Création de la facture: Fact-001', '2026-04-06 11:58:53'),
(10, 17, 'delete', 'facture', 1, NULL, NULL, 'Suppression de la facture Fact-001 et retour des stocks.', '2026-04-06 11:59:08'),
(11, 22, 'add', 'facture', 2, NULL, '{"client_id":1,"numero_facture":"","date_facture":"2026-04-06","liste_articles":[{"produit_id":1,"nom":"Riz","quantite":1,"prix":1000,"type_vente":"carton","unité":"Carton","prix_carton":1000,"prix_piece":200,"prix_achat":500,"prix_achat_piece":200,"pieces_par_carton":5,"nom_unite_gros":"Carton","unité_détail":"Pièce"}],"prix_total":1000,"Objet":null,"commentaire":null,"paiement":0,"isTempClient":false,"temp_client_nom":null,"temp_client_adresse":null,"temp_client_telephone":null,"temp_client_email":"","remise":"","created_by_id":22}', 'Création de la facture: Fact-001', '2026-04-06 12:46:12');

-- Data for table `users`
INSERT INTO `users` (`id`, `nom`, `prenom`, `email`, `mdp`, `role`, `image`, `created_at`, `validated`, `role_id`) VALUES
(17, 'Ravomanana', 'Brandon Fidelin', 'brandonravomanana.v@gmail.com', '$2b$10$0Bz7Hvz2B6K60g8/9KooHeCqiGPbF1A20kHkzWt8aqhprkPBNV3Ra', 'SuperAdmin', NULL, '2026-03-23 17:43:28', 1, 1),
(21, 'Ravomanana', 'Brandon', 'brandonravomanana2.v@gmail.com', '$2b$10$CpcU1woJp72g914JyVPmYulh0fHAMpM8Hkw/jCvWHE4uTKVTZelTu', 'Admin', '2.png', '2026-04-06 11:54:30', 1, 2),
(22, 'Ravomanana', 'Brandon', 'brandonravomanana3.v@gmail.com', '$2b$10$1/BivB5a7BryoHv1WMJWF.0MxUe/gLlWNLwndpTEXL.R5GIvyGn2G', 'Admin', '3.png', '2026-04-06 12:04:18', 1, 1);


SET FOREIGN_KEY_CHECKS = 1;
