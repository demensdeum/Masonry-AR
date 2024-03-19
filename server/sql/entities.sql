-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Mar 19, 2024 at 10:17 PM
-- Server version: 11.3.2-MariaDB
-- PHP Version: 8.3.4

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
  `private_uuid` varchar(36) NOT NULL DEFAULT 'NONE',
  `uuid` varchar(36) NOT NULL DEFAULT 'NONE',
  `name` varchar(32) NOT NULL DEFAULT 'NONE',
  `owner_uuid` varchar(36) NOT NULL DEFAULT 'NONE',
  `masonic_order` varchar(32) NOT NULL DEFAULT 'NONE',
  `type` varchar(256) NOT NULL,
  `model` varchar(32) NOT NULL DEFAULT 'DEFAULT',
  `balance` int(11) NOT NULL DEFAULT 0,
  `latitude` float NOT NULL,
  `longitude` float NOT NULL,
  `creation_date` datetime NOT NULL DEFAULT utc_timestamp(),
  `update_date` datetime NOT NULL DEFAULT utc_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1999;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
