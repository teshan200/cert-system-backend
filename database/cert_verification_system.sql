-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jan 04, 2026 at 05:26 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `cert_verification_system`
--

-- --------------------------------------------------------

--
-- Table structure for table `admins`
--

CREATE TABLE `admins` (
  `admin_id` varchar(50) NOT NULL,
  `username` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `admins`
--

INSERT INTO `admins` (`admin_id`, `username`, `password_hash`, `email`, `created_at`) VALUES
('ADMIN001', 'admin', '$2b$10$h9r0nTELEDiVGsMrMBbLz.7cxkcjPzGf3UhQs2YaCDeTeE5Jqofbm', '', '2025-12-30 16:49:37');

-- --------------------------------------------------------

--
-- Table structure for table `career_paths`
--

CREATE TABLE `career_paths` (
  `analysis_id` int(11) NOT NULL,
  `user_id` varchar(50) NOT NULL,
  `career_suggestions` text DEFAULT NULL,
  `skills_identified` text DEFAULT NULL,
  `recommended_courses` text DEFAULT NULL,
  `summary` text DEFAULT NULL,
  `generated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `certificates`
--

CREATE TABLE `certificates` (
  `certificate_id` varchar(100) NOT NULL,
  `user_id` varchar(50) NOT NULL,
  `institute_id` varchar(50) NOT NULL,
  `certificate_title` varchar(255) NOT NULL,
  `course` varchar(255) NOT NULL,
  `issued_date` date NOT NULL,
  `expiry_date` date DEFAULT NULL,
  `grade` varchar(50) DEFAULT NULL,
  `blockchain_tx_hash` varchar(66) DEFAULT NULL,
  `blockchain_verified` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `certificates`
--

INSERT INTO `certificates` (`certificate_id`, `user_id`, `institute_id`, `certificate_title`, `course`, `issued_date`, `expiry_date`, `grade`, `blockchain_tx_hash`, `blockchain_verified`, `created_at`) VALUES
('CERT-1767513869898-uznfzq', 'STU1767111357598SLYMS', 'INST17671120873319ab75733', 'Advanced Web Development', 'Advanced Web Development', '2026-01-04', NULL, 'A+', '0x36c6e37e593da377c32a58f43df2fb8b6f9a8559f83cdb044a2caa6c1519d68a', 0, '2026-01-04 08:04:41'),
('CERT1767112318082897e4dcd', 'STU1767111357598SLYMS', 'INST17671120873319ab75733', 'Test Course', 'Test Course', '2025-12-30', NULL, 'A', 'pending_blockchain', 0, '2025-12-30 16:31:58'),
('CERT17671125087922cc8dbaf', 'STU1767112420122EUU0M', 'INST17671120873319ab75733', 'Computer Science', 'Computer Science', '2025-12-30', NULL, 'A', 'pending_blockchain', 0, '2025-12-30 16:35:08'),
('CERT1767112820218a3a73R36F', 'STU1767111357598SLYMS', 'INST17671120873319ab75733', 'Computer Science', 'Computer Science', '2025-12-30', NULL, 'A', 'pending_blockchain', 0, '2025-12-30 16:40:20'),
('CERT176711282022893f3CC2B3', 'STU1767112420122EUU0M', 'INST17671120873319ab75733', 'Data Science', 'Data Science', '2025-12-30', NULL, 'A+', 'pending_blockchain', 0, '2025-12-30 16:40:20'),
('CERT1767181570554c32bJHWEM', 'STU1767111357598SLYMS', 'INST17671120873319ab75733', 'Computer Science', 'Computer Science', '2025-12-31', NULL, 'A', 'pending_blockchain', 0, '2025-12-31 11:46:10'),
('CERT17671815705697f8dHSH1S', 'STU1767112420122EUU0M', 'INST17671120873319ab75733', 'Data Science', 'Data Science', '2025-12-31', NULL, 'A+', 'pending_blockchain', 0, '2025-12-31 11:46:10'),
('CERT176744441158983fbc9fd', 'STU1767111357598SLYMS', 'INST17671120873319ab75733', 'Blockchain', 'Blockchain', '2026-01-03', NULL, '85', NULL, 0, '2026-01-03 12:47:01'),
('CERT176744490972123018a6a', 'STU1767111357598SLYMS', 'INST17671120873319ab75733', 'Blockchain 2', 'Blockchain 2', '2026-01-03', NULL, 'A', NULL, 0, '2026-01-03 12:55:23'),
('CERT1767445363781f17bf202', 'STU1767111357598SLYMS', 'INST17671120873319ab75733', 'Course No 1', 'Course No 1', '2026-01-03', NULL, 'A+', '0x995b45614d650a179928f3256403aaf9db1995258e9c2e58233ad29f60180e37', 0, '2026-01-03 13:02:56'),
('CERT176744601084795e7473c', 'STU1767111357598SLYMS', 'INST17671120873319ab75733', 'Course No 2', 'Course No 2', '2026-01-03', NULL, 'B', '0xfd22a2f37858a335fd4ddc41a5b3cc335c1adcb094758bc35cc9fab5fbc76285', 0, '2026-01-03 13:13:44'),
('CERT1767446642871f5b8280a', 'STU1767111357598SLYMS', 'INST17671120873319ab75733', 'Blockchain 3', 'Blockchain 3', '2026-01-03', NULL, 'C', '0xc3846a3a28e5612bbf28f0cf8a33971ce144a79ebdfc2887e40a515c2bb7a570', 0, '2026-01-03 13:24:16'),
('CERT17674480015549145a45b', 'STU1767111357598SLYMS', 'INST17671120873319ab75733', 'sdfghgf', 'sdfghgf', '2026-01-03', NULL, 'g', '0x60dc61a590ea8abb5f9f5ab6d7ad07acafe4aaa65b53b33a1bcb95359e1dfdd0', 0, '2026-01-03 13:47:06'),
('CERT17674484759446b62dea3', 'STU1767111357598SLYMS', 'INST17671120873319ab75733', 'Advanced Blockchain Development', 'Advanced Blockchain Development', '2026-01-03', NULL, 'A+', '0xbbdcf9a6a9b5438aef69fb0d42893a8756dd496e9308e695e6bf340dc505ac90', 0, '2026-01-03 13:54:58'),
('CERT17674484985925f94b8b0', 'STU1767111357598SLYMS', 'INST17671120873319ab75733', 'Smart Contract Security', 'Smart Contract Security', '2026-01-03', NULL, 'A', '0x59ba076dadc8a36970304a1a503a84b74ede3a5480d6e98a1a57345153a4b5c8', 0, '2026-01-03 13:55:20'),
('CERT1767448521017fb9fd9d9', 'STU1767112420122EUU0M', 'INST17671120873319ab75733', 'Web3 Programming', 'Web3 Programming', '2026-01-03', NULL, 'A+', '0x129b59bbec55551f9e1a592afb752a911ad3e35eec1e9c873cf8fd8b7f7e68d2', 0, '2026-01-03 13:55:42'),
('CERT17674485425977f1e7dc3', 'STU1767112420122EUU0M', 'INST17671120873319ab75733', 'Decentralized Applications', 'Decentralized Applications', '2026-01-03', NULL, 'A', '0x2cefcd7b4e8c0424e6f133a932ef9994483e8663884de12bd9ed1ad9a0168060', 0, '2026-01-03 13:56:03'),
('CERT176744856399419700e49', 'STU1767112420122EUU0M', 'INST17671120873319ab75733', 'Cryptocurrency Fundamentals', 'Cryptocurrency Fundamentals', '2026-01-03', NULL, 'B+', '0x1a6951b41a57ef3f49b95ba1e72e76cd729616539573a7df7911db7329d3056e', 0, '2026-01-03 13:56:23'),
('CERT1767504012985cb72a5de', 'STU1767111357598SLYMS', 'INST17671120873319ab75733', 'fghhgfd', 'fghhgfd', '2026-01-04', NULL, 'A', '0xd91de44e286d79439d83289fc47401482b959a30607a319aa8eb52822db95c9d', 0, '2026-01-04 05:20:25'),
('CERT176750852919971f9d00f', 'STU1767111357598SLYMS', 'INST17671120873319ab75733', 'Test Course', 'Test Course', '2026-01-04', NULL, 'A', '0x666ed8e306d464ed11dfd8720fac56ebd6c71ac0e94339370c2c598cd0555465', 0, '2026-01-04 06:35:40'),
('CERT17675129587593c1eabe2', 'STU1767111357598SLYMS', 'INST17671120873319ab75733', 'Test Course', 'Test Course', '2026-01-04', NULL, 'V', '0xf71b5ae230143f11bf14648fff0e31496a5575bf0af2f88f8efdff059ac4b745', 0, '2026-01-04 07:49:34'),
('CERT17675150729460', 'STU1767111357598SLYMS', 'INST17671120873319ab75733', 'Advanced Web Development', 'Advanced Web Development', '2026-01-04', NULL, 'A+', '0x47d5c2b80f562ba790157cc1fa0b9e745a1846175a8c198001e9da1e98182d79', 0, '2026-01-04 08:24:44'),
('CERT17675150729461', 'STU1767111357598SLYMS', 'INST17671120873319ab75733', 'Blockchain Fundamentals', 'Blockchain Fundamentals', '2026-01-04', NULL, 'A', '0x4ae744f5374e1d3e9a9a339274d06b0f184c7c5933db4d7be905d3bd635886c6', 0, '2026-01-04 08:24:52'),
('CERT17675435077990', 'STU1767111357598SLYMS', 'INST17671120873319ab75733', 'Advanced Web Development', 'Advanced Web Development', '2026-01-04', NULL, 'A+', '0x866268ade2ca4a32368fd6be66bc096bff2ae8e741ca23e68bee9e2955fa04fc', 0, '2026-01-04 16:18:39'),
('CERT17675435077991', 'STU1767111357598SLYMS', 'INST17671120873319ab75733', 'Blockchain Fundamentals', 'Blockchain Fundamentals', '2026-01-04', NULL, 'A', '0x051a2adac6c5cab626935e5ff1476359f2b6af4aac279b0967f4c43bfaef7ab9', 0, '2026-01-04 16:18:46'),
('CERT1767543538630abceb1ae', 'STU1767112420122EUU0M', 'INST17671120873319ab75733', 'Blockchain', 'Blockchain', '2026-01-04', NULL, 'C', '0xd5bcd7a7b28bcf253599684a88b9098a7378d670b46e64676bb8adb93c02f0a3', 0, '2026-01-04 16:19:16');

-- --------------------------------------------------------

--
-- Table structure for table `institutes`
--

CREATE TABLE `institutes` (
  `institute_id` varchar(50) NOT NULL,
  `institute_name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `wallet_address` varchar(42) NOT NULL,
  `email_verified` tinyint(1) DEFAULT 0,
  `email_verification_token` varchar(64) DEFAULT NULL,
  `email_verification_expires` datetime DEFAULT NULL,
  `verification_status` enum('pending','approved','rejected') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `institutes`
--

INSERT INTO `institutes` (`institute_id`, `institute_name`, `email`, `password_hash`, `wallet_address`, `verification_status`, `created_at`, `updated_at`) VALUES
('INST17671120873319ab75733', 'University Of ABC', 'uniabc@gmail.com', '$2a$10$Xl9NqR7GBemI13jkOCAeu.vU7Gs6TAlmSVYLS99MsqA6FafY6COx.', '0xbd6909eDBfcD0385b2bDe2D7F92979E40eaE23B7', 'approved', '2025-12-30 16:28:07', '2026-01-03 08:17:28'),
('INST1767113486977eb7987a6', 'University Of ABCD', 'abcd@uni.com', '$2b$10$9L33j5mUw5gNucyTkTHdIOGl6VkFlABnOCTatHMpUmO3.D5qV0coq', '0xbd6909eDBfcD0385b2bDe2D8F92979E40eaE23B7', 'rejected', '2025-12-30 16:51:26', '2026-01-03 08:04:15'),
('INST1767458432529dcbd19f5', 'University Of Test', 'unitest@mail.com', '$2b$10$9w/yOnpcOU0/4ULKAFP.j.VXfqLC2Z28b0Z9dNz4Daug7TE4GKbGG', '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', 'approved', '2026-01-03 16:40:32', '2026-01-03 16:42:00');

-- --------------------------------------------------------

--
-- Table structure for table `students`
--

CREATE TABLE `students` (
  `user_id` varchar(50) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `gender` enum('Male','Female','Other') NOT NULL,
  `birthdate` date NOT NULL,
  `email_verified` tinyint(1) DEFAULT 0,
  `email_verification_token` varchar(64) DEFAULT NULL,
  `email_verification_expires` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `students`
--

INSERT INTO `students` (`user_id`, `full_name`, `email`, `password_hash`, `gender`, `birthdate`, `created_at`, `updated_at`) VALUES
('STU1767111357598SLYMS', 'Test User', 'test@mail.com', '$2a$10$Xl9NqR7GBemI13jkOCAeu.vU7Gs6TAlmSVYLS99MsqA6FafY6COx.', 'Male', '2025-12-30', '2025-12-30 16:15:57', '2026-01-03 08:30:21'),
('STU1767112420122EUU0M', 'Sample Student', 'sample@mail.com', '$2a$10$Xl9NqR7GBemI13jkOCAeu.vU7Gs6TAlmSVYLS99MsqA6FafY6COx.', 'Male', '2025-12-30', '2025-12-30 16:33:40', '2026-01-03 08:30:25');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admins`
--
ALTER TABLE `admins`
  ADD PRIMARY KEY (`admin_id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `career_paths`
--
ALTER TABLE `career_paths`
  ADD PRIMARY KEY (`analysis_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `certificates`
--
ALTER TABLE `certificates`
  ADD PRIMARY KEY (`certificate_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_institute_id` (`institute_id`),
  ADD KEY `idx_certificate_id` (`certificate_id`),
  ADD KEY `idx_certificate_blockchain` (`blockchain_tx_hash`);

--
-- Indexes for table `institutes`
--
ALTER TABLE `institutes`
  ADD PRIMARY KEY (`institute_id`),
  ADD UNIQUE KEY `wallet_address` (`wallet_address`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_institute_wallet` (`wallet_address`);

--
-- Indexes for table `students`
--
ALTER TABLE `students`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_student_email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `career_paths`
--
ALTER TABLE `career_paths`
  MODIFY `analysis_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `career_paths`
--
ALTER TABLE `career_paths`
  ADD CONSTRAINT `career_paths_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `students` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `certificates`
--
ALTER TABLE `certificates`
  ADD CONSTRAINT `certificates_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `students` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `certificates_ibfk_2` FOREIGN KEY (`institute_id`) REFERENCES `institutes` (`institute_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
