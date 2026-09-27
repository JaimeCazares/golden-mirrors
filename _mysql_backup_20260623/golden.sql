-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: golden
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
-- Current Database: `golden`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `golden` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci */;

USE `golden`;

--
-- Table structure for table `ahorro`
--

DROP TABLE IF EXISTS `ahorro`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ahorro` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `usuario` varchar(50) NOT NULL,
  `monto` int(11) NOT NULL,
  `total_veces` int(11) NOT NULL,
  `marcadas` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_reto` (`usuario`,`monto`),
  UNIQUE KEY `uniq_usuario_monto` (`usuario`,`monto`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ahorro`
--

LOCK TABLES `ahorro` WRITE;
/*!40000 ALTER TABLE `ahorro` DISABLE KEYS */;
INSERT INTO `ahorro` VALUES (1,'vale',500,6,0),(2,'vale',200,12,0),(3,'vale',100,22,0),(4,'vale',50,26,0),(5,'vale',20,28,0),(6,'vale',10,26,1),(7,'vale',5,36,0),(8,'vale',2,42,0),(9,'vale',1,50,0);
/*!40000 ALTER TABLE `ahorro` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cupones`
--

DROP TABLE IF EXISTS `cupones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cupones` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `folio` int(11) NOT NULL,
  `monto` int(11) NOT NULL,
  `fecha` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cupones`
--

LOCK TABLES `cupones` WRITE;
/*!40000 ALTER TABLE `cupones` DISABLE KEYS */;
INSERT INTO `cupones` VALUES (1,1,500,'2026-01-09 16:02:03'),(2,2,200,'2026-01-09 16:04:53'),(3,3,1,'2026-01-09 16:05:23');
/*!40000 ALTER TABLE `cupones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `deudas_estado`
--

DROP TABLE IF EXISTS `deudas_estado`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `deudas_estado` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `monto` int(11) NOT NULL,
  `pagada` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `deudas_estado`
--

LOCK TABLES `deudas_estado` WRITE;
/*!40000 ALTER TABLE `deudas_estado` DISABLE KEYS */;
INSERT INTO `deudas_estado` VALUES (1,'Stori',1000,1),(2,'Undostres',2000,1),(3,'Plata',2000,1),(4,'Mercado Pago',3000,1),(5,'Mercado Libre',3000,1),(6,'Nu',6000,0),(7,'Rappi',8000,0),(8,'BBVA',20000,0);
/*!40000 ALTER TABLE `deudas_estado` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `gastos_historial`
--

DROP TABLE IF EXISTS `gastos_historial`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `gastos_historial` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `descripcion` varchar(255) NOT NULL,
  `monto` decimal(10,2) NOT NULL,
  `metodo` varchar(20) NOT NULL,
  `fecha` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `gastos_historial`
--

LOCK TABLES `gastos_historial` WRITE;
/*!40000 ALTER TABLE `gastos_historial` DISABLE KEYS */;
INSERT INTO `gastos_historial` VALUES (2,'Recarga a mi cel',100.00,'debito','2026-02-16 21:12:01'),(3,'Sobres para cartas',29.00,'debito','2026-02-16 21:12:09'),(4,'Pay de limon Costco',199.00,'debito','2026-02-16 21:12:34');
/*!40000 ALTER TABLE `gastos_historial` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `nutricion_actividad`
--

DROP TABLE IF EXISTS `nutricion_actividad`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `nutricion_actividad` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `fecha` date NOT NULL,
  `calorias` int(11) DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `fecha` (`fecha`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `nutricion_actividad`
--

LOCK TABLES `nutricion_actividad` WRITE;
/*!40000 ALTER TABLE `nutricion_actividad` DISABLE KEYS */;
/*!40000 ALTER TABLE `nutricion_actividad` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `nutricion_dias`
--

DROP TABLE IF EXISTS `nutricion_dias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `nutricion_dias` (
  `fecha` date NOT NULL,
  `plan_json` longtext DEFAULT NULL,
  `suplementos_json` longtext DEFAULT NULL,
  `miband` int(11) DEFAULT 0,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`fecha`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `nutricion_dias`
--

LOCK TABLES `nutricion_dias` WRITE;
/*!40000 ALTER TABLE `nutricion_dias` DISABLE KEYS */;
INSERT INTO `nutricion_dias` VALUES ('2026-06-19','{\"desayuno\":[{\"nombre\":\"Huevo entero\",\"categoria\":\"Prote\\u00ednas\",\"emoji\":\"\\ud83e\\udd5a\",\"porcion\":\"1 pieza\",\"calorias\":78,\"proteina\":6.3,\"carbos\":0.6,\"grasa\":5.3,\"fibra\":0,\"id\":2,\"grasas\":5.3,\"porcion_desc\":\"1 pieza\",\"excluido\":false,\"alimento_id\":2,\"porciones\":3},{\"nombre\":\"Tortilla de ma\\u00edz\",\"categoria\":\"Carbohidratos\",\"emoji\":\"\\ud83c\\udf3d\",\"porcion\":\"1 pieza\",\"calorias\":52,\"proteina\":1.4,\"carbos\":11,\"grasa\":0.6,\"fibra\":1.4,\"id\":18,\"grasas\":0.6,\"porcion_desc\":\"1 pieza\",\"excluido\":false,\"alimento_id\":18,\"porciones\":3},{\"nombre\":\"Aceite de oliva\",\"categoria\":\"Grasas\",\"emoji\":\"\\ud83e\\uded2\",\"porcion\":\"1 cda (14 g)\",\"calorias\":119,\"proteina\":0,\"carbos\":0,\"grasa\":14,\"fibra\":0,\"id\":58,\"grasas\":14,\"porcion_desc\":\"1 cda (14 g)\",\"excluido\":false,\"alimento_id\":58,\"porciones\":1},{\"nombre\":\"Leche entera\",\"categoria\":\"L\\u00e1cteos\",\"emoji\":\"\\ud83e\\udd5b\",\"porcion\":\"1 taza (244 g)\",\"calorias\":149,\"proteina\":7.7,\"carbos\":12,\"grasa\":8,\"fibra\":0,\"id\":49,\"grasas\":8,\"porcion_desc\":\"1 taza (244 g)\",\"excluido\":false,\"alimento_id\":49,\"porciones\":1}],\"colacion_am\":[],\"comida\":[{\"nombre\":\"Birria \\/ consom\\u00e9 de chamberete deshebrado\",\"categoria\":\"Prote\\u00ednas\",\"emoji\":\"\\ud83c\\udf72\",\"porcion\":\"1 taz\\u00f3n\",\"calorias\":380,\"proteina\":40,\"carbos\":3,\"grasa\":22,\"fibra\":0,\"id\":15,\"grasas\":22,\"porcion_desc\":\"1 taz\\u00f3n\",\"excluido\":false,\"alimento_id\":15,\"porciones\":1},{\"nombre\":\"Tortilla de ma\\u00edz\",\"categoria\":\"Carbohidratos\",\"emoji\":\"\\ud83c\\udf3d\",\"porcion\":\"1 pieza\",\"calorias\":52,\"proteina\":1.4,\"carbos\":11,\"grasa\":0.6,\"fibra\":1.4,\"id\":18,\"grasas\":0.6,\"porcion_desc\":\"1 pieza\",\"excluido\":false,\"alimento_id\":18,\"porciones\":2},{\"nombre\":\"Cebolla morada\",\"categoria\":\"Verduras\",\"emoji\":\"\\ud83e\\uddc5\",\"porcion\":\"1\\/4 taza picada (40 g)\",\"calorias\":16,\"proteina\":0.4,\"carbos\":3.7,\"grasa\":0,\"fibra\":0.7,\"id\":46,\"grasas\":0,\"porcion_desc\":\"1\\/4 taza picada (40 g)\",\"excluido\":false,\"alimento_id\":46,\"porciones\":1},{\"nombre\":\"Lim\\u00f3n\",\"categoria\":\"Verduras\",\"emoji\":\"\\ud83c\\udf4b\",\"porcion\":\"1 pieza (67 g)\",\"calorias\":20,\"proteina\":0.5,\"carbos\":7,\"grasa\":0.2,\"fibra\":1.9,\"id\":47,\"grasas\":0.2,\"porcion_desc\":\"1 pieza (67 g)\",\"excluido\":false,\"alimento_id\":47,\"porciones\":0.5}],\"colacion_pm\":[],\"cena\":[{\"nombre\":\"Frijoles cocidos\",\"categoria\":\"Carbohidratos\",\"emoji\":\"\\ud83e\\uded8\",\"porcion\":\"1 taza (172 g)\",\"calorias\":245,\"proteina\":15,\"carbos\":45,\"grasa\":1,\"fibra\":15,\"id\":25,\"grasas\":1,\"porcion_desc\":\"1 taza (172 g)\",\"excluido\":false,\"alimento_id\":25,\"porciones\":1},{\"nombre\":\"Tortilla de harina\",\"categoria\":\"Carbohidratos\",\"emoji\":\"\\ud83e\\uded3\",\"porcion\":\"1 pieza\",\"calorias\":94,\"proteina\":2.5,\"carbos\":15,\"grasa\":2.5,\"fibra\":0.9,\"id\":19,\"grasas\":2.5,\"porcion_desc\":\"1 pieza\",\"excluido\":false,\"alimento_id\":19,\"porciones\":5},{\"nombre\":\"Queso asadero\",\"categoria\":\"L\\u00e1cteos\",\"emoji\":\"\\ud83e\\uddc0\",\"porcion\":\"50 g\",\"calorias\":153,\"proteina\":10.5,\"carbos\":1.5,\"grasa\":12,\"fibra\":0,\"id\":54,\"grasas\":12,\"porcion_desc\":\"50 g\",\"excluido\":false,\"alimento_id\":54,\"porciones\":1.5}]}','[]',1000,'2026-06-21 17:01:42'),('2026-06-20','{\"desayuno\":[{\"nombre\":\"Taco de camar\\u00f3n y quesadilla con fresca\",\"categoria\":\"Antojitos\",\"emoji\":\"\\ud83c\\udf2e\",\"porcion\":\"1 orden\",\"calorias\":975,\"proteina\":36,\"carbos\":117,\"grasa\":37,\"fibra\":6,\"id\":69,\"grasas\":37,\"porcion_desc\":\"1 orden\",\"excluido\":false,\"alimento_id\":69,\"porciones\":1}],\"colacion_am\":[],\"comida\":[{\"nombre\":\"Ensalada de at\\u00fan de mam\\u00e1\",\"categoria\":\"Antojitos\",\"emoji\":\"\\ud83e\\udd57\",\"porcion\":\"1 porci\\u00f3n\",\"calorias\":430,\"proteina\":26,\"carbos\":22,\"grasa\":28.5,\"fibra\":4,\"id\":70,\"grasas\":28.5,\"porcion_desc\":\"1 porci\\u00f3n\",\"excluido\":false,\"alimento_id\":70,\"porciones\":1},{\"nombre\":\"Tostada de ma\\u00edz\",\"categoria\":\"Carbohidratos\",\"emoji\":\"\\ud83c\\udf3d\",\"porcion\":\"1 pieza\",\"calorias\":55,\"proteina\":1.5,\"carbos\":11,\"grasa\":0.7,\"fibra\":1.5,\"id\":71,\"grasas\":0.7,\"porcion_desc\":\"1 pieza\",\"excluido\":false,\"alimento_id\":71,\"porciones\":3}],\"colacion_pm\":[],\"cena\":[]}','[]',900,'2026-06-21 17:01:42');
/*!40000 ALTER TABLE `nutricion_dias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `nutricion_log`
--

DROP TABLE IF EXISTS `nutricion_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `nutricion_log` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `fecha` date NOT NULL,
  `tipo` enum('comida','ejercicio') DEFAULT 'comida',
  `nombre` varchar(200) NOT NULL,
  `calorias` decimal(8,1) DEFAULT 0.0,
  `proteina` decimal(8,1) DEFAULT 0.0,
  `carbos` decimal(8,1) DEFAULT 0.0,
  `grasa` decimal(8,1) DEFAULT 0.0,
  `fibra` decimal(8,1) DEFAULT 0.0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `nutricion_log`
--

LOCK TABLES `nutricion_log` WRITE;
/*!40000 ALTER TABLE `nutricion_log` DISABLE KEYS */;
/*!40000 ALTER TABLE `nutricion_log` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `nutricion_metas`
--

DROP TABLE IF EXISTS `nutricion_metas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `nutricion_metas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `fecha` date NOT NULL,
  `bmr` int(11) DEFAULT 0,
  `kcal` int(11) DEFAULT 0,
  `prot` int(11) DEFAULT 0,
  `carbs` int(11) DEFAULT 0,
  `grasas` int(11) DEFAULT 0,
  `fibra` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `fecha` (`fecha`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `nutricion_metas`
--

LOCK TABLES `nutricion_metas` WRITE;
/*!40000 ALTER TABLE `nutricion_metas` DISABLE KEYS */;
/*!40000 ALTER TABLE `nutricion_metas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `peso_actual`
--

DROP TABLE IF EXISTS `peso_actual`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `peso_actual` (
  `id` int(11) NOT NULL,
  `peso` decimal(5,2) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `peso_actual`
--

LOCK TABLES `peso_actual` WRITE;
/*!40000 ALTER TABLE `peso_actual` DISABLE KEYS */;
INSERT INTO `peso_actual` VALUES (1,101.00);
/*!40000 ALTER TABLE `peso_actual` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `peso_historial`
--

DROP TABLE IF EXISTS `peso_historial`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `peso_historial` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `peso` decimal(5,2) NOT NULL,
  `fecha` date NOT NULL,
  `semana` int(11) NOT NULL,
  `foto_frente` varchar(255) DEFAULT NULL,
  `foto_lado` varchar(255) DEFAULT NULL,
  `foto_atras` varchar(255) DEFAULT NULL,
  `creado_en` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `peso_historial`
--

LOCK TABLES `peso_historial` WRITE;
/*!40000 ALTER TABLE `peso_historial` DISABLE KEYS */;
INSERT INTO `peso_historial` VALUES (1,110.00,'2026-01-18',0,'uploads/peso/1768707517_foto_frente_696c55bd16a25.jpeg','uploads/peso/1768707517_foto_lado_696c55bd16c7e.jpeg','uploads/peso/1768707517_foto_atras_696c55bd16e60.jpeg','2026-01-18 03:38:37'),(2,106.00,'2026-01-18',1,'uploads/peso/1768717104_foto_frente_696c7b30833df.jpg','uploads/peso/1768717104_foto_lado_696c7b3083674.png','uploads/peso/1768717104_foto_atras_696c7b30838f6.jpg','2026-01-18 06:18:24'),(3,105.00,'2026-01-18',2,'uploads/peso/1768720601_foto_frente_696c88d99adcd.jpg','uploads/peso/1768720601_foto_lado_696c88d99b07a.png','uploads/peso/1768720601_foto_atras_696c88d99b2ef.jpg','2026-01-18 07:16:41');
/*!40000 ALTER TABLE `peso_historial` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reto_escalera`
--

DROP TABLE IF EXISTS `reto_escalera`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `reto_escalera` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `dia_actual` int(1) NOT NULL DEFAULT 1,
  `monto_inicial` decimal(10,2) NOT NULL,
  `monto_actual` decimal(10,2) NOT NULL,
  `objetivo_dia` decimal(10,2) NOT NULL,
  `estado` enum('activo','completado','perdido') DEFAULT 'activo',
  `ultima_actualizacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reto_escalera`
--

LOCK TABLES `reto_escalera` WRITE;
/*!40000 ALTER TABLE `reto_escalera` DISABLE KEYS */;
INSERT INTO `reto_escalera` VALUES (1,1,100.00,100.00,200.00,'activo','2026-01-14 08:16:08');
/*!40000 ALTER TABLE `reto_escalera` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `saldos`
--

DROP TABLE IF EXISTS `saldos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `saldos` (
  `tipo` varchar(20) NOT NULL,
  `monto` decimal(10,2) NOT NULL DEFAULT 0.00,
  PRIMARY KEY (`tipo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `saldos`
--

LOCK TABLES `saldos` WRITE;
/*!40000 ALTER TABLE `saldos` DISABLE KEYS */;
INSERT INTO `saldos` VALUES ('debito',751.26),('efectivo',200.00);
/*!40000 ALTER TABLE `saldos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `usuario` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `usuario` (`usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (1,'admin','abc'),(2,'vale','vale');
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'golden'
--

--
-- Dumping routines for database 'golden'
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
