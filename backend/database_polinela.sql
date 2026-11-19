-- phpMyAdmin SQL Dump
-- Database: `kunjungan_edukasi_polinela`

CREATE DATABASE IF NOT EXISTS `polinela_db`;
USE `polinela_db`;

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

-- --------------------------------------------------------

-- Table structure for table `Roles`
CREATE TABLE `Roles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `Roles` (`id`, `name`, `description`, `createdAt`, `updatedAt`) VALUES
(1, 'ADMIN_PENGELOLA', 'Admin Pengelola Kunjungan', NOW(), NOW()),
(2, 'ADMIN_PEMBAYARAN', 'Admin Verifikasi Pembayaran', NOW(), NOW()),
(3, 'USER', 'Pengunjung', NOW(), NOW());

-- --------------------------------------------------------

-- Table structure for table `Users`
CREATE TABLE `Users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `roleId` int(11) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `roleId` (`roleId`),
  CONSTRAINT `Users_ibfk_1` FOREIGN KEY (`roleId`) REFERENCES `Roles` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Password for demo users is 'password123'
INSERT INTO `Users` (`id`, `name`, `email`, `password`, `roleId`, `createdAt`, `updatedAt`) VALUES
(1, 'Admin Pengelola', 'pengelola@demo.com', '$2b$10$T2m46YwM2c.Cq7Bv9KqNLuE/.c2Zq5cZ3cK4w.p.L/4G.8.c1Zc.O', 1, NOW(), NOW()),
(2, 'Admin Pembayaran', 'pembayaran@demo.com', '$2b$10$T2m46YwM2c.Cq7Bv9KqNLuE/.c2Zq5cZ3cK4w.p.L/4G.8.c1Zc.O', 2, NOW(), NOW()),
(3, 'Pengunjung Demo', 'pengunjung@demo.com', '$2b$10$T2m46YwM2c.Cq7Bv9KqNLuE/.c2Zq5cZ3cK4w.p.L/4G.8.c1Zc.O', 3, NOW(), NOW());

-- --------------------------------------------------------

-- Table structure for table `EducationalPackages`
CREATE TABLE `EducationalPackages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `slug` varchar(255) DEFAULT NULL,
  `category` varchar(255) DEFAULT NULL,
  `shortDescription` text DEFAULT NULL,
  `description` text DEFAULT NULL,
  `duration` varchar(255) DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  `minParticipants` int(11) DEFAULT NULL,
  `facilities` text DEFAULT NULL,
  `isActive` tinyint(1) DEFAULT 1,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `EducationalPackages` (`id`, `name`, `slug`, `category`, `shortDescription`, `description`, `duration`, `price`, `minParticipants`, `facilities`, `isActive`, `createdAt`, `updatedAt`) VALUES
(1, 'Panen Sayur', 'panen-sayur', 'Pertanian', 'Kegiatan memanen sayuran segar langsung dari kebun.', 'Anak-anak diajarkan memanen sayuran dari kebun Polinela.', '90 Menit', '35000.00', 10, 'Topi petani, sayuran hasil panen, air minum', 1, NOW(), NOW()),
(2, 'Menanam Padi di Sawah', 'menanam-padi', 'Pertanian', 'Pengalaman turun ke sawah dan menanam padi secara tradisional.', 'Pengalaman menanam padi di lahan sawah percobaan.', '120 Menit', '45000.00', 15, 'Area cuci, bibit padi, makanan ringan', 1, NOW(), NOW()),
(3, 'Menangkap Ikan', 'menangkap-ikan', 'Perikanan', 'Belajar menangkap ikan di kolam budidaya perikanan.', 'Diajarkan cara menangkap ikan di kolam.', '90 Menit', '35000.00', 10, 'Jaring ikan, tangkapan, tempat cuci', 1, NOW(), NOW()),
(4, 'Pembuatan Roti', 'pembuatan-roti', 'Keterampilan', 'Workshop pembuatan roti dari adonan hingga matang.', 'Belajar membuat roti di pengolahan pangan.', '120 Menit', '50000.00', 15, 'Bahan roti, celemek, roti buatan sendiri', 1, NOW(), NOW());

-- --------------------------------------------------------

-- Table structure for table `PackageMedia`
CREATE TABLE `PackageMedia` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `packageId` int(11) DEFAULT NULL,
  `type` varchar(255) DEFAULT NULL,
  `url` varchar(255) DEFAULT NULL,
  `caption` varchar(255) DEFAULT NULL,
  `isPrimary` tinyint(1) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `packageId` (`packageId`),
  CONSTRAINT `PackageMedia_ibfk_1` FOREIGN KEY (`packageId`) REFERENCES `EducationalPackages` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

-- Table structure for table `Bookings`
CREATE TABLE `Bookings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `bookingNumber` varchar(255) DEFAULT NULL,
  `visitorName` varchar(255) DEFAULT NULL,
  `picName` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `visitorType` varchar(255) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `participantCount` int(11) DEFAULT NULL,
  `ageRange` varchar(255) DEFAULT NULL,
  `visitDate` date DEFAULT NULL,
  `visitTime` varchar(255) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `status` varchar(255) DEFAULT 'MENUNGGU PERSETUJUAN',
  `totalAmount` decimal(10,2) DEFAULT NULL,
  `userId` int(11) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `userId` (`userId`),
  CONSTRAINT `Bookings_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `Users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

-- Table structure for table `BookingItems`
CREATE TABLE `BookingItems` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `bookingId` int(11) DEFAULT NULL,
  `packageId` int(11) DEFAULT NULL,
  `quantity` int(11) DEFAULT NULL,
  `priceAtBooking` decimal(10,2) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `bookingId` (`bookingId`),
  KEY `packageId` (`packageId`),
  CONSTRAINT `BookingItems_ibfk_1` FOREIGN KEY (`bookingId`) REFERENCES `Bookings` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `BookingItems_ibfk_2` FOREIGN KEY (`packageId`) REFERENCES `EducationalPackages` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

-- Table structure for table `BookingStatusHistories`
CREATE TABLE `BookingStatusHistories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `bookingId` int(11) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `changedById` int(11) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `bookingId` (`bookingId`),
  KEY `changedById` (`changedById`),
  CONSTRAINT `BookingStatusHistories_ibfk_1` FOREIGN KEY (`bookingId`) REFERENCES `Bookings` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `BookingStatusHistories_ibfk_2` FOREIGN KEY (`changedById`) REFERENCES `Users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

-- Table structure for table `Payments`
CREATE TABLE `Payments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `bookingId` int(11) DEFAULT NULL,
  `amount` decimal(10,2) DEFAULT NULL,
  `method` varchar(255) DEFAULT NULL,
  `vaNumber` varchar(255) DEFAULT NULL,
  `proofUrl` varchar(255) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `verifiedById` int(11) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `bookingId` (`bookingId`),
  KEY `verifiedById` (`verifiedById`),
  CONSTRAINT `Payments_ibfk_1` FOREIGN KEY (`bookingId`) REFERENCES `Bookings` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `Payments_ibfk_2` FOREIGN KEY (`verifiedById`) REFERENCES `Users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

-- Table structure for table `PaymentSettings`
CREATE TABLE `PaymentSettings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `bankName` varchar(255) DEFAULT NULL,
  `accountName` varchar(255) DEFAULT NULL,
  `accountNumber` varchar(255) DEFAULT NULL,
  `isActive` tinyint(1) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `PaymentSettings` (`id`, `bankName`, `accountName`, `accountNumber`, `isActive`, `createdAt`, `updatedAt`) VALUES
(1, 'Bank BRI', 'BLU POLINELA (DEMO)', '0000-1111-2222-3333', 1, NOW(), NOW());

COMMIT;
