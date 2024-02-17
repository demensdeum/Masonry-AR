-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Feb 17, 2024 at 11:15 AM
-- Server version: 11.2.2-MariaDB
-- PHP Version: 8.3.2

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `masonry_ar`
--

-- --------------------------------------------------------

--
-- Table structure for table `entities`
--

CREATE TABLE `entities` (
  `id` int(11) NOT NULL,
  `uuid` uuid NOT NULL DEFAULT uuid(),
  `type` varchar(255) NOT NULL,
  `balance` int(11) NOT NULL DEFAULT 0,
  `latitude` float NOT NULL,
  `longitude` float NOT NULL,
  `creation_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `update_date` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `entities`
--

INSERT INTO `entities` (`id`, `uuid`, `type`, `balance`, `latitude`, `longitude`, `creation_date`, `update_date`) VALUES
(691, '814bbcc7-c817-11ee-9e89-05e5718441bb', 'hero', 2725600, 55.7588, 37.6178, '2024-02-10 13:22:56', '2024-02-10 15:29:46'),
(733, 'ae717ce8-c827-11ee-9e89-05e5718441bb', 'hero', 0, 0, 0, '2024-02-10 15:18:44', '2024-02-10 15:29:46'),
(737, '02e4447a-c828-11ee-9e89-05e5718441bb', 'hero', 242800, 53.196, 50.1704, '2024-02-10 15:21:06', '2024-02-10 15:48:44'),
(752, 'f33a55f6-c829-11ee-9e89-05e5718441bb', 'hero', 132200, 53.195, 50.1714, '2024-02-10 15:34:59', '2024-02-10 15:57:54'),
(808, '9d73f8f1-c82d-11ee-9e89-05e5718441bb', 'hero', 71700, 55.7588, 37.6178, '2024-02-10 16:01:13', '2024-02-10 16:01:13'),
(838, 'f5236a77-c980-11ee-9668-ed80b7185254', 'hero', 142800, 53.195, 50.1714, '2024-02-12 08:30:20', '2024-02-12 08:30:20'),
(912, '32d0343f-cd7c-11ee-92b9-e251efbad707', 'hero', 2700, 55.7588, 37.6173, '2024-02-17 10:23:13', '2024-02-17 10:23:13'),
(925, 'b5d8941c-cd7c-11ee-92b9-e251efbad707', 'eye', 300, 54.7553, 37.6176, '2024-02-17 10:26:52', '2024-02-17 10:26:52'),
(926, 'b5d975f9-cd7c-11ee-92b9-e251efbad707', 'eye', 200, 54.756, 37.6178, '2024-02-17 10:26:52', '2024-02-17 10:26:52'),
(927, 'bbdcda8b-cd7c-11ee-92b9-e251efbad707', 'eye', 100, 35.6888, 139.692, '2024-02-17 10:27:03', '2024-02-17 10:27:03'),
(928, 'bbdd7c33-cd7c-11ee-92b9-e251efbad707', 'eye', 300, 35.6897, 139.691, '2024-02-17 10:27:03', '2024-02-17 10:27:03'),
(929, 'bbde189a-cd7c-11ee-92b9-e251efbad707', 'eye', 100, 35.6889, 139.692, '2024-02-17 10:27:03', '2024-02-17 10:27:03'),
(930, 'd2f1cc51-cd7c-11ee-92b9-e251efbad707', 'building', 1000, 55.7508, 37.6173, '2024-02-17 10:27:41', '2024-02-17 10:27:41'),
(1013, '23e94252-cd83-11ee-92b9-e251efbad707', 'eye', 200, 53.1952, 50.1716, '2024-02-17 11:12:54', '2024-02-17 11:12:54');

-- --------------------------------------------------------

--
-- Table structure for table `info`
--

CREATE TABLE `info` (
  `schema_version` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `info`
--

INSERT INTO `info` (`schema_version`) VALUES
(1);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `entities`
--
ALTER TABLE `entities`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uuid` (`uuid`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `entities`
--
ALTER TABLE `entities`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1014;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
