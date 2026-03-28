-- MySQL Database Backup
-- Host: localhost
-- Database: ge
-- Generated at: 2026-03-28T13:19:56.714Z

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
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


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


-- Table structure for `entrepots`
DROP TABLE IF EXISTS `entrepots`;
CREATE TABLE `entrepots` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nom` varchar(150) NOT NULL,
  `type` enum('entrepôt','magasin') NOT NULL DEFAULT 'entrepôt',
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


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
  `prix_total` bigint(255) NOT NULL,
  `created_by_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `Objet` varchar(255) DEFAULT NULL,
  `commentaire` text DEFAULT NULL,
  `paiement` bigint(255) DEFAULT 0,
  `status` enum('facture','proforma') DEFAULT 'facture',
  `remise` bigint(255) DEFAULT 0,
  `date_paiement` date DEFAULT NULL,
  `dernier_paiement` bigint(255) DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `client_id` (`client_id`),
  KEY `numero_facture` (`numero_facture`),
  KEY `date_facture` (`date_facture`),
  KEY `created_by_id` (`created_by_id`),
  CONSTRAINT `factures_ibfk_1` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `factures_ibfk_2` FOREIGN KEY (`created_by_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


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
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- Table structure for `produit_achat`
DROP TABLE IF EXISTS `produit_achat`;
CREATE TABLE `produit_achat` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nom` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `quantite` int(255) DEFAULT 0,
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
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


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
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


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
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- Table structure for `produits`
DROP TABLE IF EXISTS `produits`;
CREATE TABLE `produits` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nom` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `nom_unite_gros` varchar(100) DEFAULT 'Gros',
  `quantite` int(255) NOT NULL,
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
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


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
) ENGINE=InnoDB AUTO_INCREMENT=44 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


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
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Data for table `categories`
INSERT INTO `categories` (`id`, `nom`, `description`, `created_at`) VALUES
(1, 'PPN', '', '2026-03-28 11:14:16'),
(2, 'Quincaillerie', '', '2026-03-28 11:14:30');

-- Data for table `entrepots`
INSERT INTO `entrepots` (`id`, `nom`, `type`, `description`, `created_at`) VALUES
(2, 'test', 'entrepôt', 'test', '2026-03-28 11:13:45'),
(3, 'fdfd', 'magasin', 'fdf', '2026-03-28 11:39:17');

-- Data for table `fournisseurs`
INSERT INTO `fournisseurs` (`id`, `nom`, `telephone`, `email`, `adresse`, `description`, `created_at`) VALUES
(2, 'Brandon Fidelin Ravomanana', '0325656128', 'brandonravomanana.v@gmail.com', 'Mananara', '', '2026-03-28 11:38:54'),
(3, 'tt', '0325656128', '', 'tt', 'tt', '2026-03-28 11:39:07');

-- Data for table `produit_achat`
INSERT INTO `produit_achat` (`id`, `nom`, `description`, `quantite`, `prix_achat`, `prix_vente`, `unite`, `category_id`, `produit_id`, `created_at`, `fournisseur_id`, `entrepot_id`, `prix_achat_piece`) VALUES
(10, 'Fer', 'Stock Initial', 10, 8000, 10000, 'filet', 1, 7, '2026-03-28 12:05:00', 2, NULL, 0),
(11, 'Fer', 'Stock Initial', 4, 100, 10000, 'barre', 1, 7, '2026-03-28 12:05:00', 2, NULL, 0),
(12, 'Fer', 'Approvisionnement', 8, 8000, 10000, 'filet', 1, 7, '2026-03-28 12:29:55', 2, 2, 0),
(13, 'savom', 'Stock Initial', 11, 500, 1000, 'Carton', 1, 8, '2026-03-28 12:32:13', 2, NULL, 0),
(14, 'test', 'Stock Initial', 10, 5000, 7000, 'Carton', 1, 9, '2026-03-28 12:35:49', 2, NULL, 0),
(15, 'test', 'Stock Initial', 6, 3000, 4000, 'Pièce', 1, 9, '2026-03-28 12:35:49', 2, NULL, 0),
(16, 'savom', 'Approvisionnement', 10, 500, 1000, 'Carton', 1, 8, '2026-03-28 13:04:00', 3, 3, 0);

-- Data for table `produit_entrepot`
INSERT INTO `produit_entrepot` (`id`, `produit_id`, `entrepot_id`, `created_at`) VALUES
(14, 7, 2, '2026-03-28 12:05:00'),
(15, 8, 3, '2026-03-28 12:32:13'),
(16, 9, 3, '2026-03-28 12:35:49');

-- Data for table `produit_fournisseurs`
INSERT INTO `produit_fournisseurs` (`id`, `produit_id`, `fournisseur_id`, `created_at`) VALUES
(18, 7, 2, '2026-03-28 12:05:00'),
(19, 8, 2, '2026-03-28 12:32:13'),
(20, 9, 2, '2026-03-28 12:35:49');

-- Data for table `produits`
INSERT INTO `produits` (`id`, `nom`, `description`, `nom_unite_gros`, `quantite`, `prix`, `unité`, `category_id`, `pieces_par_carton`, `prix_carton`, `prix_piece`, `prix_achat`, `fournisseur_id`, `prix_achat_piece`, `stock_threshold`) VALUES
(7, 'Fer', 'Approvisionnement via Dépenses', 'filet', 94, 10000, 'barre', 1, 5, 10000, 1000, 8000, 2, 1600, 5),
(8, 'savom', 'Approvisionnement via Dépenses', 'Carton', 209, 1000, 'Pièce', 1, 10, 1000, 500, 500, 3, 50, 5),
(9, 'test', '', 'Carton', 106, 7000, 'Pièce', 1, 10, 7000, 4000, 5000, 2, 3000, 10);

-- Data for table `system_logs`
INSERT INTO `system_logs` (`id`, `user_id`, `action_type`, `entity_type`, `entity_id`, `old_value`, `new_value`, `description`, `created_at`) VALUES
(26, 17, 'add', 'fournisseur', 2, NULL, '{"nom":"Brandon Fidelin Ravomanana","adresse":"Mananara","telephone":"0325656128","email":"brandonravomanana.v@gmail.com","description":""}', 'Création du fournisseur: Brandon Fidelin Ravomanana', '2026-03-28 11:38:54'),
(27, 17, 'add', 'fournisseur', 3, NULL, '{"nom":"tt","adresse":"tt","telephone":"0325656128","email":"","description":"tt"}', 'Création du fournisseur: tt', '2026-03-28 11:39:07'),
(28, 17, 'add', 'entrepot', 3, NULL, '{"nom":"fdfd","type":"magasin","description":"fdf"}', 'Création de l''entrepôt: fdfd', '2026-03-28 11:39:17'),
(29, 17, 'add', 'produit', 3, NULL, '{"nom":"Fer","description":"","stock_cartons":"10","stock_pieces":0,"prix_carton":"10000","prix_piece":"5000","pieces_par_carton":"5","prix_achat":"8000","prix_achat_piece":0,"unité":"barre","nom_unite_gros":"filet","category_id":2,"fournisseur_id":2,"fournisseur_ids":[2],"entrepot_ids":[2],"importSourceId":null,"stock_threshold":"5","quantite":50}', 'Création du produit: Fer', '2026-03-28 11:40:46'),
(30, 17, 'add', 'produit', 4, NULL, '{"nom":"Riz","description":"terer","stock_cartons":"10","stock_pieces":0,"prix_carton":"15000","prix_piece":"10000","pieces_par_carton":"100","prix_achat":"10000","prix_achat_piece":0,"unité":"Kapoaka","nom_unite_gros":"Sac","category_id":1,"fournisseur_id":3,"fournisseur_ids":[3],"entrepot_ids":[3],"importSourceId":null,"stock_threshold":"5","quantite":1000}', 'Création du produit: Riz', '2026-03-28 11:44:31'),
(31, 17, 'add', 'produit', 5, NULL, '{"nom":"test","description":"","stock_cartons":"10","stock_pieces":0,"prix_carton":"10000","prix_piece":"5000","pieces_par_carton":"5","prix_achat":"8000","prix_achat_piece":"100","unité":"Pièce","nom_unite_gros":"Carton","category_id":1,"fournisseur_id":2,"fournisseur_ids":[2],"entrepot_ids":[2],"importSourceId":null,"stock_threshold":0,"quantite":50}', 'Création du produit: test', '2026-03-28 11:45:43'),
(32, 17, 'add', 'produit', 6, NULL, '{"nom":"dsd","description":"","stock_cartons":"10","stock_pieces":"4","prix_carton":"2000","prix_piece":"1000","pieces_par_carton":"5","prix_achat":"1000","prix_achat_piece":"500","unité":"Pièce","nom_unite_gros":"Carton","category_id":2,"fournisseur_id":3,"fournisseur_ids":[3],"entrepot_ids":[2],"importSourceId":null,"stock_threshold":"5","quantite":54}', 'Création du produit: dsd', '2026-03-28 11:47:31'),
(33, 17, 'delete', 'produit', 6, NULL, NULL, 'Suppression du produit ID: 6', '2026-03-28 12:02:19'),
(34, 17, 'delete', 'produit', 3, NULL, NULL, 'Suppression du produit ID: 3', '2026-03-28 12:02:27'),
(35, 17, 'delete', 'produit', 4, NULL, NULL, 'Suppression du produit ID: 4', '2026-03-28 12:02:32'),
(36, 17, 'delete', 'produit', 5, NULL, NULL, 'Suppression du produit ID: 5', '2026-03-28 12:02:35'),
(37, 17, 'delete', 'produit_achat', 9, NULL, NULL, 'Suppression d''un enregistrement d''achat/ajustement ID: 9', '2026-03-28 12:02:43'),
(38, 17, 'delete', 'produit_achat', 8, NULL, NULL, 'Suppression d''un enregistrement d''achat/ajustement ID: 8', '2026-03-28 12:02:46'),
(39, 17, 'delete', 'produit_achat', 7, NULL, NULL, 'Suppression d''un enregistrement d''achat/ajustement ID: 7', '2026-03-28 12:02:48'),
(40, 17, 'delete', 'produit_achat', 6, NULL, NULL, 'Suppression d''un enregistrement d''achat/ajustement ID: 6', '2026-03-28 12:02:51'),
(41, 17, 'add', 'produit', 7, NULL, '{"nom":"Fer","description":"","stock_cartons":"10","stock_pieces":"4","prix_carton":"10000","prix_piece":"1000","pieces_par_carton":"5","prix_achat":"8000","prix_achat_piece":"100","unité":"barre","nom_unite_gros":"filet","category_id":1,"fournisseur_id":2,"fournisseur_ids":[2],"entrepot_ids":[2],"importSourceId":null,"stock_threshold":"5","quantite":54}', 'Création du produit: Fer', '2026-03-28 12:05:00'),
(42, 17, 'add', 'produit', 8, NULL, '{"nom":"savom","description":"","stock_cartons":"10","stock_pieces":"9","prix_carton":"1000","prix_piece":"500","pieces_par_carton":"10","prix_achat":"500","prix_achat_piece":"250","unité":"Pièce","nom_unite_gros":"Carton","category_id":1,"fournisseur_id":2,"fournisseur_ids":[2],"entrepot_ids":[3],"importSourceId":null,"stock_threshold":"5","quantite":109}', 'Création du produit: savom', '2026-03-28 12:32:13'),
(43, 17, 'add', 'produit', 9, NULL, '{"nom":"test","description":"","stock_cartons":"10","stock_pieces":"6","prix_carton":"7000","prix_piece":"4000","pieces_par_carton":"10","prix_achat":"5000","prix_achat_piece":"3000","unité":"Pièce","nom_unite_gros":"Carton","category_id":1,"fournisseur_id":2,"fournisseur_ids":[2],"entrepot_ids":[3],"importSourceId":null,"stock_threshold":"10","quantite":106}', 'Création du produit: test', '2026-03-28 12:35:49');

-- Data for table `users`
INSERT INTO `users` (`id`, `nom`, `prenom`, `email`, `mdp`, `role`, `image`, `created_at`, `validated`) VALUES
(17, 'Ravomanana', 'Brandon', 'brandonravomanana.v@gmail.com', '$2b$10$HL.k2uH0sx737pPkJGO3Zebofo3KTT13yzYhA3Zv8btctPMhWsMGy', 'SuperAdmin', NULL, '2026-03-23 17:43:28', 1);


SET FOREIGN_KEY_CHECKS = 1;
