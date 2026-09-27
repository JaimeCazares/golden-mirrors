-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: gestanut
-- ------------------------------------------------------
-- Server version	10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `gestanut`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `gestanut` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */;

USE `gestanut`;

--
-- Table structure for table `alimentos`
--

DROP TABLE IF EXISTS `alimentos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `alimentos` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(150) NOT NULL,
  `categoria` varchar(50) NOT NULL,
  `porcion_g` smallint(5) unsigned NOT NULL DEFAULT 100,
  `porcion_descripcion` varchar(80) DEFAULT NULL,
  `calorias` smallint(5) unsigned NOT NULL DEFAULT 0,
  `proteina_g` decimal(5,2) NOT NULL DEFAULT 0.00,
  `carbohidratos_g` decimal(5,2) NOT NULL DEFAULT 0.00,
  `grasas_g` decimal(5,2) NOT NULL DEFAULT 0.00,
  `fibra_g` decimal(5,2) NOT NULL DEFAULT 0.00,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `alimentos`
--

LOCK TABLES `alimentos` WRITE;
/*!40000 ALTER TABLE `alimentos` DISABLE KEYS */;
INSERT INTO `alimentos` VALUES (1,'Pechuga de pollo','Proteína animal',100,'100g cocido',165,31.00,0.00,3.60,0.00),(2,'Muslo de pollo','Proteína animal',100,'100g cocido',209,26.00,0.00,11.00,0.00),(3,'Salmón','Proteína animal',100,'100g cocido',208,20.00,0.00,13.00,0.00),(4,'Atún en agua','Proteína animal',100,'1 lata drenada',116,26.00,0.00,1.00,0.00),(5,'Carne res magra','Proteína animal',100,'100g cocido',215,26.00,0.00,12.00,0.00),(6,'Tilapia','Proteína animal',100,'100g cocido',96,20.00,0.00,2.00,0.00),(7,'Sardina en agua','Proteína animal',100,'100g drenado',208,25.00,0.00,11.00,0.00),(8,'Camarón','Proteína animal',100,'100g cocido',99,18.00,1.50,1.40,0.00),(9,'Huevo entero','Proteína animal',50,'1 pieza',78,6.00,0.60,5.00,0.00),(10,'Clara de huevo','Proteína animal',33,'1 clara',17,3.60,0.20,0.10,0.00),(11,'Atún en aceite','Proteína animal',100,'1 lata drenada',198,25.50,0.00,9.00,0.00),(12,'Lentejas cocidas','Proteína vegetal',200,'1 taza',230,18.00,40.00,0.80,16.00),(13,'Frijoles negros','Proteína vegetal',172,'1 taza',227,15.00,41.00,0.90,15.00),(14,'Garbanzos','Proteína vegetal',164,'1 taza cocidos',269,15.00,45.00,4.00,12.00),(15,'Tofu firme','Proteína vegetal',100,'100g',76,8.00,1.90,4.30,0.30),(16,'Edamame','Proteína vegetal',155,'1 taza',188,17.00,14.00,8.00,8.00),(17,'Frijoles bayos','Proteína vegetal',172,'1 taza',220,14.00,40.00,0.80,14.00),(18,'Arroz integral','Carbohidrato',195,'1 taza cocido',216,5.00,45.00,1.80,3.50),(19,'Arroz blanco','Carbohidrato',195,'1 taza cocido',242,4.40,53.00,0.40,0.60),(20,'Avena','Carbohidrato',40,'½ taza seca',148,6.00,27.00,2.50,4.00),(21,'Quinoa','Carbohidrato',185,'1 taza cocida',222,8.00,39.00,3.50,5.00),(22,'Papa','Carbohidrato',150,'1 papa mediana',117,2.50,27.00,0.10,2.00),(23,'Camote','Carbohidrato',130,'1 camote mediano',112,2.00,26.00,0.10,3.80),(24,'Tortilla de maíz','Carbohidrato',30,'1 pieza',65,1.50,13.50,1.00,1.50),(25,'Pan integral','Carbohidrato',30,'1 rebanada',79,3.00,15.00,1.00,1.90),(26,'Pasta integral','Carbohidrato',55,'½ taza seca',192,7.00,37.00,1.40,3.80),(27,'Elote','Carbohidrato',100,'1 mazorca mediana',86,3.20,19.00,1.20,2.70),(28,'Tostada de maíz','Carbohidrato',20,'1 pieza',90,1.50,12.00,4.00,0.80),(29,'Manzana','Fruta',182,'1 pieza',95,0.50,25.00,0.30,4.40),(30,'Plátano','Fruta',118,'1 pieza',105,1.30,27.00,0.40,3.10),(31,'Fresa','Fruta',152,'1 taza',49,1.00,12.00,0.50,3.00),(32,'Mango','Fruta',165,'1 taza',107,0.80,28.00,0.50,3.00),(33,'Naranja','Fruta',131,'1 pieza',62,1.20,15.00,0.20,3.10),(34,'Kiwi','Fruta',76,'1 pieza',46,0.90,11.00,0.40,2.30),(35,'Frutos rojos mix','Fruta',140,'1 taza',62,1.40,14.00,0.50,6.00),(36,'Piña','Fruta',165,'1 taza',83,0.90,22.00,0.20,2.30),(37,'Papaya','Fruta',145,'1 taza',62,0.70,16.00,0.40,2.50),(38,'Melón','Fruta',177,'1 taza',60,1.50,14.00,0.30,1.60),(39,'Uva','Fruta',151,'1 taza',104,1.10,27.00,0.20,1.40),(40,'Durazno','Fruta',150,'1 pieza',60,1.40,15.00,0.40,2.30),(41,'Brócoli','Verdura',91,'1 taza',31,2.60,6.00,0.30,2.40),(42,'Espinaca','Verdura',30,'1 taza cruda',7,0.90,1.10,0.10,0.70),(43,'Zanahoria','Verdura',61,'1 pieza',25,0.60,6.00,0.10,1.70),(44,'Calabaza','Verdura',115,'1 taza',19,1.40,3.50,0.20,1.20),(45,'Pepino','Verdura',119,'1 taza',16,0.70,3.80,0.10,0.50),(46,'Lechuga','Verdura',47,'1 taza',8,0.60,1.60,0.10,0.60),(47,'Jitomate','Verdura',123,'1 pieza',22,1.10,4.80,0.20,1.50),(48,'Champiñones','Verdura',96,'1 taza',21,3.00,3.00,0.30,1.00),(49,'Nopal','Verdura',149,'1 taza',22,2.00,5.00,0.10,3.70),(50,'Chayote','Verdura',200,'1 pieza',38,1.70,9.00,0.10,3.50),(51,'Pimiento','Verdura',92,'1 pieza',20,0.90,4.60,0.20,1.50),(52,'Cebolla','Verdura',160,'1 taza',64,1.80,15.00,0.20,2.70),(53,'Betabel','Verdura',136,'1 taza cocido',75,2.90,17.00,0.30,3.80),(54,'Aguacate','Grasa saludable',75,'½ pieza',120,1.50,6.40,11.00,5.00),(55,'Aceite de oliva','Grasa saludable',14,'1 cucharada',119,0.00,0.00,13.50,0.00),(56,'Almendras','Grasa saludable',28,'23 piezas',164,6.00,6.00,14.00,3.50),(57,'Nuez de Castilla','Grasa saludable',28,'7 mitades',185,4.30,3.90,18.50,1.90),(58,'Mantequilla almendra','Grasa saludable',32,'2 cucharadas',196,7.00,6.00,18.00,3.00),(59,'Semillas de chía','Grasa saludable',28,'2 cucharadas',138,4.70,12.00,8.70,9.80),(60,'Linaza molida','Grasa saludable',10,'1 cucharada',55,2.00,3.00,4.00,3.00),(61,'Cacahuate','Grasa saludable',28,'2 cucharadas',161,7.30,4.60,14.00,2.40),(62,'Yogurt griego','Lácteo',240,'1 taza',146,22.00,8.00,4.00,0.00),(63,'Leche descremada','Lácteo',245,'1 taza',83,8.00,12.00,0.20,0.00),(64,'Leche entera','Lácteo',245,'1 taza',149,8.00,12.00,8.00,0.00),(65,'Queso cottage','Lácteo',113,'½ taza',101,11.00,3.50,4.50,0.00),(66,'Queso panela','Lácteo',30,'1 rebanada',72,7.00,0.80,4.50,0.00),(67,'Queso Oaxaca','Lácteo',30,'1 rebanada',104,7.00,0.00,8.50,0.00),(68,'Jamón de pavo','Proteína animal',30,'1 rebanada (30g)',35,5.50,0.80,1.20,0.00),(69,'Jamón de cerdo','Proteína animal',30,'1 rebanada (30g)',45,5.00,1.00,2.50,0.00),(70,'Granola','Carbohidrato',40,'¼ taza',150,4.00,24.00,5.00,3.00),(71,'Birria / consomé de chamberete deshebrado','Prote?na animal',300,'1 taz?n',380,40.00,3.00,22.00,0.00),(72,'Cebolla morada','Verdura',40,'1/4 taza picada',16,0.40,3.70,0.00,0.70),(73,'Limón','Verdura',67,'1 pieza',20,0.50,7.00,0.20,1.90);
/*!40000 ALTER TABLE `alimentos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `citas`
--

DROP TABLE IF EXISTS `citas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `citas` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `paciente_id` int(10) unsigned NOT NULL,
  `fecha` date NOT NULL,
  `hora` time NOT NULL,
  `modalidad` enum('presencial','online') NOT NULL DEFAULT 'presencial',
  `tipo_consulta` varchar(100) NOT NULL DEFAULT 'Control / Seguimiento',
  `notas` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `paciente_id` (`paciente_id`),
  CONSTRAINT `citas_ibfk_1` FOREIGN KEY (`paciente_id`) REFERENCES `pacientes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `citas`
--

LOCK TABLES `citas` WRITE;
/*!40000 ALTER TABLE `citas` DISABLE KEYS */;
INSERT INTO `citas` VALUES (10,21,'2026-06-06','08:00:00','presencial','Primera consulta','','2026-06-06 03:30:44');
/*!40000 ALTER TABLE `citas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `consentimientos`
--

DROP TABLE IF EXISTS `consentimientos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `consentimientos` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `paciente_id` int(10) unsigned NOT NULL,
  `firmado` tinyint(1) DEFAULT 0,
  `fecha_firma` date DEFAULT NULL,
  `contenido` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `archivo_url` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `paciente_id` (`paciente_id`),
  CONSTRAINT `consentimientos_ibfk_1` FOREIGN KEY (`paciente_id`) REFERENCES `pacientes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `consentimientos`
--

LOCK TABLES `consentimientos` WRITE;
/*!40000 ALTER TABLE `consentimientos` DISABLE KEYS */;
INSERT INTO `consentimientos` VALUES (1,1,1,'2025-03-17',NULL,'2026-06-05 19:24:42','2026-06-05 19:24:42',NULL),(2,2,1,'2025-03-01',NULL,'2026-06-05 19:24:42','2026-06-05 19:24:42',NULL),(3,4,1,'2025-03-05',NULL,'2026-06-05 19:24:42','2026-06-05 19:24:42',NULL),(4,5,1,'2025-03-01',NULL,'2026-06-05 19:24:42','2026-06-05 19:24:42',NULL),(5,6,1,'2025-02-15',NULL,'2026-06-05 19:24:42','2026-06-05 19:24:42',NULL),(6,7,1,'2025-02-01',NULL,'2026-06-05 19:24:42','2026-06-05 19:24:42',NULL),(7,8,1,'2025-03-01',NULL,'2026-06-05 19:24:42','2026-06-05 19:24:42',NULL),(8,9,1,'2025-04-10',NULL,'2026-06-05 19:24:42','2026-06-05 19:24:42',NULL),(9,10,1,'2025-02-15',NULL,'2026-06-05 19:24:42','2026-06-05 19:24:42',NULL),(10,11,1,'2025-03-01',NULL,'2026-06-05 19:24:42','2026-06-05 19:24:42',NULL),(11,12,1,'2025-03-15',NULL,'2026-06-05 19:24:42','2026-06-05 19:24:42',NULL),(13,3,1,'2026-06-06',NULL,'2026-06-05 22:08:20','2026-06-05 22:08:20',NULL),(14,14,1,'2026-06-06',NULL,'2026-06-05 22:08:22','2026-06-05 22:08:22',NULL),(15,24,1,'2026-06-07',NULL,'2026-06-07 04:13:25','2026-06-07 04:13:25',NULL),(16,26,1,'2026-06-07',NULL,'2026-06-07 20:09:38','2026-06-07 20:09:38','uploads/consentimientos/26/cons_6a25d0028a8cd3.32338014.png');
/*!40000 ALTER TABLE `consentimientos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `consultas`
--

DROP TABLE IF EXISTS `consultas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `consultas` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `paciente_id` int(10) unsigned NOT NULL,
  `usuario_id` int(10) unsigned NOT NULL,
  `fecha_programada` datetime NOT NULL,
  `modalidad` enum('presencial','online') DEFAULT 'presencial',
  `tipo` enum('primera','control','seguimiento','urgencia') DEFAULT 'control',
  `estado` enum('programada','completada','cancelada') DEFAULT 'programada',
  `notas_previas` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `usuario_id` (`usuario_id`),
  KEY `idx_fecha` (`fecha_programada`),
  KEY `idx_paciente` (`paciente_id`),
  CONSTRAINT `consultas_ibfk_1` FOREIGN KEY (`paciente_id`) REFERENCES `pacientes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `consultas_ibfk_2` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `consultas`
--

LOCK TABLES `consultas` WRITE;
/*!40000 ALTER TABLE `consultas` DISABLE KEYS */;
/*!40000 ALTER TABLE `consultas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `documentos_pacientes`
--

DROP TABLE IF EXISTS `documentos_pacientes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `documentos_pacientes` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `paciente_id` int(10) unsigned NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `tipo_archivo` enum('imagen','pdf') NOT NULL DEFAULT 'imagen',
  `archivo_url` varchar(255) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `fecha` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_paciente` (`paciente_id`),
  CONSTRAINT `documentos_pacientes_ibfk_1` FOREIGN KEY (`paciente_id`) REFERENCES `pacientes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `documentos_pacientes`
--

LOCK TABLES `documentos_pacientes` WRITE;
/*!40000 ALTER TABLE `documentos_pacientes` DISABLE KEYS */;
INSERT INTO `documentos_pacientes` VALUES (1,21,'Consentimiento Informado · Jesús Jaime Cazares Sainz','pdf','uploads/documentos/21/doc_6a23bd7accd938.54710305.pdf','','2026-06-06','2026-06-06 06:26:02');
/*!40000 ALTER TABLE `documentos_pacientes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `embarazo`
--

DROP TABLE IF EXISTS `embarazo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `embarazo` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `paciente_id` int(10) unsigned NOT NULL,
  `semanas_gestacion` tinyint(3) unsigned DEFAULT NULL,
  `peso_preembarazo` decimal(5,2) DEFAULT NULL COMMENT 'kg',
  `peso_actual` decimal(5,2) DEFAULT NULL COMMENT 'kg',
  `imc_preembarazo` decimal(4,1) DEFAULT NULL,
  `diabetes_gestacional` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `paciente_id` (`paciente_id`),
  CONSTRAINT `embarazo_ibfk_1` FOREIGN KEY (`paciente_id`) REFERENCES `pacientes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `embarazo`
--

LOCK TABLES `embarazo` WRITE;
/*!40000 ALTER TABLE `embarazo` DISABLE KEYS */;
INSERT INTO `embarazo` VALUES (1,1,28,64.50,NULL,NULL,0,'2026-06-05 19:24:47','2026-06-05 19:24:47'),(2,5,32,67.50,NULL,NULL,1,'2026-06-05 19:24:47','2026-06-05 19:24:47'),(3,9,14,68.00,NULL,NULL,0,'2026-06-05 19:24:47','2026-06-05 19:24:47'),(4,25,10,75.00,NULL,NULL,0,'2026-06-07 19:23:45','2026-06-07 19:23:45');
/*!40000 ALTER TABLE `embarazo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `finanzas`
--

DROP TABLE IF EXISTS `finanzas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `finanzas` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `usuario_id` int(10) unsigned NOT NULL,
  `paciente_id` int(10) unsigned DEFAULT NULL,
  `fecha` date NOT NULL,
  `concepto` varchar(200) NOT NULL,
  `tipo` enum('ingreso','gasto') NOT NULL,
  `monto` decimal(10,2) NOT NULL,
  `pagado` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `usuario_id` (`usuario_id`),
  KEY `paciente_id` (`paciente_id`),
  KEY `idx_fecha` (`fecha`),
  KEY `idx_tipo` (`tipo`),
  CONSTRAINT `finanzas_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `finanzas_ibfk_2` FOREIGN KEY (`paciente_id`) REFERENCES `pacientes` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `finanzas`
--

LOCK TABLES `finanzas` WRITE;
/*!40000 ALTER TABLE `finanzas` DISABLE KEYS */;
INSERT INTO `finanzas` VALUES (1,1,1,'2025-05-06','Consulta prenatal · Sofia Lopez','ingreso',400.00,0,'2026-06-05 19:24:52','2026-06-05 19:24:52'),(2,1,4,'2025-05-06','Consulta online · Karla Vega','ingreso',350.00,0,'2026-06-05 19:24:52','2026-06-05 19:24:52'),(3,1,8,'2025-05-05','Recomposicion · Laura Mendez','ingreso',300.00,1,'2026-06-05 19:24:52','2026-06-05 19:24:52'),(4,1,9,'2025-05-05','Prenatal · Elena Torres','ingreso',400.00,1,'2026-06-05 19:24:52','2026-06-05 19:24:52'),(5,1,NULL,'2025-05-04','Suscripcion Canva Pro','gasto',200.00,1,'2026-06-05 19:24:52','2026-06-05 19:24:52'),(6,1,2,'2025-05-03','Recomposicion · Maria Rodriguez','ingreso',300.00,1,'2026-06-05 19:24:52','2026-06-05 19:24:52'),(7,1,NULL,'2025-05-03','Materiales de consulta','gasto',180.00,1,'2026-06-05 19:24:52','2026-06-05 19:24:52'),(8,1,3,'2025-05-02','1a Consulta · Andrea Gonzalez','ingreso',400.00,1,'2026-06-05 19:24:52','2026-06-05 19:24:52'),(9,1,NULL,'2025-05-01','Transporte (Uber)','gasto',160.00,1,'2026-06-05 19:24:52','2026-06-05 19:24:52'),(10,1,12,'2025-04-30','Online · Valeria Cruz','ingreso',280.00,1,'2026-06-05 19:24:52','2026-06-05 19:24:52'),(11,1,NULL,'2025-04-29','Plataforma videollamadas','gasto',240.00,1,'2026-06-05 19:24:52','2026-06-05 19:24:52'),(12,1,10,'2025-04-28','Recomposicion · Sandra Flores','ingreso',300.00,1,'2026-06-05 19:24:52','2026-06-05 19:24:52'),(13,1,NULL,'2026-06-06','Consulta de Jaime','ingreso',300.00,1,'2026-06-06 04:37:48','2026-06-06 04:37:48');
/*!40000 ALTER TABLE `finanzas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `galeria_pacientes`
--

DROP TABLE IF EXISTS `galeria_pacientes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `galeria_pacientes` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `paciente_id` int(10) unsigned NOT NULL,
  `fecha` date DEFAULT NULL,
  `tipo` varchar(50) DEFAULT 'progreso',
  `archivo_url` varchar(255) DEFAULT NULL,
  `descripcion` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `paciente_id` (`paciente_id`),
  CONSTRAINT `galeria_pacientes_ibfk_1` FOREIGN KEY (`paciente_id`) REFERENCES `pacientes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `galeria_pacientes`
--

LOCK TABLES `galeria_pacientes` WRITE;
/*!40000 ALTER TABLE `galeria_pacientes` DISABLE KEYS */;
/*!40000 ALTER TABLE `galeria_pacientes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `glucosa_monitoreo`
--

DROP TABLE IF EXISTS `glucosa_monitoreo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `glucosa_monitoreo` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `paciente_id` int(10) unsigned NOT NULL,
  `fecha` date NOT NULL,
  `ayuno` smallint(5) unsigned DEFAULT NULL COMMENT 'mg/dL',
  `pre_comida` smallint(5) unsigned DEFAULT NULL COMMENT 'mg/dL',
  `post_comida` smallint(5) unsigned DEFAULT NULL COMMENT 'mg/dL',
  `pre_cena` smallint(5) unsigned DEFAULT NULL COMMENT 'mg/dL',
  `post_cena` smallint(5) unsigned DEFAULT NULL COMMENT 'mg/dL',
  `nota` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_fecha` (`paciente_id`,`fecha`),
  CONSTRAINT `glucosa_monitoreo_ibfk_1` FOREIGN KEY (`paciente_id`) REFERENCES `pacientes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `glucosa_monitoreo`
--

LOCK TABLES `glucosa_monitoreo` WRITE;
/*!40000 ALTER TABLE `glucosa_monitoreo` DISABLE KEYS */;
INSERT INTO `glucosa_monitoreo` VALUES (1,5,'2025-04-28',91,98,132,95,128,'Buen control','2026-06-05 19:24:47'),(2,5,'2025-04-27',88,95,140,93,135,'Post-comida límite','2026-06-05 19:24:47'),(3,5,'2025-04-26',94,100,135,96,130,'Ayuno ligeramente alto','2026-06-05 19:24:47'),(4,5,'2025-04-25',87,94,128,90,122,'Día excelente','2026-06-05 19:24:47'),(5,5,'2025-04-24',92,97,142,94,138,'Post-comida alto','2026-06-05 19:24:47');
/*!40000 ALTER TABLE `glucosa_monitoreo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `historia_clinica`
--

DROP TABLE IF EXISTS `historia_clinica`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `historia_clinica` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `paciente_id` int(10) unsigned NOT NULL,
  `motivo_consulta` text DEFAULT NULL,
  `antecedentes_patologicos` text DEFAULT NULL,
  `alergias` text DEFAULT NULL,
  `intolerancias` text DEFAULT NULL,
  `medicamentos_actuales` text DEFAULT NULL,
  `cirugias_previas` text DEFAULT NULL,
  `antecedentes_familiares` text DEFAULT NULL,
  `actividad_fisica` text DEFAULT NULL,
  `ocupacion` varchar(100) DEFAULT NULL,
  `estado_civil` varchar(50) DEFAULT NULL,
  `tabaquismo` enum('nunca','exfumador','actual') DEFAULT 'nunca',
  `consumo_alcohol` varchar(50) DEFAULT NULL,
  `biografia` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `paciente_id` (`paciente_id`),
  CONSTRAINT `historia_clinica_ibfk_1` FOREIGN KEY (`paciente_id`) REFERENCES `pacientes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `historia_clinica`
--

LOCK TABLES `historia_clinica` WRITE;
/*!40000 ALTER TABLE `historia_clinica` DISABLE KEYS */;
INSERT INTO `historia_clinica` VALUES (1,1,'Control nutricional prenatal','Sin antecedentes patológicos','Sin alergias conocidas','Sin intolerancias documentadas','Suplemento prenatal (Ácido fólico 600mcg, DHA 200mg)','Ninguna','DM2 en abuelo materno','Caminata 30 min/3x sem','Maestra de primaria','Casada','nunca','No','Primer embarazo. Antes del embarazo en peso normal. Tolerancia gastrointestinal buena. Sin enfermedades previas.','2026-06-05 19:24:47','2026-06-05 19:24:47'),(2,2,'Optimizar composición corporal','Sin antecedentes','Sin alergias','Intolerancia leve al gluten (no celíaca)','Creatina 5g/día (automedicada)','Apendicectomía 2018','Ninguna relevante','Crossfit 5x/sem + caminata','Diseñadora gráfica','Soltera','nunca','Ocasional (1x/sem)','Hace crossfit 5 días/semana. Buena adherencia. Objetivo: ganar 2 kg masa magra en 12 semanas.','2026-06-05 19:24:47','2026-06-05 19:24:47'),(3,3,'Bajar de peso, mejorar energía','Sin antecedentes','Sin alergias','Sin intolerancias','Ninguno','Ninguna','DM2 en madre, HTA en padre','Ninguna actualmente','Contadora','Soltera','nunca','Social (fin de semana)','Primera consulta. Sin antecedentes patológicos. Estilo de vida sedentario, oficina 9 hrs.','2026-06-05 19:24:47','2026-06-05 19:24:47'),(4,4,'Apoyo nutricional lactancia + recuperación postparto','Cesárea programada','Sin alergias','Sin intolerancias','DHA postnatal, Calcio 1200mg, Fe 30mg','Cesárea Feb 2025','Ninguna relevante','Caminata suave 20 min/día','Farmacéutica (licencia maternal)','Casada','nunca','No','Bebé de 3 meses. Lactancia exclusiva. Quiere recuperar composición sin afectar producción de leche.','2026-06-05 19:24:47','2026-06-05 19:24:47'),(5,5,'Control glucémico + nutrición fetal','Diabetes gestacional (actual)','Sin alergias','Sin intolerancias','Suplemento prenatal, metformina suspendida por control con dieta','2 partos previos (vaginales)','DM2 en ambos padres','Caminata 20 min/día con autorización obstétrica','Ama de casa','Casada','nunca','No','Tercer embarazo. Diabetes gestacional controlada con dieta. Sin medicamentos.','2026-06-05 19:24:47','2026-06-05 19:24:47'),(6,6,'Control de peso con SOP e hipotiroidismo','Hipotiroidismo, SOP','Sin alergias','Intolerancia a la lactosa leve','Levotiroxina 50mcg/día','Ninguna','Hipotiroidismo en madre','Yoga 2x/sem','Abogada','Soltera','nunca','Ocasional','Hipotiroidismo controlado con levotiroxina. Estrés laboral alto. SOP diagnosticado 2022.','2026-06-05 19:24:47','2026-06-05 19:24:47'),(7,7,'Bajar de peso, prevenir DM2','Sin antecedentes','Sin alergias','Sin intolerancias','Ninguno','Ninguna','DM2 en padre','Caminata 30 min/día','Enfermera','Casada','nunca','No','Sin patologías activas. Estrés laboral moderado. Antecedentes familiares de DM2.','2026-06-05 19:24:47','2026-06-05 19:24:47'),(8,8,'Definición muscular, reducir grasa corporal','Sin antecedentes','Sin alergias','Sin intolerancias','Proteína whey (suplemento)','Ninguna','Ninguna','Gym 4x/sem + cardio 2x/sem','Maestra','Casada','nunca','Ocasional','Adherencia excelente. Foco en definición. Entrena 4 veces por semana.','2026-06-05 19:24:47','2026-06-05 19:24:47'),(9,9,'Control nutricional 2do embarazo','Sin antecedentes','Sin alergias','Sin intolerancias','Ácido fólico 400mcg','Ninguna','Ninguna relevante','Yoga prenatal 2x/sem','Contadora','Casada','nunca','No','Segundo embarazo. Náuseas matutinas leves. Aversión a carnes rojas en 1er trimestre.','2026-06-05 19:24:47','2026-06-05 19:24:47'),(10,10,'Preservar músculo, salud ósea, manejo de síntomas','Pre-menopausia','Sin alergias','Sin intolerancias','Calcio 600mg + Vit D3 1000UI','Ninguna','Osteoporosis en madre','Fuerza 3x/sem + pilates','Directora de escuela','Divorciada','nunca','No','Pre-menopausia. Cambios hormonales. Foco en preservar masa muscular y salud ósea.','2026-06-05 19:24:47','2026-06-05 19:24:47'),(11,11,'Optimizar rendimiento deportivo para maratón','Sin antecedentes','Alergia a mariscos','Sin intolerancias','Hierro 30mg (preventivo)','Ninguna','Ninguna','Correr 5-7x/sem (60-80km semanales)','Ingeniera en software','Soltera','nunca','No','Corredora aficionada. Maratón en 4 meses. Plan periodizado por intensidad de entrenamiento.','2026-06-05 19:24:47','2026-06-05 19:24:47'),(12,12,'Bajar 5 kg para evento en julio','Sin antecedentes','Sin alergias','Sin intolerancias','Anticonceptivos orales','Ninguna','Sobrepeso en madre','Ninguna regular','Estudiante de medicina','Soltera','nunca','Fin de semana','Estudiante universitaria. Vive en Mazatlán. Quiere bajar para una boda en julio.','2026-06-05 19:24:47','2026-06-05 19:24:47'),(14,14,'Llegar a la meta de pesar 80kg','N/A','N/A','N/A','N/A','N/A','N/A','Hace un poco de deporte por las tardes','Oficina','Soltero','nunca','No','Estudia y trabaja en oficina, hace un poco de deporte por las tardes','2026-06-05 22:07:37','2026-06-05 22:08:12'),(17,24,'Llegar a la meta de pesar 80kg','N/A','N/A','N/A','N/A','N/A','N/A','Nula','Estudiante','Soltero/a','nunca','No','Casi no realiza actividad fisica','2026-06-07 04:06:25','2026-06-07 04:06:25');
/*!40000 ALTER TABLE `historia_clinica` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `laboratorios`
--

DROP TABLE IF EXISTS `laboratorios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `laboratorios` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `paciente_id` int(10) unsigned NOT NULL,
  `fecha_prueba` date NOT NULL,
  `prueba` varchar(100) NOT NULL,
  `valor` varchar(100) DEFAULT NULL,
  `unidad` varchar(20) DEFAULT NULL,
  `rango_referencia` varchar(100) DEFAULT NULL,
  `estado` enum('ok','warn','alert') DEFAULT 'ok',
  `interpretacion` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_paciente_fecha` (`paciente_id`,`fecha_prueba`),
  CONSTRAINT `laboratorios_ibfk_1` FOREIGN KEY (`paciente_id`) REFERENCES `pacientes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `laboratorios`
--

LOCK TABLES `laboratorios` WRITE;
/*!40000 ALTER TABLE `laboratorios` DISABLE KEYS */;
INSERT INTO `laboratorios` VALUES (1,1,'2025-04-28','Hemoglobina','12.8',NULL,'11-16 g/dL','ok',NULL,'2026-06-05 19:24:47'),(2,1,'2025-04-28','Hematocrito','38.5',NULL,'33-47%','ok',NULL,'2026-06-05 19:24:47'),(3,1,'2025-04-28','Glucosa ayuno','88',NULL,'70-92 mg/dL','ok',NULL,'2026-06-05 19:24:47'),(4,1,'2025-04-28','Ferritina','22',NULL,'13-150 ng/mL','ok',NULL,'2026-06-05 19:24:47'),(5,1,'2025-04-28','Ácido fólico sérico','9.8',NULL,'>5.9 ng/mL','ok',NULL,'2026-06-05 19:24:47'),(6,1,'2025-04-28','TSH','2.1',NULL,'0.5-4.5 mUI/L','ok',NULL,'2026-06-05 19:24:47'),(7,2,'2025-03-01','Glucosa','91',NULL,'70-100 mg/dL','ok',NULL,'2026-06-05 19:24:47'),(8,2,'2025-03-01','Colesterol total','172',NULL,'<200 mg/dL','ok',NULL,'2026-06-05 19:24:47'),(9,2,'2025-03-01','Triglicéridos','98',NULL,'<150 mg/dL','ok',NULL,'2026-06-05 19:24:47'),(10,2,'2025-03-01','HDL','62',NULL,'>50 mg/dL','ok',NULL,'2026-06-05 19:24:47'),(11,2,'2025-03-01','LDL','91',NULL,'<130 mg/dL','ok',NULL,'2026-06-05 19:24:47'),(12,2,'2025-03-01','Hemoglobina','13.5',NULL,'12-16 g/dL','ok',NULL,'2026-06-05 19:24:47'),(13,4,'2025-04-02','Hemoglobina','11.8',NULL,'12-16 g/dL','warn',NULL,'2026-06-05 19:24:47'),(14,4,'2025-04-02','Ferritina','10',NULL,'13-150 ng/mL','alert',NULL,'2026-06-05 19:24:47'),(15,4,'2025-04-02','Calcio sérico','9.1',NULL,'8.5-10.5 mg/dL','ok',NULL,'2026-06-05 19:24:47'),(16,4,'2025-04-02','Vitamina D','22',NULL,'30-100 ng/mL','warn',NULL,'2026-06-05 19:24:47'),(17,4,'2025-04-02','Glucosa','85',NULL,'70-100 mg/dL','ok',NULL,'2026-06-05 19:24:47'),(18,5,'2025-04-24','Glucosa ayuno','94',NULL,'<92 mg/dL','warn',NULL,'2026-06-05 19:24:47'),(19,5,'2025-04-24','Glucosa 1h postprandial','138',NULL,'<140 mg/dL','ok',NULL,'2026-06-05 19:24:47'),(20,5,'2025-04-24','HbA1c','5.4',NULL,'<5.7%','ok',NULL,'2026-06-05 19:24:47'),(21,5,'2025-04-24','Hemoglobina','11.5',NULL,'11-16 g/dL','ok',NULL,'2026-06-05 19:24:47'),(22,5,'2025-04-24','Triglicéridos','198',NULL,'<150 mg/dL (emb.)','warn',NULL,'2026-06-05 19:24:47'),(23,6,'2025-04-15','TSH','3.8',NULL,'0.5-4.5 mUI/L','ok',NULL,'2026-06-05 19:24:47'),(24,6,'2025-04-15','T4 libre','1.1',NULL,'0.8-1.8 ng/dL','ok',NULL,'2026-06-05 19:24:47'),(25,6,'2025-04-15','Glucosa','104',NULL,'70-100 mg/dL','warn',NULL,'2026-06-05 19:24:47'),(26,6,'2025-04-15','Insulina','18',NULL,'<15 mUI/L','warn',NULL,'2026-06-05 19:24:47'),(27,6,'2025-04-15','Índice HOMA','4.7',NULL,'<2.5','alert',NULL,'2026-06-05 19:24:47'),(28,6,'2025-04-15','Testosterona libre','8.2',NULL,'0.5-5.5 pg/mL','alert',NULL,'2026-06-05 19:24:47'),(29,7,'2025-04-15','Glucosa','98',NULL,'70-100 mg/dL','ok',NULL,'2026-06-05 19:24:47'),(30,7,'2025-04-15','Colesterol total','195',NULL,'<200 mg/dL','ok',NULL,'2026-06-05 19:24:47'),(31,7,'2025-04-15','Triglicéridos','142',NULL,'<150 mg/dL','ok',NULL,'2026-06-05 19:24:47'),(32,7,'2025-04-15','Hemoglobina','13.2',NULL,'12-16 g/dL','ok',NULL,'2026-06-05 19:24:47'),(33,8,'2025-04-28','Hemoglobina','13.8',NULL,'12-16 g/dL','ok',NULL,'2026-06-05 19:24:47'),(34,8,'2025-04-28','Glucosa','86',NULL,'70-100 mg/dL','ok',NULL,'2026-06-05 19:24:47'),(35,8,'2025-04-28','Creatinina','0.8',NULL,'0.5-1.1 mg/dL','ok',NULL,'2026-06-05 19:24:47'),(36,9,'2025-04-22','Hemoglobina','12.2',NULL,'11-16 g/dL','ok',NULL,'2026-06-05 19:24:47'),(37,9,'2025-04-22','Glucosa ayuno','82',NULL,'70-92 mg/dL','ok',NULL,'2026-06-05 19:24:47'),(38,9,'2025-04-22','TSH','1.8',NULL,'0.5-4.5 mUI/L','ok',NULL,'2026-06-05 19:24:47'),(39,9,'2025-04-22','Ferritina','18',NULL,'13-150 ng/mL','ok',NULL,'2026-06-05 19:24:47'),(40,10,'2025-04-21','FSH','18',NULL,'3.5-12.5 mUI/mL','warn',NULL,'2026-06-05 19:24:47'),(41,10,'2025-04-21','Estradiol','42',NULL,'15-350 pg/mL','ok',NULL,'2026-06-05 19:24:47'),(42,10,'2025-04-21','Calcio sérico','9.4',NULL,'8.5-10.5 mg/dL','ok',NULL,'2026-06-05 19:24:47'),(43,10,'2025-04-21','Vitamina D','28',NULL,'30-100 ng/mL','warn',NULL,'2026-06-05 19:24:47'),(44,10,'2025-04-21','Colesterol total','210',NULL,'<200 mg/dL','warn',NULL,'2026-06-05 19:24:47'),(45,11,'2025-04-19','Hemoglobina','13.2',NULL,'12-16 g/dL','ok',NULL,'2026-06-05 19:24:47'),(46,11,'2025-04-19','Ferritina','25',NULL,'13-150 ng/mL','ok',NULL,'2026-06-05 19:24:47'),(47,11,'2025-04-19','Glucosa','84',NULL,'70-100 mg/dL','ok',NULL,'2026-06-05 19:24:47'),(48,11,'2025-04-19','Vitamina D','38',NULL,'30-100 ng/mL','ok',NULL,'2026-06-05 19:24:47'),(49,12,'2025-03-15','Glucosa','90',NULL,'70-100 mg/dL','ok',NULL,'2026-06-05 19:24:47'),(50,12,'2025-03-15','Hemoglobina','12.8',NULL,'12-16 g/dL','ok',NULL,'2026-06-05 19:24:47');
/*!40000 ALTER TABLE `laboratorios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lactancia`
--

DROP TABLE IF EXISTS `lactancia`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `lactancia` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `paciente_id` int(10) unsigned NOT NULL,
  `semanas_lactancia` tinyint(3) unsigned DEFAULT NULL,
  `produccion` enum('abundante','normal','insuficiente') DEFAULT 'normal',
  `tetadas_por_dia` tinyint(3) unsigned DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `paciente_id` (`paciente_id`),
  CONSTRAINT `lactancia_ibfk_1` FOREIGN KEY (`paciente_id`) REFERENCES `pacientes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lactancia`
--

LOCK TABLES `lactancia` WRITE;
/*!40000 ALTER TABLE `lactancia` DISABLE KEYS */;
INSERT INTO `lactancia` VALUES (1,4,12,'abundante',8,'2026-06-05 19:24:47','2026-06-05 19:24:47');
/*!40000 ALTER TABLE `lactancia` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lactancia_sintomas`
--

DROP TABLE IF EXISTS `lactancia_sintomas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `lactancia_sintomas` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `lactancia_id` int(10) unsigned NOT NULL,
  `sintoma` varchar(100) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `lactancia_id` (`lactancia_id`),
  CONSTRAINT `lactancia_sintomas_ibfk_1` FOREIGN KEY (`lactancia_id`) REFERENCES `lactancia` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lactancia_sintomas`
--

LOCK TABLES `lactancia_sintomas` WRITE;
/*!40000 ALTER TABLE `lactancia_sintomas` DISABLE KEYS */;
INSERT INTO `lactancia_sintomas` VALUES (1,1,'Cansancio extremo','2026-06-05 19:24:47'),(2,1,'Sed constante','2026-06-05 19:24:47');
/*!40000 ALTER TABLE `lactancia_sintomas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mediciones`
--

DROP TABLE IF EXISTS `mediciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `mediciones` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `paciente_id` int(10) unsigned NOT NULL,
  `fecha` date NOT NULL,
  `peso` decimal(5,2) DEFAULT NULL COMMENT 'kg',
  `altura` decimal(3,2) DEFAULT NULL COMMENT 'm',
  `cintura` decimal(5,2) DEFAULT NULL COMMENT 'cm',
  `cadera` decimal(5,2) DEFAULT NULL COMMENT 'cm',
  `brazo` decimal(5,2) DEFAULT NULL COMMENT 'cm',
  `muslo` decimal(5,2) DEFAULT NULL COMMENT 'cm',
  `porcentaje_grasa` decimal(4,1) DEFAULT NULL COMMENT '%',
  `imc` decimal(4,1) DEFAULT NULL COMMENT 'calculado',
  `nota` text DEFAULT NULL,
  `sem` tinyint(4) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_fecha` (`paciente_id`,`fecha`),
  CONSTRAINT `mediciones_ibfk_1` FOREIGN KEY (`paciente_id`) REFERENCES `pacientes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mediciones`
--

LOCK TABLES `mediciones` WRITE;
/*!40000 ALTER TABLE `mediciones` DISABLE KEYS */;
INSERT INTO `mediciones` VALUES (1,1,'2025-03-17',71.00,NULL,88.00,104.00,28.00,56.00,NULL,NULL,'Inicio bien',22,'2026-06-05 19:24:47'),(2,1,'2025-03-31',71.40,NULL,88.00,104.00,28.00,56.00,NULL,NULL,'+200kcal/día',24,'2026-06-05 19:24:47'),(3,1,'2025-04-14',71.90,NULL,88.00,104.00,28.00,56.00,NULL,NULL,'Hierro normal',26,'2026-06-05 19:24:47'),(4,1,'2025-04-28',72.30,NULL,88.00,104.00,28.00,56.00,NULL,NULL,'Dentro de rango',28,'2026-06-05 19:24:47'),(5,2,'2025-03-01',62.40,NULL,72.00,96.00,30.00,58.00,24.0,NULL,'Inicio',NULL,'2026-06-05 19:24:47'),(6,2,'2025-03-15',62.60,NULL,72.00,96.00,30.00,58.00,23.2,NULL,'Buena adaptación',NULL,'2026-06-05 19:24:47'),(7,2,'2025-04-01',62.90,NULL,72.00,96.00,30.00,58.00,22.5,NULL,'Composición mejora',NULL,'2026-06-05 19:24:47'),(8,2,'2025-04-15',63.00,NULL,72.00,96.00,30.00,58.00,22.0,NULL,'Avance constante',NULL,'2026-06-05 19:24:47'),(9,2,'2025-04-25',63.10,NULL,72.00,96.00,30.00,58.00,21.4,NULL,'Excelente progreso',NULL,'2026-06-05 19:24:47'),(10,4,'2025-03-05',69.00,NULL,80.00,100.00,28.00,56.00,NULL,NULL,'Post-parto inmediato',NULL,'2026-06-05 19:24:47'),(11,4,'2025-04-02',67.50,NULL,80.00,100.00,28.00,56.00,NULL,NULL,'Reducción gradual',NULL,'2026-06-05 19:24:47'),(12,4,'2025-04-20',66.50,NULL,80.00,100.00,28.00,56.00,NULL,NULL,'Producción láctea estable',NULL,'2026-06-05 19:24:47'),(13,5,'2025-03-01',73.50,NULL,96.00,110.00,30.00,60.00,NULL,NULL,'Glucosa 92',24,'2026-06-05 19:24:47'),(14,5,'2025-03-15',74.00,NULL,96.00,110.00,30.00,60.00,NULL,NULL,'Plan bajo CHO',26,'2026-06-05 19:24:47'),(15,5,'2025-04-01',74.70,NULL,96.00,110.00,30.00,60.00,NULL,NULL,'Glucosa controlada',28,'2026-06-05 19:24:47'),(16,5,'2025-04-15',75.30,NULL,96.00,110.00,30.00,60.00,NULL,NULL,'Excelente control',30,'2026-06-05 19:24:47'),(17,5,'2025-04-24',75.80,NULL,96.00,110.00,30.00,60.00,NULL,NULL,'Manteniendo',32,'2026-06-05 19:24:47'),(18,6,'2025-02-15',84.00,NULL,92.00,108.00,32.00,62.00,NULL,NULL,NULL,NULL,'2026-06-05 19:24:47'),(19,6,'2025-03-01',83.20,NULL,92.00,108.00,32.00,62.00,NULL,NULL,NULL,NULL,'2026-06-05 19:24:47'),(20,6,'2025-03-15',82.50,NULL,92.00,108.00,32.00,62.00,NULL,NULL,NULL,NULL,'2026-06-05 19:24:47'),(21,6,'2025-04-01',81.90,NULL,92.00,108.00,32.00,62.00,NULL,NULL,NULL,NULL,'2026-06-05 19:24:47'),(22,6,'2025-04-18',81.20,NULL,92.00,108.00,32.00,62.00,NULL,NULL,NULL,NULL,'2026-06-05 19:24:47'),(23,7,'2025-02-15',88.00,NULL,96.00,114.00,34.00,64.00,NULL,NULL,NULL,NULL,'2026-06-05 19:24:47'),(24,7,'2025-03-01',86.50,NULL,96.00,114.00,34.00,64.00,NULL,NULL,NULL,NULL,'2026-06-05 19:24:47'),(25,7,'2025-03-15',85.40,NULL,96.00,114.00,34.00,64.00,NULL,NULL,NULL,NULL,'2026-06-05 19:24:47'),(26,7,'2025-04-01',84.80,NULL,96.00,114.00,34.00,64.00,NULL,NULL,NULL,NULL,'2026-06-05 19:24:47'),(27,7,'2025-04-15',84.30,NULL,96.00,114.00,34.00,64.00,NULL,NULL,NULL,NULL,'2026-06-05 19:24:47'),(28,8,'2025-03-01',60.20,NULL,68.00,94.00,28.00,54.00,22.5,NULL,NULL,NULL,'2026-06-05 19:24:47'),(29,8,'2025-03-15',59.50,NULL,68.00,94.00,28.00,54.00,21.0,NULL,NULL,NULL,'2026-06-05 19:24:47'),(30,8,'2025-04-01',58.90,NULL,68.00,94.00,28.00,54.00,19.8,NULL,NULL,NULL,'2026-06-05 19:24:47'),(31,8,'2025-04-15',58.50,NULL,68.00,94.00,28.00,54.00,19.0,NULL,NULL,NULL,'2026-06-05 19:24:47'),(32,8,'2025-04-28',58.40,NULL,68.00,94.00,28.00,54.00,18.4,NULL,NULL,NULL,'2026-06-05 19:24:47'),(33,9,'2025-04-14',69.50,NULL,82.00,102.00,30.00,58.00,NULL,NULL,'Inicio control',12,'2026-06-05 19:24:47'),(34,9,'2025-04-22',70.20,NULL,82.00,102.00,30.00,58.00,NULL,NULL,'Náuseas mejorando',14,'2026-06-05 19:24:47'),(35,10,'2025-02-15',62.50,NULL,74.00,96.00,28.00,56.00,28.0,NULL,NULL,NULL,'2026-06-05 19:24:47'),(36,10,'2025-03-15',61.80,NULL,74.00,96.00,28.00,56.00,27.0,NULL,NULL,NULL,'2026-06-05 19:24:47'),(37,10,'2025-04-15',61.00,NULL,74.00,96.00,28.00,56.00,25.5,NULL,NULL,NULL,'2026-06-05 19:24:47'),(38,11,'2025-03-01',54.80,NULL,66.00,90.00,26.00,52.00,21.0,NULL,NULL,NULL,'2026-06-05 19:24:47'),(39,11,'2025-03-15',55.00,NULL,66.00,90.00,26.00,52.00,20.5,NULL,NULL,NULL,'2026-06-05 19:24:47'),(40,11,'2025-04-01',55.10,NULL,66.00,90.00,26.00,52.00,20.0,NULL,NULL,NULL,'2026-06-05 19:24:47'),(41,11,'2025-04-19',55.20,NULL,66.00,90.00,26.00,52.00,19.5,NULL,NULL,NULL,'2026-06-05 19:24:47'),(42,12,'2025-03-15',69.50,NULL,78.00,100.00,28.00,58.00,NULL,NULL,NULL,NULL,'2026-06-05 19:24:47'),(43,12,'2025-04-01',68.50,NULL,78.00,100.00,28.00,58.00,NULL,NULL,NULL,NULL,'2026-06-05 19:24:47'),(44,12,'2025-04-17',67.40,NULL,78.00,100.00,28.00,58.00,NULL,NULL,NULL,NULL,'2026-06-05 19:24:47'),(48,14,'2026-06-05',103.00,NULL,NULL,NULL,NULL,NULL,NULL,31.8,'Peso inicial',NULL,'2026-06-05 22:07:00'),(49,14,'2026-06-12',102.00,NULL,NULL,NULL,NULL,NULL,NULL,31.5,'Se nota con mas energia',NULL,'2026-06-05 22:08:45'),(50,24,'2026-06-06',103.00,NULL,NULL,NULL,NULL,NULL,NULL,31.8,'',NULL,'2026-06-07 04:02:07'),(51,24,'2026-06-13',102.00,NULL,NULL,NULL,NULL,NULL,NULL,31.5,'Anda mas activo',NULL,'2026-06-07 04:14:18'),(52,24,'2026-06-20',101.00,NULL,80.00,100.00,28.00,55.00,28.5,31.2,'Anda al 100 dice',NULL,'2026-06-07 04:15:11'),(53,24,'2026-06-27',100.00,NULL,70.00,90.00,25.00,50.00,25.0,30.9,'Ay va',NULL,'2026-06-07 04:15:51'),(54,24,'2026-07-04',100.00,NULL,NULL,NULL,NULL,NULL,NULL,30.9,'xxx',NULL,'2026-06-07 04:51:53'),(55,24,'2026-07-11',99.00,NULL,NULL,NULL,NULL,NULL,NULL,30.6,'x',NULL,'2026-06-07 04:53:53'),(56,24,'2026-07-18',95.00,NULL,NULL,NULL,NULL,NULL,NULL,29.3,'uffffffffff',NULL,'2026-06-07 19:03:08'),(57,25,'2026-06-07',70.00,NULL,NULL,NULL,NULL,NULL,NULL,24.2,'',NULL,'2026-06-07 19:12:58'),(58,25,'2026-06-07',70.00,NULL,NULL,NULL,NULL,NULL,NULL,24.2,'',NULL,'2026-06-07 19:23:45'),(59,26,'2026-06-07',110.00,NULL,NULL,NULL,NULL,NULL,NULL,32.1,'',NULL,'2026-06-07 19:32:51');
/*!40000 ALTER TABLE `mediciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notas_consulta`
--

DROP TABLE IF EXISTS `notas_consulta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `notas_consulta` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `paciente_id` int(10) unsigned NOT NULL,
  `consulta_id` int(10) unsigned DEFAULT NULL,
  `fecha_consulta` date NOT NULL,
  `contenido` text DEFAULT NULL,
  `nivel_bienestar` enum('muy_mal','mal','neutral','bien','muy_bien') DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `consulta_id` (`consulta_id`),
  KEY `idx_paciente_fecha` (`paciente_id`,`fecha_consulta`),
  CONSTRAINT `notas_consulta_ibfk_1` FOREIGN KEY (`paciente_id`) REFERENCES `pacientes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `notas_consulta_ibfk_2` FOREIGN KEY (`consulta_id`) REFERENCES `consultas` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notas_consulta`
--

LOCK TABLES `notas_consulta` WRITE;
/*!40000 ALTER TABLE `notas_consulta` DISABLE KEYS */;
INSERT INTO `notas_consulta` VALUES (1,14,NULL,'2026-06-07','dasdsadasdsd',NULL,'2026-06-07 03:02:31','2026-06-07 03:02:31'),(2,14,NULL,'2026-06-07','dsadsadasd',NULL,'2026-06-07 03:02:37','2026-06-07 03:02:37');
/*!40000 ALTER TABLE `notas_consulta` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pacientes`
--

DROP TABLE IF EXISTS `pacientes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `pacientes` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `usuario_id` int(10) unsigned NOT NULL,
  `nombre` varchar(150) NOT NULL,
  `edad` tinyint(3) unsigned DEFAULT NULL,
  `sexo` enum('femenino','masculino') DEFAULT NULL,
  `whatsapp` varchar(20) NOT NULL,
  `tipo_consulta` enum('materna','recomp','peso') NOT NULL,
  `peso_actual` decimal(5,2) DEFAULT NULL COMMENT 'kg',
  `altura` decimal(3,2) DEFAULT NULL COMMENT 'm',
  `modalidad` enum('presencial','online') DEFAULT 'presencial',
  `objetivo_principal` text DEFAULT NULL,
  `estado` enum('nueva','activa','seguimiento','inactiva') DEFAULT 'nueva',
  `proxima_cita` datetime DEFAULT NULL,
  `ultima_visita` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `foto_perfil` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_usuario` (`usuario_id`),
  KEY `idx_estado` (`estado`),
  CONSTRAINT `pacientes_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pacientes`
--

LOCK TABLES `pacientes` WRITE;
/*!40000 ALTER TABLE `pacientes` DISABLE KEYS */;
INSERT INTO `pacientes` VALUES (1,1,'Sofía López',28,'femenino','6671234567','materna',72.30,1.62,'presencial','Embarazo saludable','activa',NULL,NULL,'2026-06-05 19:24:42','2026-06-05 19:24:42',NULL),(2,1,'María Rodríguez',32,'femenino','6679876543','recomp',63.10,1.68,'presencial','Ganancia de músculo','activa',NULL,NULL,'2026-06-05 19:24:42','2026-06-05 19:24:42',NULL),(3,1,'Andrea González',24,'femenino','6675551234','peso',78.00,1.60,'presencial','Bajar 8 kg','nueva',NULL,NULL,'2026-06-05 19:24:42','2026-06-05 19:24:42',NULL),(4,1,'Karla Vega',30,'femenino','6678889999','materna',66.50,1.65,'online','Lactancia exclusiva','activa',NULL,NULL,'2026-06-05 19:24:42','2026-06-05 19:24:42',NULL),(5,1,'Isabel Ramos',31,'femenino','6672223333','materna',75.80,1.69,'presencial','Embarazo saludable','activa',NULL,NULL,'2026-06-05 19:24:42','2026-06-05 19:24:42',NULL),(6,1,'María José Pérez',27,'femenino','6675556789','peso',81.20,1.63,'presencial','Bajar 10 kg','seguimiento',NULL,NULL,'2026-06-05 19:24:42','2026-06-05 19:24:42',NULL),(7,1,'Lucía Castro',33,'femenino','6677778888','peso',84.30,1.67,'presencial','Bajar 12 kg','activa',NULL,NULL,'2026-06-05 19:24:42','2026-06-05 19:24:42',NULL),(8,1,'Laura Méndez',29,'femenino','6671112222','recomp',58.40,1.63,'presencial','Definición corporal','activa',NULL,NULL,'2026-06-05 19:24:42','2026-06-05 19:24:42',NULL),(9,1,'Elena Torres',35,'femenino','6673334444','materna',70.20,1.66,'presencial','Embarazo saludable','activa',NULL,NULL,'2026-06-05 19:24:42','2026-06-05 19:24:42',NULL),(10,1,'Sandra Flores',38,'femenino','6674445555','recomp',61.00,1.61,'presencial','Recomposición post 40','activa',NULL,NULL,'2026-06-05 19:24:42','2026-06-05 19:24:42',NULL),(11,1,'Gabriela Morales',26,'femenino','5559998888','recomp',55.20,1.59,'online','Recomposición deportiva','activa',NULL,NULL,'2026-06-05 19:24:42','2026-06-05 19:24:42',NULL),(12,1,'Valeria Cruz',22,'femenino','6699998888','peso',67.40,1.62,'online','Bajar 5 kg','activa',NULL,NULL,'2026-06-05 19:24:42','2026-06-05 19:24:42',NULL),(14,1,'Jesús Jaime Cazares Sainz',22,'masculino','6673576554','peso',102.00,1.80,'presencial','Pesar 80 kg','nueva',NULL,NULL,'2026-06-05 22:07:00','2026-06-05 23:02:54','uploads/perfiles/perfil_14_6a23559e0eb9b.jpeg'),(21,1,'Valeria Gamboa Almendra',NULL,NULL,'6671429084','peso',0.00,0.00,'presencial','','nueva',NULL,NULL,'2026-06-06 03:30:40','2026-06-06 03:30:40',NULL),(22,1,'Hannia',NULL,NULL,'6672295309','peso',0.00,0.00,'presencial','','nueva',NULL,NULL,'2026-06-07 03:47:44','2026-06-07 03:47:44',NULL),(23,1,'Eduardo',NULL,NULL,'6611223300','peso',0.00,0.00,'presencial','','nueva',NULL,NULL,'2026-06-07 03:48:03','2026-06-07 03:48:03',NULL),(24,1,'PEPITO',22,'masculino','6677889952','peso',95.00,1.80,'presencial','','nueva',NULL,'2026-06-07 11:04:46','2026-06-07 03:50:49','2026-06-07 19:03:08',NULL),(25,1,'Lupita',28,'femenino','6666666666','materna',70.00,1.70,'presencial','','nueva',NULL,'2026-06-07 12:23:45','2026-06-07 19:05:20','2026-06-07 19:23:45',NULL),(26,1,'Dariel',22,'masculino','661011121314','',110.00,1.85,'presencial','Bajar de peso','nueva',NULL,'2026-06-07 12:32:51','2026-06-07 19:32:23','2026-06-07 19:32:51',NULL);
/*!40000 ALTER TABLE `pacientes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pendientes`
--

DROP TABLE IF EXISTS `pendientes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `pendientes` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `tipo` enum('nota','lista') NOT NULL DEFAULT 'nota',
  `titulo` varchar(255) NOT NULL DEFAULT '',
  `contenido` text DEFAULT NULL,
  `color` varchar(20) DEFAULT 'sage',
  `items` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`items`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pendientes`
--

LOCK TABLES `pendientes` WRITE;
/*!40000 ALTER TABLE `pendientes` DISABLE KEYS */;
INSERT INTO `pendientes` VALUES (1,'nota','Cosas por hacer','fjagfhjladfk','blush','[]','2026-06-06 04:08:48'),(2,'lista','Lista de compras','','sage','[{\"id\":1,\"texto\":\"dkanfk\\u00f1df\",\"done\":true},{\"id\":2,\"texto\":\"fsdfdsf\",\"done\":false},{\"id\":3,\"texto\":\"fsdfdf\",\"done\":false}]','2026-06-06 04:08:48'),(3,'nota','dasd','dsads','cream','[]','2026-06-06 04:08:48');
/*!40000 ALTER TABLE `pendientes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `peso_bebe`
--

DROP TABLE IF EXISTS `peso_bebe`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `peso_bebe` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `lactancia_id` int(10) unsigned NOT NULL,
  `semana` tinyint(3) unsigned NOT NULL,
  `peso_kg` decimal(4,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `lactancia_id` (`lactancia_id`),
  CONSTRAINT `peso_bebe_ibfk_1` FOREIGN KEY (`lactancia_id`) REFERENCES `lactancia` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `peso_bebe`
--

LOCK TABLES `peso_bebe` WRITE;
/*!40000 ALTER TABLE `peso_bebe` DISABLE KEYS */;
INSERT INTO `peso_bebe` VALUES (1,1,1,3.10,'2026-06-05 19:24:47'),(2,1,4,3.90,'2026-06-05 19:24:47'),(3,1,8,5.20,'2026-06-05 19:24:47'),(4,1,12,6.10,'2026-06-05 19:24:47');
/*!40000 ALTER TABLE `peso_bebe` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `plan_alimentos_seleccionados`
--

DROP TABLE IF EXISTS `plan_alimentos_seleccionados`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `plan_alimentos_seleccionados` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `plan_id` int(10) unsigned NOT NULL,
  `alimento_id` int(10) unsigned NOT NULL,
  `receta_id` int(10) unsigned DEFAULT NULL,
  `tiempo_comida` enum('desayuno','colacion_am','comida','colacion_pm','cena') NOT NULL,
  `dia_semana` enum('lunes','martes','miercoles','jueves','viernes','sabado','domingo') NOT NULL DEFAULT 'lunes',
  `porciones` decimal(4,2) NOT NULL DEFAULT 1.00,
  PRIMARY KEY (`id`),
  KEY `plan_id` (`plan_id`),
  KEY `alimento_id` (`alimento_id`),
  KEY `fk_pas_receta` (`receta_id`),
  CONSTRAINT `fk_pas_receta` FOREIGN KEY (`receta_id`) REFERENCES `recetas` (`id`) ON DELETE SET NULL,
  CONSTRAINT `plan_alimentos_seleccionados_ibfk_1` FOREIGN KEY (`plan_id`) REFERENCES `planes_nutricionales` (`id`) ON DELETE CASCADE,
  CONSTRAINT `plan_alimentos_seleccionados_ibfk_2` FOREIGN KEY (`alimento_id`) REFERENCES `alimentos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `plan_alimentos_seleccionados`
--

LOCK TABLES `plan_alimentos_seleccionados` WRITE;
/*!40000 ALTER TABLE `plan_alimentos_seleccionados` DISABLE KEYS */;
INSERT INTO `plan_alimentos_seleccionados` VALUES (1,13,9,NULL,'desayuno','lunes',3.00),(2,13,68,NULL,'desayuno','lunes',2.00),(3,13,55,NULL,'desayuno','lunes',1.00),(4,13,24,NULL,'desayuno','lunes',3.00),(5,13,64,NULL,'desayuno','lunes',1.00),(6,13,30,NULL,'colacion_am','lunes',1.00),(7,13,56,NULL,'colacion_am','lunes',1.00),(8,13,1,NULL,'comida','lunes',1.00),(9,13,19,NULL,'comida','lunes',1.00),(10,13,55,NULL,'comida','lunes',1.00),(11,13,29,NULL,'colacion_pm','lunes',1.00),(12,13,44,NULL,'cena','lunes',1.00),(13,13,43,NULL,'cena','lunes',1.00),(14,13,42,NULL,'cena','lunes',1.00);
/*!40000 ALTER TABLE `plan_alimentos_seleccionados` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `plan_comidas`
--

DROP TABLE IF EXISTS `plan_comidas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `plan_comidas` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `plan_id` int(10) unsigned NOT NULL,
  `tipo_comida` varchar(50) NOT NULL,
  `hora_recomendada` time DEFAULT NULL,
  `calorias_estimadas` smallint(5) unsigned DEFAULT NULL,
  `descripcion` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `plan_id` (`plan_id`),
  CONSTRAINT `plan_comidas_ibfk_1` FOREIGN KEY (`plan_id`) REFERENCES `planes_nutricionales` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `plan_comidas`
--

LOCK TABLES `plan_comidas` WRITE;
/*!40000 ALTER TABLE `plan_comidas` DISABLE KEYS */;
/*!40000 ALTER TABLE `plan_comidas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `planes_nutricionales`
--

DROP TABLE IF EXISTS `planes_nutricionales`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `planes_nutricionales` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `paciente_id` int(10) unsigned NOT NULL,
  `fecha_creacion` date NOT NULL,
  `calorias_diarias` smallint(5) unsigned DEFAULT NULL,
  `proteina_g` smallint(5) unsigned DEFAULT NULL,
  `carbohidratos_g` smallint(5) unsigned DEFAULT NULL,
  `grasas_g` smallint(5) unsigned DEFAULT NULL,
  `fibra_g` tinyint(3) unsigned DEFAULT NULL,
  `actividad` decimal(5,3) NOT NULL DEFAULT 1.400,
  `agua_litros` decimal(3,1) DEFAULT NULL,
  `descripcion` text DEFAULT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_paciente` (`paciente_id`),
  CONSTRAINT `planes_nutricionales_ibfk_1` FOREIGN KEY (`paciente_id`) REFERENCES `pacientes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `planes_nutricionales`
--

LOCK TABLES `planes_nutricionales` WRITE;
/*!40000 ALTER TABLE `planes_nutricionales` DISABLE KEYS */;
INSERT INTO `planes_nutricionales` VALUES (1,1,'2026-06-05',NULL,NULL,NULL,NULL,NULL,1.400,NULL,'2,200 kcal · 6 tiempos · Hierro 45mg, Ácido Fólico 600mcg, DHA 200mg',1,'2026-06-05 19:24:47','2026-06-05 19:24:47'),(2,2,'2026-06-05',NULL,NULL,NULL,NULL,NULL,1.400,NULL,'2,400 kcal · 35% prot · 40% carbs · 25% grasa · Creatina 5g/día',1,'2026-06-05 19:24:47','2026-06-05 19:24:47'),(3,3,'2026-06-05',NULL,NULL,NULL,NULL,NULL,1.400,NULL,'Por definir en primera consulta',1,'2026-06-05 19:24:47','2026-06-05 19:24:47'),(4,4,'2026-06-05',NULL,NULL,NULL,NULL,NULL,1.400,NULL,'2,500 kcal · alto en proteína y calcio · Suplemento DHA postnatal',1,'2026-06-05 19:24:47','2026-06-05 19:24:47'),(5,5,'2026-06-05',NULL,NULL,NULL,NULL,NULL,1.400,NULL,'2,100 kcal · CHO complejos · 6 tiempos · Sin azúcares simples',1,'2026-06-05 19:24:47','2026-06-05 19:24:47'),(6,6,'2026-06-05',NULL,NULL,NULL,NULL,NULL,1.400,NULL,'1,700 kcal · Bajo índice glucémico · Sin lactosa · Inositol 4g/día',1,'2026-06-05 19:24:47','2026-06-05 19:24:47'),(7,7,'2026-06-05',NULL,NULL,NULL,NULL,NULL,1.400,NULL,'1,700 kcal · Mediterránea · Caminata 30min/día',1,'2026-06-05 19:24:47','2026-06-05 19:24:47'),(8,8,'2026-06-05',NULL,NULL,NULL,NULL,NULL,1.400,NULL,'2,000 kcal · Déficit moderado · Proteína 1.8g/kg',1,'2026-06-05 19:24:47','2026-06-05 19:24:47'),(9,9,'2026-06-05',NULL,NULL,NULL,NULL,NULL,1.400,NULL,'2,000 kcal · 1er trim · Ácido fólico 400mcg',1,'2026-06-05 19:24:47','2026-06-05 19:24:47'),(10,10,'2026-06-05',NULL,NULL,NULL,NULL,NULL,1.400,NULL,'1,900 kcal · Proteína alta · Calcio + Vit D · Fuerza 3x/sem',1,'2026-06-05 19:24:47','2026-06-05 19:24:47'),(11,11,'2026-06-05',NULL,NULL,NULL,NULL,NULL,1.400,NULL,'2,200 kcal · Periodización · Carbs altos en días largos',1,'2026-06-05 19:24:47','2026-06-05 19:24:47'),(12,12,'2026-06-05',NULL,NULL,NULL,NULL,NULL,1.400,NULL,'1,600 kcal · Flexible · Recetas para estudiantes',1,'2026-06-05 19:24:47','2026-06-05 19:24:47'),(13,14,'2026-06-08',2805,210,316,78,38,1.375,NULL,'',1,'2026-06-07 22:40:07','2026-06-07 22:40:07');
/*!40000 ALTER TABLE `planes_nutricionales` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `preferencias_alimentos`
--

DROP TABLE IF EXISTS `preferencias_alimentos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `preferencias_alimentos` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `paciente_id` int(10) unsigned NOT NULL,
  `alimento_id` int(10) unsigned NOT NULL,
  `excluido` tinyint(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_pref` (`paciente_id`,`alimento_id`),
  KEY `alimento_id` (`alimento_id`),
  CONSTRAINT `preferencias_alimentos_ibfk_1` FOREIGN KEY (`paciente_id`) REFERENCES `pacientes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `preferencias_alimentos_ibfk_2` FOREIGN KEY (`alimento_id`) REFERENCES `alimentos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `preferencias_alimentos`
--

LOCK TABLES `preferencias_alimentos` WRITE;
/*!40000 ALTER TABLE `preferencias_alimentos` DISABLE KEYS */;
/*!40000 ALTER TABLE `preferencias_alimentos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `receta_ingredientes`
--

DROP TABLE IF EXISTS `receta_ingredientes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `receta_ingredientes` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `receta_id` int(10) unsigned NOT NULL,
  `alimento_id` int(10) unsigned NOT NULL,
  `cantidad` decimal(5,2) NOT NULL DEFAULT 1.00,
  `orden` tinyint(3) unsigned NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `receta_id` (`receta_id`),
  KEY `alimento_id` (`alimento_id`),
  CONSTRAINT `receta_ingredientes_ibfk_1` FOREIGN KEY (`receta_id`) REFERENCES `recetas` (`id`) ON DELETE CASCADE,
  CONSTRAINT `receta_ingredientes_ibfk_2` FOREIGN KEY (`alimento_id`) REFERENCES `alimentos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `receta_ingredientes`
--

LOCK TABLES `receta_ingredientes` WRITE;
/*!40000 ALTER TABLE `receta_ingredientes` DISABLE KEYS */;
INSERT INTO `receta_ingredientes` VALUES (1,1,9,2.00,0),(2,1,68,2.00,1),(3,1,55,1.00,2),(4,2,9,3.00,0),(5,2,67,1.00,1),(6,2,55,1.00,2),(7,3,20,1.00,0),(8,3,30,1.00,1),(9,3,63,1.00,2),(10,4,62,1.00,0),(11,4,70,0.50,1),(12,4,31,1.00,2),(13,5,62,1.00,0),(14,5,70,0.50,1),(15,6,63,1.00,0),(16,6,30,1.00,1),(17,6,20,0.50,2),(18,7,29,1.00,0),(19,7,57,0.50,1),(20,8,1,1.00,0),(21,8,18,1.00,1),(22,8,55,1.00,2),(23,9,4,1.00,0),(24,9,18,1.00,1),(25,9,47,1.00,2),(26,9,55,1.00,3),(27,10,1,1.00,0),(28,10,41,1.00,1),(29,10,43,1.00,2),(30,10,55,1.00,3),(31,11,62,1.00,0),(32,11,31,1.00,1),(33,12,30,1.00,0),(34,12,56,0.50,1),(35,13,65,1.00,0),(36,13,29,1.00,1),(37,14,9,2.00,0),(38,14,42,1.00,1),(39,14,47,1.00,2),(40,14,55,1.00,3),(41,15,1,1.00,0),(42,15,41,1.00,1),(43,15,55,1.00,2),(44,16,44,1.00,0),(45,16,43,1.00,1),(46,16,42,1.00,2);
/*!40000 ALTER TABLE `receta_ingredientes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `recetas`
--

DROP TABLE IF EXISTS `recetas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `recetas` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(150) NOT NULL,
  `emoji` varchar(10) NOT NULL DEFAULT '?',
  `categoria` enum('Desayuno','Colación AM','Comida','Colación PM','Cena') NOT NULL,
  `descripcion` varchar(255) NOT NULL DEFAULT '',
  `preparacion` text DEFAULT NULL,
  `color` varchar(20) NOT NULL DEFAULT '#f5f5f5',
  `border` varchar(20) NOT NULL DEFAULT '#999999',
  `creado_en` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `recetas`
--

LOCK TABLES `recetas` WRITE;
/*!40000 ALTER TABLE `recetas` DISABLE KEYS */;
INSERT INTO `recetas` VALUES (1,'Huevo con jamón','🍳','Desayuno','Clásico desayuno proteico','1. Calienta el aceite en un sartén antiadherente a fuego medio.\n2. Agrega el jamón de pavo y dora 1-2 minutos por lado.\n3. Bate los huevos e incorpóralos al sartén; cocina revolviendo suavemente hasta que cuajen.\n4. Sirve caliente.','#fff8f5','#c4714a','2026-06-18 22:28:31'),(2,'Omelette de queso','🍳','Desayuno','Esponjoso y proteico','1. Bate los huevos con una pizca de sal.\n2. Calienta el aceite en un sartén a fuego medio-bajo y vierte el huevo batido.\n3. Cuando los bordes cuajen, agrega el queso de un lado y dobla el omelette por la mitad.\n4. Cocina 1 minuto más y sirve.','#fffbf0','#d4a843','2026-06-18 22:28:31'),(3,'Avena con fruta','🥣','Desayuno','Fibra + energía sostenida','1. Cuece la avena con agua o leche a fuego medio durante 5 minutos, moviendo ocasionalmente.\n2. Retira del fuego y deja reposar 2 minutos.\n3. Sirve en un tazón y corona con el plátano rebanado.\n4. Agrega la leche restante encima al gusto.','#f0f7ff','#5b8fb0','2026-06-18 22:28:31'),(4,'Yogur con granola y fruta','🥣','Desayuno','Desayuno fresco y equilibrado','1. Coloca el yogur griego en un tazón.\n2. Agrega la granola encima.\n3. Corona con las fresas cortadas en mitades.\n4. Sirve de inmediato para mantener la granola crujiente.','#fff5f8','#e8739a','2026-06-18 22:28:31'),(5,'Yogur con granola','🥛','Colación AM','Alto en proteína, snack ideal','1. Sirve el yogur griego en un vaso o tazón.\n2. Agrega la granola justo antes de comer para que no se humedezca.\n3. Mezcla ligeramente y disfruta.','#fff5f8','#e8739a','2026-06-18 22:28:31'),(6,'Licuado proteico','🥤','Colación AM','Post entreno / snack energético','1. Coloca la leche, el plátano y la avena en la licuadora.\n2. Licúa 30-45 segundos hasta obtener una mezcla homogénea.\n3. Sirve frío, de preferencia con hielo.','#fff8f5','#c4714a','2026-06-18 22:28:31'),(7,'Fruta con nueces','🍎','Colación AM','Energía rápida y grasas saludables','1. Lava y rebana la manzana.\n2. Sirve junto con las nueces picadas.\n3. Listo para comer, ideal para llevar.','#fffbf0','#d4a843','2026-06-18 22:28:31'),(8,'Pollo con arroz','🍗','Comida','Proteína magra + carbohidrato','1. Sazona la pechuga de pollo y cocínala en el aceite a fuego medio 5-6 minutos por lado hasta dorar y cocer por completo.\n2. Cuece el arroz integral según las instrucciones del paquete.\n3. Rebana el pollo y sirve junto con el arroz.','#f5faf5','#6b9e78','2026-06-18 22:28:31'),(9,'Atún con arroz y verduras','🐟','Comida','Rico en omega-3 y fibra','1. Cuece el arroz integral.\n2. Escurre el atún y mézclalo con el jitomate picado y el aceite de oliva.\n3. Sirve el atún sobre el arroz caliente.','#f0f7ff','#5b8fb0','2026-06-18 22:28:31'),(10,'Pollo con verduras al vapor','🥦','Comida','Ligero, nutritivo y bajo en grasa','1. Cocina la pechuga de pollo a la plancha con un poco de aceite hasta dorar por ambos lados.\n2. Cuece el brócoli y la zanahoria al vapor 6-8 minutos hasta que estén suaves pero firmes.\n3. Sirve el pollo rebanado junto con las verduras y rocía con el aceite restante.','#f0fff4','#4a9e6b','2026-06-18 22:28:31'),(11,'Fruta con yogur','🍓','Colación PM','Snack dulce y proteico','1. Sirve el yogur griego en un tazón.\n2. Corona con las fresas cortadas en mitades.\n3. Disfruta de inmediato.','#fff5f8','#e8739a','2026-06-18 22:28:31'),(12,'Plátano con almendras','🍌','Colación PM','Energía + grasas saludables','1. Pela y rebana el plátano.\n2. Sirve junto con las almendras.\n3. Ideal como snack rápido entre comidas.','#fffbf0','#d4a843','2026-06-18 22:28:31'),(13,'Queso cottage con fruta','🧀','Colación PM','Proteína + antioxidantes','1. Sirve el queso cottage en un tazón.\n2. Corta la manzana en cubos y agrégala encima.\n3. Mezcla ligeramente y sirve frío.','#f0f7ff','#5b8fb0','2026-06-18 22:28:31'),(14,'Huevos revueltos con verduras','🥚','Cena','Ligero y proteico para la noche','1. Calienta el aceite en un sartén y sofríe la espinaca y el jitomate picado 2-3 minutos.\n2. Bate los huevos e incorpóralos al sartén.\n3. Revuelve constantemente a fuego medio-bajo hasta que cuajen.\n4. Sirve caliente.','#fff8f5','#c4714a','2026-06-18 22:28:31'),(15,'Pechuga a la plancha','🍗','Cena','Proteína sin exceso de calorías','1. Sazona la pechuga de pollo y cocínala en el aceite a fuego medio 5-6 minutos por lado hasta dorar.\n2. Cuece el brócoli al vapor 5-6 minutos.\n3. Sirve el pollo rebanado junto con el brócoli.','#f5faf5','#6b9e78','2026-06-18 22:28:31'),(16,'Sopa de verduras','🥣','Cena','Reconfortante y baja en calorías','1. Corta la calabaza, la zanahoria y la espinaca en trozos pequeños.\n2. Coloca la calabaza y la zanahoria en una olla con agua o caldo de verduras y cocina a fuego medio 12-15 minutos.\n3. Agrega la espinaca los últimos 2 minutos de cocción.\n4. Sazona al gusto y sirve caliente.','#f0f7ff','#5b8fb0','2026-06-18 22:28:31');
/*!40000 ALTER TABLE `recetas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `recibos`
--

DROP TABLE IF EXISTS `recibos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `recibos` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `finanza_id` int(10) unsigned NOT NULL,
  `folio` varchar(20) DEFAULT NULL,
  `concepto` varchar(200) DEFAULT NULL,
  `monto` decimal(10,2) DEFAULT NULL,
  `fecha` date DEFAULT NULL,
  `enviado_whatsapp` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `folio` (`folio`),
  KEY `finanza_id` (`finanza_id`),
  CONSTRAINT `recibos_ibfk_1` FOREIGN KEY (`finanza_id`) REFERENCES `finanzas` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `recibos`
--

LOCK TABLES `recibos` WRITE;
/*!40000 ALTER TABLE `recibos` DISABLE KEYS */;
/*!40000 ALTER TABLE `recibos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `recuentos_24h`
--

DROP TABLE IF EXISTS `recuentos_24h`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `recuentos_24h` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `paciente_id` int(10) unsigned NOT NULL,
  `fecha_recuento` date NOT NULL,
  `agua` varchar(50) DEFAULT NULL,
  `nota` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `paciente_id` (`paciente_id`),
  CONSTRAINT `recuentos_24h_ibfk_1` FOREIGN KEY (`paciente_id`) REFERENCES `pacientes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `recuentos_24h`
--

LOCK TABLES `recuentos_24h` WRITE;
/*!40000 ALTER TABLE `recuentos_24h` DISABLE KEYS */;
INSERT INTO `recuentos_24h` VALUES (1,1,'2025-04-28','1.5 L','Le cuesta tomar agua, prefiere agua de sabor sin azúcar','2026-06-05 19:24:47'),(2,2,'2025-04-25','2.8 L','Muy buena hidratación. Plan muy bien seguido este día.','2026-06-05 19:24:47'),(3,4,'2025-04-20','2.0 L','Aumentar ingesta calórica y de hierro','2026-06-05 19:24:47'),(4,5,'2025-04-24','2.5 L','Buen apego. Evita azúcares. Porciones de carbohidratos controladas.','2026-06-05 19:24:47'),(5,6,'2025-04-18','0.8 L','Comidas irregulares. Poca hidratación. Saltó desayuno temprano.','2026-06-05 19:24:47'),(6,7,'2025-04-15','1.8 L','Buen apego. Puede mejorar hidratación.','2026-06-05 19:24:47'),(7,8,'2025-04-28','2.5 L','Adherencia excelente. Plan muy bien seguido.','2026-06-05 19:24:47'),(8,9,'2025-04-22','1.5 L','Náuseas dificultan ingesta matutina. Tolera bien alimentos bland.','2026-06-05 19:24:47'),(9,10,'2025-04-21','2.2 L','Muy buena adherencia. Plan bien seguido.','2026-06-05 19:24:47'),(10,11,'2025-04-19','3.2 L','Excelente hidratación. Plan bien periodizado.','2026-06-05 19:24:47'),(11,12,'2025-04-17','1.2 L','Horarios irregulares por universidad. Mejorar estructura de tiempos.','2026-06-05 19:24:47');
/*!40000 ALTER TABLE `recuentos_24h` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `suplementacion`
--

DROP TABLE IF EXISTS `suplementacion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `suplementacion` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `paciente_id` int(10) unsigned NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `dosis` varchar(100) DEFAULT NULL,
  `frecuencia` varchar(50) DEFAULT NULL,
  `razon` varchar(200) DEFAULT NULL,
  `fecha_inicio` date DEFAULT NULL,
  `fecha_fin` date DEFAULT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `paciente_id` (`paciente_id`),
  CONSTRAINT `suplementacion_ibfk_1` FOREIGN KEY (`paciente_id`) REFERENCES `pacientes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `suplementacion`
--

LOCK TABLES `suplementacion` WRITE;
/*!40000 ALTER TABLE `suplementacion` DISABLE KEYS */;
/*!40000 ALTER TABLE `suplementacion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tiempos_comida`
--

DROP TABLE IF EXISTS `tiempos_comida`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tiempos_comida` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `recuento_id` int(10) unsigned NOT NULL,
  `tipo_comida` varchar(50) NOT NULL COMMENT 'Desayuno, Colación, Comida, Cena…',
  `hora` time DEFAULT NULL,
  `alimentos` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `recuento_id` (`recuento_id`),
  CONSTRAINT `tiempos_comida_ibfk_1` FOREIGN KEY (`recuento_id`) REFERENCES `recuentos_24h` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tiempos_comida`
--

LOCK TABLES `tiempos_comida` WRITE;
/*!40000 ALTER TABLE `tiempos_comida` DISABLE KEYS */;
INSERT INTO `tiempos_comida` VALUES (1,1,'Desayuno','08:00:00','Avena 1 taza + plátano + leche 1 vaso','2026-06-05 19:24:47'),(2,1,'Colación','11:00:00','Manzana + 10 almendras','2026-06-05 19:24:47'),(3,1,'Comida','02:30:00','Caldo de pollo + arroz 1 taza + ensalada','2026-06-05 19:24:47'),(4,1,'Colación','05:00:00','Yogurt natural + granola','2026-06-05 19:24:47'),(5,1,'Cena','08:00:00','Huevo 2 pzs + frijoles + tortillas 2','2026-06-05 19:24:47'),(6,2,'Pre-entreno','06:00:00','Plátano + café negro','2026-06-05 19:24:47'),(7,2,'Post-entreno','08:30:00','Proteína whey 1 scoop + leche','2026-06-05 19:24:47'),(8,2,'Desayuno','09:30:00','Huevo 3 pzs + avocado + tostadas integrales','2026-06-05 19:24:47'),(9,2,'Comida','02:00:00','Pechuga 200g + arroz + brócoli','2026-06-05 19:24:47'),(10,2,'Cena','08:00:00','Salmón 150g + ensalada + camote','2026-06-05 19:24:47'),(11,3,'Madrugada','03:00:00','Vaso de leche + galletas','2026-06-05 19:24:47'),(12,3,'Desayuno','09:00:00','Licuado de plátano y avena + tostadas','2026-06-05 19:24:47'),(13,3,'Comida','02:00:00','Caldo de res + frijoles + arroz','2026-06-05 19:24:47'),(14,3,'Merienda','05:00:00','Fruta + queso','2026-06-05 19:24:47'),(15,3,'Cena','09:00:00','Quesadillas 2 + nopales','2026-06-05 19:24:47'),(16,4,'Desayuno','07:30:00','2 huevos + 1 tortilla + nopales + café sin azúcar','2026-06-05 19:24:47'),(17,4,'Colación','10:30:00','1 manzana pequeña + queso panela 30g','2026-06-05 19:24:47'),(18,4,'Comida','02:00:00','Pollo 150g + calabaza + arroz integral ½ taza','2026-06-05 19:24:47'),(19,4,'Colación','05:30:00','Pepino + jícama + limón (sin chili)','2026-06-05 19:24:47'),(20,4,'Cena','07:30:00','Sopa de verduras + 1 rebanada pan integral','2026-06-05 19:24:47'),(21,5,'Desayuno','10:00:00','Café con leche + pan dulce','2026-06-05 19:24:47'),(22,5,'Comida','03:00:00','Tacos de carnitas x3 + agua de Jamaica','2026-06-05 19:24:47'),(23,5,'Merienda','06:00:00','Papitas + refresco','2026-06-05 19:24:47'),(24,5,'Cena','09:30:00','Cereal con leche','2026-06-05 19:24:47'),(25,6,'Desayuno','07:00:00','Yogurt + fruta + café','2026-06-05 19:24:47'),(26,6,'Colación','10:30:00','Nueces + manzana','2026-06-05 19:24:47'),(27,6,'Comida','02:30:00','Sopa de verduras + pollo + ensalada','2026-06-05 19:24:47'),(28,6,'Cena','07:30:00','Quesadillas 2 + frijoles','2026-06-05 19:24:47'),(29,7,'Pre-entreno','06:30:00','Plátano + café','2026-06-05 19:24:47'),(30,7,'Post-entreno','09:00:00','Whey protein + agua','2026-06-05 19:24:47'),(31,7,'Desayuno','10:00:00','Huevo 3 pzs + avocado + pan integral','2026-06-05 19:24:47'),(32,7,'Comida','02:00:00','Pechuga + quinoa + brócoli','2026-06-05 19:24:47'),(33,7,'Cena','08:00:00','Salmón + ensalada + aguacate','2026-06-05 19:24:47'),(34,8,'Desayuno','08:00:00','Galletas saladas + té + manzana (náuseas)','2026-06-05 19:24:47'),(35,8,'Colación','11:00:00','Yogurt + granola','2026-06-05 19:24:47'),(36,8,'Comida','02:00:00','Sopa de pasta + pechuga + ensalada','2026-06-05 19:24:47'),(37,8,'Cena','08:00:00','Quesadillas + frijoles','2026-06-05 19:24:47'),(38,9,'Desayuno','07:30:00','Avena + proteína + frutos rojos','2026-06-05 19:24:47'),(39,9,'Colación','11:00:00','Nueces + té verde','2026-06-05 19:24:47'),(40,9,'Comida','02:00:00','Salmon + quinoa + espinacas','2026-06-05 19:24:47'),(41,9,'Cena','07:30:00','Tofu + verduras salteadas','2026-06-05 19:24:47'),(42,10,'Pre-carrera','06:00:00','Plátano + gel energético','2026-06-05 19:24:47'),(43,10,'Post-carrera','08:30:00','Licuado proteína + avena','2026-06-05 19:24:47'),(44,10,'Almuerzo','11:00:00','Huevo 3 pzs + tostadas + aguacate','2026-06-05 19:24:47'),(45,10,'Comida','02:00:00','Pechuga + pasta integral + brócoli','2026-06-05 19:24:47'),(46,10,'Cena','08:00:00','Atún + camote + ensalada','2026-06-05 19:24:47'),(47,11,'Desayuno','10:00:00','Cereal + leche','2026-06-05 19:24:47'),(48,11,'Comida','03:00:00','Comida de cafetería + agua','2026-06-05 19:24:47'),(49,11,'Cena','09:00:00','Tacos x2 + agua de sabor','2026-06-05 19:24:47');
/*!40000 ALTER TABLE `tiempos_comida` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `usuarios` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(150) NOT NULL,
  `cedula_profesional` varchar(30) DEFAULT NULL,
  `especialidades` text DEFAULT NULL,
  `whatsapp` varchar(20) DEFAULT NULL,
  `instagram` varchar(100) DEFAULT NULL,
  `afiliacion` varchar(150) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (1,'Diana Zavala','15304166',NULL,'6673056211','@gestanut',NULL,'diana@gestanut.mx','$2y$10$/3tE.2Kl/HUeUVkOi.OrPOrzJEJI68ZHv9oZXWXsVtiyyqBO2rkWG','2026-06-05 19:24:42','2026-06-05 19:24:42');
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'gestanut'
--

--
-- Dumping routines for database 'gestanut'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-06-23 18:05:38
