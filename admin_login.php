<?php
session_start();

// Si ya está autenticado como admin, pasar directo
if (isset($_SESSION['gt_admin']) && $_SESSION['gt_admin'] === true) {
    header('Location: admin.php');
    exit;
}

$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $usuario  = strtolower(trim($_POST['usuario'] ?? ''));
    $password = trim($_POST['password'] ?? '');

    // Credenciales de acceso al panel admin
    if ($usuario === 'admin' && $password === 'abc') {
        $_SESSION['gt_admin']   = true;
        $_SESSION['gt_usuario'] = 'admin';
        header('Location: admin.php');
        exit;
    } else {
        $error = 'Usuario o contraseña incorrectos.';
    }
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Admin — Golden Tech</title>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=Cormorant+Garamond:wght@600;700&display=swap" rel="stylesheet"/>
<style>
*{margin:0;padding:0;box-sizing:border-box;}
:root{
  --forest:#2C3E35;--forest2:#3D5247;
  --gold:#C9960C;--gold2:#E8AC0E;
  --sand:#F0EBE1;--text:#1E2D27;
  --muted:#6B7C74;--border:rgba(44,62,53,.18);
}
body{
  min-height:100vh;display:flex;align-items:center;justify-content:center;
  font-family:'Plus Jakarta Sans',sans-serif;
  background:var(--forest);
  background-image:
    radial-gradient(ellipse at 20% 50%, rgba(201,150,12,.18) 0%, transparent 55%),
    radial-gradient(ellipse at 80% 20%, rgba(143,180,154,.12) 0%, transparent 50%);
  padding:20px;
}

/* ── CARD ── */
.card{
  width:min(420px,100%);
  background:rgba(240,235,225,.07);
  border:1px solid rgba(201,150,12,.25);
  border-radius:20px;
  padding:40px 36px;
  backdrop-filter:blur(12px);
  animation:fadeUp .55s ease both;
}
@keyframes fadeUp{
  from{opacity:0;transform:translateY(18px);}
  to{opacity:1;transform:translateY(0);}
}

/* ── LOGO / MARCA ── */
.brand{text-align:center;margin-bottom:32px;}
.brand img{width:68px;margin-bottom:12px;filter:drop-shadow(0 4px 12px rgba(201,150,12,.4));}
.brand-name{
  font-family:'Cormorant Garamond',serif;
  font-size:26px;font-weight:700;
  color:#fff;letter-spacing:.04em;
}
.brand-name span{color:var(--gold2);}
.brand-sub{font-size:12px;color:rgba(255,255,255,.45);margin-top:3px;letter-spacing:.06em;}
.brand-badge{
  display:inline-block;margin-top:10px;
  padding:3px 12px;border-radius:999px;
  background:rgba(201,150,12,.18);border:1px solid rgba(201,150,12,.35);
  font-size:11px;font-weight:600;color:var(--gold2);letter-spacing:.08em;
}

/* ── FORM ── */
.form-group{margin-bottom:16px;}
label{
  display:block;font-size:11.5px;font-weight:600;
  color:rgba(255,255,255,.5);letter-spacing:.07em;
  text-transform:uppercase;margin-bottom:6px;
}
input{
  width:100%;padding:12px 16px;
  background:rgba(255,255,255,.08);
  border:1.5px solid rgba(255,255,255,.12);
  border-radius:10px;
  color:#fff;font-size:14px;font-family:inherit;
  transition:border-color .2s,background .2s;
}
input::placeholder{color:rgba(255,255,255,.3);}
input:focus{
  outline:none;
  border-color:var(--gold);
  background:rgba(255,255,255,.12);
}

/* ── BOTÓN ── */
.btn-submit{
  width:100%;margin-top:8px;
  padding:13px;
  background:linear-gradient(135deg,var(--gold),var(--gold2));
  border:none;border-radius:10px;
  color:var(--forest);font-size:14px;font-weight:700;
  font-family:inherit;cursor:pointer;
  letter-spacing:.04em;
  transition:filter .2s,transform .15s;
}
.btn-submit:hover{filter:brightness(1.08);transform:translateY(-1px);}
.btn-submit:active{transform:translateY(0);}

/* ── ERROR ── */
.error{
  margin-top:14px;text-align:center;
  font-size:13px;color:#ff9a9a;
  background:rgba(192,57,43,.15);
  border:1px solid rgba(192,57,43,.3);
  border-radius:8px;padding:9px 14px;
}

/* ── BACK ── */
.back{
  display:block;text-align:center;margin-top:20px;
  font-size:12px;color:rgba(255,255,255,.35);
  transition:color .2s;
}
.back:hover{color:rgba(255,255,255,.65);}
</style>
</head>
<body>

<div class="card">
  <div class="brand">
    <img src="img/logo.png" alt="Golden Tech">
    <div class="brand-name">Golden <span>Tech</span></div>
    <div class="brand-sub">Servicio Técnico · Culiacán</div>
    <div class="brand-badge">⚙ Panel de Administración</div>
  </div>

  <form method="POST" autocomplete="off">
    <div class="form-group">
      <label>Usuario</label>
      <input type="text" name="usuario" placeholder="Ingresa tu usuario" required autofocus>
    </div>
    <div class="form-group">
      <label>Contraseña</label>
      <input type="password" name="password" placeholder="••••••••" required>
    </div>
    <button type="submit" class="btn-submit">Entrar al panel</button>
    <?php if ($error): ?>
      <div class="error">⚠ <?= htmlspecialchars($error) ?></div>
    <?php endif; ?>
  </form>

  <a href="index.html" class="back">← Volver al sitio</a>
</div>

</body>
</html>
