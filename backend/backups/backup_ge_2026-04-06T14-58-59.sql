-- MySQL Database Backup
-- Host: localhost
-- Database: ge
-- Generated at: 2026-04-06T14:58:59.958Z

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+03:00";
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
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


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
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


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
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


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
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


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
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


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
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


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
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


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
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


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
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


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

-- Data for table `categories`
INSERT INTO `categories` (`id`, `nom`, `description`, `created_at`) VALUES
(1, 'PPN', 'Marchandise générale
', '2026-04-06 07:27:12'),
(2, 'BOISSON', 'Boisson alcoolique et hygiènique', '2026-04-06 07:27:37'),
(3, 'QUINCAILLERIE', '', '2026-04-06 07:28:05');

-- Data for table `clients`
INSERT INTO `clients` (`id`, `nom`, `adresse`, `telephone`, `email`, `stat`, `nif`) VALUES
(1, 'ZARAZANDRY', 'Ambatoharanana', '038 89 522 40', NULL, NULL, NULL),
(2, 'ESCAL RESTO', 'Andalambemahitsy', '038 89 522 41', NULL, NULL, NULL),
(3, 'ERIC PIECE', 'MANANARA-CENTRE', '0287544422', NULL, NULL, NULL),
(4, 'BAOBAB MARKET', 'MANANARA-CENTRE', '032 56478 25', NULL, NULL, NULL);

-- Data for table `depenses`
INSERT INTO `depenses` (`id`, `nom`, `montant`, `description`, `date`, `created_at`, `fournisseur_id`) VALUES
(1, 'Frais de transport TVE/MNR', 600000, 'Frais de transport marchandise (DYNASTY°', '2026-04-03 21:00:00', '2026-04-06 08:47:40', 2),
(2, 'Salaire Chauffeur Jeannot (Février)', 300000, '', '2026-04-03 21:00:00', '2026-04-06 10:30:15', NULL),
(3, 'JIRAMA', 120000, 'Mars', '2026-04-03 21:00:00', '2026-04-06 10:31:07', NULL);

-- Data for table `entrepots`
INSERT INTO `entrepots` (`id`, `nom`, `type`, `description`, `created_at`) VALUES
(1, 'MAGASIN SOA', 'magasin', 'Point de vente principal et de stockage', '2026-04-06 10:26:04');

-- Data for table `factures`
INSERT INTO `factures` (`id`, `client_id`, `temp_client_nom`, `temp_client_adresse`, `temp_client_telephone`, `temp_client_email`, `numero_facture`, `date_facture`, `liste_articles`, `prix_total`, `created_by_id`, `created_at`, `Objet`, `commentaire`, `paiement`, `status`, `remise`, `date_paiement`, `dernier_paiement`) VALUES
(1, 2, NULL, NULL, NULL, NULL, 'Fact-001', '2026-04-03 21:00:00', '[{"produit_id":2,"nom":"MENAKA","quantite":5,"prix":1100000,"type_vente":"carton","unité":"Jerricane","prix_carton":1100000,"prix_piece":60000,"prix_achat":1000000,"prix_achat_piece":50000,"pieces_par_carton":20,"nom_unite_gros":"Jerricane","unité_détail":"Litre"},{"produit_id":3,"nom":"THB","quantite":10,"prix":400000,"type_vente":"carton","unité":"Cageot","prix_carton":400000,"prix_piece":22500,"prix_achat":375000,"prix_achat_piece":0,"pieces_par_carton":20,"nom_unite_gros":"Cageot","unité_détail":"Bouteille"}]', '9500000.00', 17, '2026-04-06 08:48:38', NULL, NULL, '9500000.00', 'facture', '0.00', '2026-04-03 21:00:00', '0.00'),
(2, 1, NULL, NULL, NULL, NULL, 'Fact-002', '2026-04-03 21:00:00', '[{"produit_id":3,"nom":"THB","quantite":40,"prix":400000,"type_vente":"carton","unité":"Cageot","prix_carton":400000,"prix_piece":22500,"prix_achat":375000,"prix_achat_piece":0,"pieces_par_carton":20,"nom_unite_gros":"Cageot","unité_détail":"Bouteille"},{"produit_id":2,"nom":"MENAKA","quantite":35,"prix":1100000,"type_vente":"carton","unité":"Jerricane","prix_carton":1100000,"prix_piece":60000,"prix_achat":1000000,"prix_achat_piece":50000,"pieces_par_carton":20,"nom_unite_gros":"Jerricane","unité_détail":"Litre"}]', '54500000.00', 17, '2026-04-06 08:52:57', NULL, NULL, '54500000.00', 'facture', '0.00', '2026-04-03 21:00:00', '0.00'),
(3, 3, NULL, NULL, NULL, NULL, 'Fact-003', '2026-04-03 21:00:00', '[{"produit_id":1,"nom":"Vary stock","quantite":200,"prix":550000,"type_vente":"carton","unité":"sac","prix_carton":550000,"prix_piece":800,"prix_achat":500000,"prix_achat_piece":0,"pieces_par_carton":170,"nom_unite_gros":"sac","unité_détail":"kp"}]', '110000000.00', 17, '2026-04-06 08:56:56', NULL, NULL, '110000000.00', 'facture', '0.00', '2026-04-03 21:00:00', '110000000.00'),
(4, 4, NULL, NULL, NULL, NULL, 'Fact-004', '2026-04-03 21:00:00', '[{"produit_id":3,"nom":"THB","quantite":50,"prix":400000,"type_vente":"carton","unité":"Cageot","prix_carton":400000,"prix_piece":22500,"prix_achat":375000,"prix_achat_piece":0,"pieces_par_carton":20,"nom_unite_gros":"Cageot","unité_détail":"Bouteille"}]', '20000000.00', 17, '2026-04-06 09:00:11', NULL, NULL, '20000000.00', 'facture', '0.00', '2026-04-03 21:00:00', '0.00'),
(5, 2, NULL, NULL, NULL, NULL, 'Fact-005', '2026-04-03 21:00:00', '[{"produit_id":1,"nom":"Vary stock","quantite":0.5,"prix":500000,"type_vente":"carton","unité":"sac","prix_carton":500000,"prix_piece":800,"prix_achat":495000,"prix_achat_piece":2912,"pieces_par_carton":170,"nom_unite_gros":"sac","unité_détail":"kp"},{"produit_id":2,"nom":"MENAKA","quantite":10,"prix":55000,"type_vente":"piece","unité":"Litre","prix_carton":1000000,"prix_piece":55000,"prix_achat":950000,"prix_achat_piece":47500,"pieces_par_carton":20,"nom_unite_gros":"Jerricane","unité_détail":"Litre"}]', '800000.00', 17, '2026-04-06 09:16:52', NULL, NULL, '800000.00', 'facture', '0.00', '2026-04-03 21:00:00', '0.00'),
(6, 4, NULL, NULL, NULL, NULL, 'Fact-006', '2026-04-03 21:00:00', '[{"produit_id":2,"nom":"MENAKA","quantite":20,"prix":1000000,"type_vente":"carton","unité":"Jerricane","prix_carton":1000000,"prix_piece":55000,"prix_achat":950000,"prix_achat_piece":47500,"pieces_par_carton":20,"nom_unite_gros":"Jerricane","unité_détail":"Litre"},{"produit_id":2,"nom":"MENAKA","quantite":10,"prix":55000,"type_vente":"piece","unité":"Litre","prix_carton":1000000,"prix_piece":55000,"prix_achat":950000,"prix_achat_piece":47500,"pieces_par_carton":20,"nom_unite_gros":"Jerricane","unité_détail":"Litre"}]', '20550000.00', 17, '2026-04-06 09:31:52', NULL, NULL, '20550000.00', 'facture', '0.00', '2026-04-03 21:00:00', '0.00'),
(7, 1, NULL, NULL, NULL, NULL, 'Fact-007', '2026-04-03 21:00:00', '[{"produit_id":1,"nom":"Vary stock","quantite":148,"prix":500000,"type_vente":"carton","unité":"sac","prix_carton":500000,"prix_piece":800,"prix_achat":495000,"prix_achat_piece":2912,"pieces_par_carton":170,"nom_unite_gros":"sac","unité_détail":"kp"}]', '74000000.00', 17, '2026-04-06 09:37:52', NULL, NULL, '74000000.00', 'facture', '0.00', '2026-04-03 21:00:00', '0.00'),
(8, 3, NULL, NULL, NULL, NULL, 'Fact-008', '2026-04-03 21:00:00', '[{"produit_id":2,"nom":"MENAKA","quantite":10,"prix":950000,"type_vente":"carton","unité":"Jerricane","prix_carton":950000,"prix_piece":55000,"prix_achat":850000,"prix_achat_piece":42500,"pieces_par_carton":20,"nom_unite_gros":"Jerricane","unité_détail":"Litre"}]', '9500000.00', 17, '2026-04-06 10:10:11', NULL, NULL, '9500000.00', 'facture', '0.00', '2026-04-03 21:00:00', '9500000.00'),
(9, 1, NULL, NULL, NULL, NULL, 'Fact-009', '2026-04-03 21:00:00', '[{"produit_id":2,"nom":"MENAKA","quantite":24,"prix":950000,"type_vente":"carton","unité":"Jerricane","prix_carton":950000,"prix_piece":55000,"prix_achat":850000,"prix_achat_piece":42500,"pieces_par_carton":20,"nom_unite_gros":"Jerricane","unité_détail":"Litre"}]', '22800000.00', 17, '2026-04-06 10:13:03', NULL, NULL, '22800000.00', 'facture', '0.00', '2026-04-03 21:00:00', '22800000.00'),
(10, 3, NULL, NULL, NULL, NULL, 'Fact-010', '2026-04-03 21:00:00', '[{"produit_id":1,"nom":"Vary stock","quantite":1,"prix":500000,"type_vente":"carton","unité":"sac","prix_carton":500000,"prix_piece":800,"prix_achat":495000,"prix_achat_piece":2912,"pieces_par_carton":170,"nom_unite_gros":"sac","unité_détail":"kp"}]', '500000.00', 17, '2026-04-06 10:17:01', NULL, NULL, '500000.00', 'facture', '0.00', '2026-04-03 21:00:00', '500000.00');

-- Data for table `fournisseurs`
INSERT INTO `fournisseurs` (`id`, `nom`, `telephone`, `email`, `adresse`, `description`, `created_at`) VALUES
(1, 'STAR', '034 75 896 45', '', 'TAMATAVE', '', '2026-04-06 07:24:48'),
(2, 'STEVEN', '038 759 66', '', 'Antanakoro/Mananara', '', '2026-04-06 07:28:48'),
(3, 'SULONE', '', '', 'BAZAR BE TVE', '', '2026-04-06 07:29:07'),
(4, 'ANICET', '', '', 'Andatsadrano/Mananara', '', '2026-04-06 07:29:28');

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
(1, 'Vary stock', 'Stock Initial', '200.000', 500000, 550000, 'sac', 1, 1, '2026-04-06 08:43:37', 2, NULL, 0),
(2, 'MENAKA', 'Stock Initial', '40.000', 1000000, 1100000, 'Jerricane', 1, 2, '2026-04-06 08:45:29', 4, NULL, 0),
(3, 'THB', 'Stock Initial', '100.000', 375000, 400000, 'Cageot', 2, 3, '2026-04-06 08:46:32', 2, NULL, 0),
(4, 'MENAKA', 'Ajustement (+)', '25.000', 950000, 1100000, 'Jerricane', 1, 2, '2026-04-06 09:02:30', 4, NULL, 0),
(5, 'Vary stock', 'Approvisionnement', '150.000', 495000, 550000, 'sac', 1, 1, '2026-04-06 09:08:20', 3, NULL, 0),
(6, 'MENAKA', 'Ajustement (+)', '1.000', 900000, 1000000, 'Jerricane', 1, 2, '2026-04-06 10:02:18', 4, NULL, 0),
(7, 'MENAKA', 'Ajustement (+)', '29.000', 850000, 950000, 'Jerricane', 1, 2, '2026-04-06 10:04:30', 3, NULL, 0);

-- Data for table `produit_entrepot`
INSERT INTO `produit_entrepot` (`id`, `produit_id`, `entrepot_id`, `created_at`) VALUES
(1, 3, 1, '2026-04-06 10:26:56');

-- Data for table `produit_fournisseurs`
INSERT INTO `produit_fournisseurs` (`id`, `produit_id`, `fournisseur_id`, `created_at`) VALUES
(5, 1, 2, '2026-04-06 09:10:32'),
(6, 2, 3, '2026-04-06 10:03:58'),
(7, 3, 2, '2026-04-06 10:26:56');

-- Data for table `produits`
INSERT INTO `produits` (`id`, `nom`, `description`, `nom_unite_gros`, `quantite`, `prix`, `unité`, `category_id`, `pieces_par_carton`, `prix_carton`, `prix_piece`, `prix_achat`, `fournisseur_id`, `prix_achat_piece`, `stock_threshold`) VALUES
(1, 'Vary stock', 'Approvisionnement via Dépenses', 'sac', '85.000', 500000, 'kp', 1, 170, 500000, 800, 495000, 2, 2912, 100),
(2, 'MENAKA', 'Avy eny Inde', 'Jerricane', '0.000', 950000, 'Litre', 1, 20, 950000, 55000, 850000, 3, 42500, 20),
(3, 'THB', '', 'Cageot', '0.000', 400000, 'Bouteille', 2, 20, 400000, 22500, 375000, 2, 18750, 50);

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

-- Data for table `roles`
INSERT INTO `roles` (`id`, `nom`, `description`, `created_at`) VALUES
(1, 'SuperAdmin', 'Accès complet à toutes les fonctionnalités', '2026-04-04 14:29:39'),
(2, 'Admin', 'Accès administratif standard', '2026-04-04 14:29:39'),
(3, 'FACTURIER', 'Accueil client et facturation', '2026-04-06 07:18:28'),
(4, 'STOCK/PRODUIT', 'Fonction approvisionnement et stock', '2026-04-06 07:20:52');

-- Data for table `system_logs`
INSERT INTO `system_logs` (`id`, `user_id`, `action_type`, `entity_type`, `entity_id`, `old_value`, `new_value`, `description`, `created_at`) VALUES
(1, 17, 'reset', 'system', NULL, NULL, NULL, 'Réinitialisation complète de la base de données (hors utilisateurs)', '2026-04-06 08:30:28'),
(2, 17, 'add', 'produit', 1, NULL, '{"nom":"Vary stock","description":"Indonésie","stock_cartons":"200","stock_pieces":0,"prix_carton":"550000","prix_piece":"800","pieces_par_carton":"170","prix_achat":"500000","prix_achat_piece":0.029411764705882353,"unité":"kp","nom_unite_gros":"sac","category_id":1,"fournisseur_id":2,"fournisseur_ids":[2],"entrepot_ids":[],"importSourceId":null,"stock_threshold":"100","quantite":34000}', 'Création du produit: Vary stock', '2026-04-06 08:43:37'),
(3, 17, 'add', 'produit', 2, NULL, '{"nom":"MENAKA","description":"Avy eny Inde","stock_cartons":"40","stock_pieces":0,"prix_carton":"1100000","prix_piece":"60000","pieces_par_carton":"20","prix_achat":"1000000","prix_achat_piece":50000,"unité":"Litre","nom_unite_gros":"Jerricane","category_id":1,"fournisseur_id":4,"fournisseur_ids":[4],"entrepot_ids":[],"importSourceId":null,"stock_threshold":"20","quantite":800}', 'Création du produit: MENAKA', '2026-04-06 08:45:29'),
(4, 17, 'add', 'produit', 3, NULL, '{"nom":"THB","description":"","stock_cartons":"100","stock_pieces":0,"prix_carton":"400000","prix_piece":"22500","pieces_par_carton":"20","prix_achat":"375000","prix_achat_piece":0.15,"unité":"Bouteille","nom_unite_gros":"Cageot","category_id":2,"fournisseur_id":2,"fournisseur_ids":[2],"entrepot_ids":[],"importSourceId":null,"stock_threshold":"50","quantite":2000}', 'Création du produit: THB', '2026-04-06 08:46:32'),
(5, 17, 'add', 'depense', 1, NULL, '{"id":null,"nom":"Frais de transport TVE/MNR","montant":"600000","description":"Frais de transport marchandise (DYNASTY°","date":"2026-04-06","type":"depense","quantite":"","prix_achat":"","unite":"piece","fournisseur_id":2}', 'Création de la dépense: Frais de transport TVE/MNR (600000 FMG)', '2026-04-06 08:47:40'),
(6, 17, 'add', 'facture', 1, NULL, '{"client_id":2,"numero_facture":"","date_facture":"2026-04-06","liste_articles":[{"produit_id":2,"nom":"MENAKA","quantite":5,"prix":1100000,"type_vente":"carton","unité":"Jerricane","prix_carton":1100000,"prix_piece":60000,"prix_achat":1000000,"prix_achat_piece":50000,"pieces_par_carton":20,"nom_unite_gros":"Jerricane","unité_détail":"Litre"},{"produit_id":3,"nom":"THB","quantite":10,"prix":400000,"type_vente":"carton","unité":"Cageot","prix_carton":400000,"prix_piece":22500,"prix_achat":375000,"prix_achat_piece":0,"pieces_par_carton":20,"nom_unite_gros":"Cageot","unité_détail":"Bouteille"}],"prix_total":9500000,"Objet":null,"commentaire":null,"paiement":9500000,"isTempClient":false,"temp_client_nom":null,"temp_client_adresse":null,"temp_client_telephone":null,"temp_client_email":"","remise":"","created_by_id":17}', 'Création de la facture: Fact-001', '2026-04-06 08:48:38'),
(7, 17, 'add', 'facture', 2, NULL, '{"client_id":1,"numero_facture":"","date_facture":"2026-04-06","liste_articles":[{"produit_id":3,"nom":"THB","quantite":40,"prix":400000,"type_vente":"carton","unité":"Cageot","prix_carton":400000,"prix_piece":22500,"prix_achat":375000,"prix_achat_piece":0,"pieces_par_carton":20,"nom_unite_gros":"Cageot","unité_détail":"Bouteille"},{"produit_id":2,"nom":"MENAKA","quantite":35,"prix":1100000,"type_vente":"carton","unité":"Jerricane","prix_carton":1100000,"prix_piece":60000,"prix_achat":1000000,"prix_achat_piece":50000,"pieces_par_carton":20,"nom_unite_gros":"Jerricane","unité_détail":"Litre"}],"prix_total":54500000,"Objet":null,"commentaire":null,"paiement":54500000,"isTempClient":false,"temp_client_nom":null,"temp_client_adresse":null,"temp_client_telephone":null,"temp_client_email":"","remise":"","created_by_id":17}', 'Création de la facture: Fact-002', '2026-04-06 08:52:57'),
(8, 17, 'add', 'facture', 3, NULL, '{"client_id":3,"numero_facture":"","date_facture":"2026-04-06","liste_articles":[{"produit_id":1,"nom":"Vary stock","quantite":200,"prix":550000,"type_vente":"carton","unité":"sac","prix_carton":550000,"prix_piece":800,"prix_achat":500000,"prix_achat_piece":0,"pieces_par_carton":170,"nom_unite_gros":"sac","unité_détail":"kp"}],"prix_total":110000000,"Objet":null,"commentaire":null,"paiement":0,"isTempClient":false,"temp_client_nom":null,"temp_client_adresse":null,"temp_client_telephone":null,"temp_client_email":"","remise":"","created_by_id":17}', 'Création de la facture: Fact-003', '2026-04-06 08:56:56'),
(9, 17, 'add', 'facture', 4, NULL, '{"client_id":4,"numero_facture":"","date_facture":"2026-04-06","liste_articles":[{"produit_id":3,"nom":"THB","quantite":50,"prix":400000,"type_vente":"carton","unité":"Cageot","prix_carton":400000,"prix_piece":22500,"prix_achat":375000,"prix_achat_piece":0,"pieces_par_carton":20,"nom_unite_gros":"Cageot","unité_détail":"Bouteille"}],"prix_total":20000000,"Objet":null,"commentaire":null,"paiement":20000000,"isTempClient":false,"temp_client_nom":null,"temp_client_adresse":null,"temp_client_telephone":null,"temp_client_email":"","remise":"","created_by_id":17}', 'Création de la facture: Fact-004', '2026-04-06 09:00:11'),
(10, 17, 'update', 'produit', 2, NULL, '{"quantite":500,"rawQuantite":25,"prix_achat":950000,"unite":"Jerricane"}', 'Ajout de stock (+25 Jerricane) pour MENAKA', '2026-04-06 09:02:30'),
(11, 17, 'update', 'produit', 2, NULL, '{"nom":"MENAKA","description":"Avy eny Inde","stock_cartons":25,"stock_pieces":0,"prix_carton":"1000000","prix_piece":"55000","pieces_par_carton":20,"prix_achat":950000,"prix_achat_piece":47500,"unité":"Litre","nom_unite_gros":"Jerricane","category_id":1,"fournisseur_id":4,"fournisseur_ids":[4],"entrepot_ids":[],"stock_threshold":20,"quantite":500}', 'Mise à jour du produit: MENAKA', '2026-04-06 09:05:03'),
(12, 17, 'update', 'produit', 1, NULL, '{"nom":"Vary stock","description":"Approvisionnement via Dépenses","stock_cartons":150,"stock_pieces":0,"prix_carton":"500000","prix_piece":800,"pieces_par_carton":170,"prix_achat":495000,"prix_achat_piece":2912,"unité":"kp","nom_unite_gros":"sac","category_id":1,"fournisseur_id":2,"fournisseur_ids":[2],"entrepot_ids":[],"stock_threshold":100,"quantite":25500}', 'Mise à jour du produit: Vary stock', '2026-04-06 09:10:32'),
(13, 17, 'add', 'facture', 5, NULL, '{"client_id":2,"numero_facture":"","date_facture":"2026-04-06","liste_articles":[{"produit_id":1,"nom":"Vary stock","quantite":0.5,"prix":500000,"type_vente":"carton","unité":"sac","prix_carton":500000,"prix_piece":800,"prix_achat":495000,"prix_achat_piece":2912,"pieces_par_carton":170,"nom_unite_gros":"sac","unité_détail":"kp"},{"produit_id":2,"nom":"MENAKA","quantite":10,"prix":55000,"type_vente":"piece","unité":"Litre","prix_carton":1000000,"prix_piece":55000,"prix_achat":950000,"prix_achat_piece":47500,"pieces_par_carton":20,"nom_unite_gros":"Jerricane","unité_détail":"Litre"}],"prix_total":800000,"Objet":null,"commentaire":null,"paiement":800000,"isTempClient":false,"temp_client_nom":null,"temp_client_adresse":null,"temp_client_telephone":null,"temp_client_email":"","remise":"","created_by_id":17}', 'Création de la facture: Fact-005', '2026-04-06 09:16:52'),
(14, 17, 'add', 'facture', 6, NULL, '{"client_id":4,"numero_facture":"","date_facture":"2026-04-06","liste_articles":[{"produit_id":2,"nom":"MENAKA","quantite":20,"prix":1000000,"type_vente":"carton","unité":"Jerricane","prix_carton":1000000,"prix_piece":55000,"prix_achat":950000,"prix_achat_piece":47500,"pieces_par_carton":20,"nom_unite_gros":"Jerricane","unité_détail":"Litre"},{"produit_id":2,"nom":"MENAKA","quantite":10,"prix":55000,"type_vente":"piece","unité":"Litre","prix_carton":1000000,"prix_piece":55000,"prix_achat":950000,"prix_achat_piece":47500,"pieces_par_carton":20,"nom_unite_gros":"Jerricane","unité_détail":"Litre"}],"prix_total":20550000,"Objet":null,"commentaire":null,"paiement":20550000,"isTempClient":false,"temp_client_nom":null,"temp_client_adresse":null,"temp_client_telephone":null,"temp_client_email":"","remise":"","created_by_id":17}', 'Création de la facture: Fact-006', '2026-04-06 09:31:52'),
(15, 17, 'add', 'facture', 7, NULL, '{"client_id":1,"numero_facture":"","date_facture":"2026-04-06","liste_articles":[{"produit_id":1,"nom":"Vary stock","quantite":148,"prix":500000,"type_vente":"carton","unité":"sac","prix_carton":500000,"prix_piece":800,"prix_achat":495000,"prix_achat_piece":2912,"pieces_par_carton":170,"nom_unite_gros":"sac","unité_détail":"kp"}],"prix_total":74000000,"Objet":null,"commentaire":null,"paiement":74000000,"isTempClient":false,"temp_client_nom":null,"temp_client_adresse":null,"temp_client_telephone":null,"temp_client_email":"","remise":"","created_by_id":17}', 'Création de la facture: Fact-007', '2026-04-06 09:37:52'),
(16, 17, 'update', 'produit', 2, NULL, '{"quantite":20,"rawQuantite":1,"prix_achat":900000,"unite":"Jerricane"}', 'Ajout de stock (+1 Jerricane) pour MENAKA', '2026-04-06 10:02:18'),
(17, 17, 'update', 'produit', 2, NULL, '{"nom":"MENAKA","description":"Avy eny Inde","stock_cartons":5,"stock_pieces":0,"prix_carton":"950000","prix_piece":55000,"pieces_par_carton":20,"prix_achat":"850000","prix_achat_piece":45000,"unité":"Litre","nom_unite_gros":"Jerricane","category_id":1,"fournisseur_id":3,"fournisseur_ids":[3],"entrepot_ids":[],"stock_threshold":20,"quantite":100}', 'Mise à jour du produit: MENAKA', '2026-04-06 10:03:58'),
(18, 17, 'update', 'produit', 2, NULL, '{"quantite":580,"rawQuantite":29,"prix_achat":850000,"unite":"Jerricane"}', 'Ajout de stock (+29 Jerricane) pour MENAKA', '2026-04-06 10:04:30'),
(19, 17, 'add', 'facture', 8, NULL, '{"client_id":3,"numero_facture":"","date_facture":"2026-04-06","liste_articles":[{"produit_id":2,"nom":"MENAKA","quantite":10,"prix":950000,"type_vente":"carton","unité":"Jerricane","prix_carton":950000,"prix_piece":55000,"prix_achat":850000,"prix_achat_piece":42500,"pieces_par_carton":20,"nom_unite_gros":"Jerricane","unité_détail":"Litre"}],"prix_total":9500000,"Objet":null,"commentaire":null,"paiement":0,"isTempClient":false,"temp_client_nom":null,"temp_client_adresse":null,"temp_client_telephone":null,"temp_client_email":"","remise":"","created_by_id":17}', 'Création de la facture: Fact-008', '2026-04-06 10:10:11'),
(20, 17, 'add', 'facture', 9, NULL, '{"client_id":1,"numero_facture":"","date_facture":"2026-04-06","liste_articles":[{"produit_id":2,"nom":"MENAKA","quantite":24,"prix":950000,"type_vente":"carton","unité":"Jerricane","prix_carton":950000,"prix_piece":55000,"prix_achat":850000,"prix_achat_piece":42500,"pieces_par_carton":20,"nom_unite_gros":"Jerricane","unité_détail":"Litre"}],"prix_total":22800000,"Objet":null,"commentaire":null,"paiement":0,"isTempClient":false,"temp_client_nom":null,"temp_client_adresse":null,"temp_client_telephone":null,"temp_client_email":"","remise":"","created_by_id":17}', 'Création de la facture: Fact-009', '2026-04-06 10:13:03'),
(21, 17, 'add', 'facture', 10, NULL, '{"client_id":3,"numero_facture":"","date_facture":"2026-04-06","liste_articles":[{"produit_id":1,"nom":"Vary stock","quantite":1,"prix":500000,"type_vente":"carton","unité":"sac","prix_carton":500000,"prix_piece":800,"prix_achat":495000,"prix_achat_piece":2912,"pieces_par_carton":170,"nom_unite_gros":"sac","unité_détail":"kp"}],"prix_total":500000,"Objet":null,"commentaire":null,"paiement":0,"isTempClient":false,"temp_client_nom":null,"temp_client_adresse":null,"temp_client_telephone":null,"temp_client_email":null,"status":"proforma","remise":0,"created_by_id":17}', 'Création de la proforma: Fact-010', '2026-04-06 10:17:01'),
(22, 17, 'add', 'entrepot', 1, NULL, '{"nom":"MAGASIN SOA","type":"magasin","description":"Point de vente principal et de stockage"}', 'Création de l''entrepôt: MAGASIN SOA', '2026-04-06 10:26:04'),
(23, 17, 'update', 'produit', 3, NULL, '{"nom":"THB","description":"","stock_cartons":0,"stock_pieces":0,"prix_carton":400000,"prix_piece":22500,"pieces_par_carton":20,"prix_achat":375000,"prix_achat_piece":18750,"unité":"Bouteille","nom_unite_gros":"Cageot","category_id":2,"fournisseur_id":2,"fournisseur_ids":[2],"entrepot_ids":[1],"stock_threshold":50,"quantite":0}', 'Mise à jour du produit: THB', '2026-04-06 10:26:56'),
(24, 17, 'add', 'depense', 2, NULL, '{"id":null,"nom":"Salaire Chauffeur Jeannot (Février)","montant":"300000","description":"","date":"2026-04-06","type":"depense","quantite":"","prix_achat":"","unite":"piece","fournisseur_id":""}', 'Création de la dépense: Salaire Chauffeur Jeannot (Février) (300000 FMG)', '2026-04-06 10:30:15'),
(25, 17, 'add', 'depense', 3, NULL, '{"id":null,"nom":"JIRAMA","montant":"120000","description":"Mars","date":"2026-04-06","type":"depense","quantite":"","prix_achat":"","unite":"piece","fournisseur_id":""}', 'Création de la dépense: JIRAMA (120000 FMG)', '2026-04-06 10:31:07'),
(26, 17, 'backup', 'system', NULL, NULL, NULL, 'Exportation de la base de données: backup_ge_2026-04-06T14-16-08.sql', '2026-04-06 11:16:08'),
(27, 17, 'backup', 'system', NULL, NULL, NULL, 'Exportation de la base de données: backup_ge_2026-04-06T14-36-35.sql', '2026-04-06 11:36:35');

-- Data for table `users`
INSERT INTO `users` (`id`, `nom`, `prenom`, `email`, `mdp`, `role`, `image`, `created_at`, `validated`, `role_id`) VALUES
(17, 'Ravomanana', 'Brandon Fidelin', 'brandonravomanana.v@gmail.com', '$2b$10$0Bz7Hvz2B6K60g8/9KooHeCqiGPbF1A20kHkzWt8aqhprkPBNV3Ra', 'SuperAdmin', NULL, '2026-03-23 14:43:28', 1, 1),
(23, 'LOU', 'THIERRY', 'thierrylou@gmail.com', '$2b$10$0ovJjUnlURz6Z3JQ9Aq.ruK6F8oTi/Gnd97qo8hzSPNDAjFJ7kvU.', 'Admin', NULL, '2026-04-06 07:15:46', 1, 2),
(24, 'GERMAINE', 'SOA', 'germainesoa@gmail.com', '$2b$10$4Mwj.wHpXbRd7Pv8BoUAweqzEhCynXimPJe16XLavm8op6XwjKAqq', 'Admin', NULL, '2026-04-06 07:22:16', 1, 4);


SET FOREIGN_KEY_CHECKS = 1;
