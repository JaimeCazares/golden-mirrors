<?php
session_start();
unset($_SESSION['gt_admin'], $_SESSION['gt_usuario']);
session_destroy();
header('Location: admin_login.php');
exit;
