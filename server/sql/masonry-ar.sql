SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;

CREATE TABLE `destroyed_buildings_counter` (
  `id` int(11) NOT NULL,
  `destroyer_uuid` varchar(36) NOT NULL DEFAULT 'NONE',
  `counter` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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

CREATE TABLE `info` (
  `id` int(11) NOT NULL,
  `key` varchar(32) NOT NULL DEFAULT 'NONE',
  `value` varchar(256) NOT NULL DEFAULT 'NONE'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `info` (`id`, `key`, `value`) VALUES
(1, 'minimal_client_version', '6'),
(2, 'scheme_version', '6');


ALTER TABLE `destroyed_buildings_counter`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `entities`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uuid` (`uuid`);

ALTER TABLE `info`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `id` (`id`),
  ADD UNIQUE KEY `key` (`key`);


ALTER TABLE `destroyed_buildings_counter`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

ALTER TABLE `entities`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3816;

ALTER TABLE `info`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;
COMMIT;
 
