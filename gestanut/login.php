<?php
session_set_cookie_params(['httponly' => true, 'samesite' => 'Strict']);
session_start();
if (!empty($_SESSION['usuario_id'])) {
    header('Location: index.php');
    exit;
}

$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = trim($_POST['email'] ?? '');
    $pass  = $_POST['password'] ?? '';
    if ($email === '' || $pass === '') {
        $error = 'Por favor ingresa tu correo y contraseña.';
    } else {
        try {
            require_once __DIR__ . '/api/config.php';
            $pdo = get_pdo();
            $stmt = $pdo->prepare('SELECT id, nombre, password_hash FROM usuarios WHERE email = ? LIMIT 1');
            $stmt->execute([$email]);
            $user = $stmt->fetch();
            if ($user && password_verify($pass, $user['password_hash'])) {
                session_regenerate_id(true);
                $_SESSION['usuario_id']     = $user['id'];
                $_SESSION['usuario_nombre'] = $user['nombre'];
                header('Location: index.php');
                exit;
            } else {
                $error = 'Correo o contraseña incorrectos.';
            }
        } catch (Exception $e) {
            $error = 'Error de conexión. Intenta de nuevo.';
        }
    }
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>GestaNut · Iniciar sesión</title>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet">
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --forest:#1a3328;--forest-m:#2d5240;--forest-l:#3d6852;
  --sage:#6b9e78;--sage-l:#c8dfc8;--sage-ll:#eef5ee;
  --cream:#faf6ef;--cream-d:#f0e9dc;
  --terra:#c4714a;--text:#1a2418;--text-m:#4a5e44;--text-l:#8a9e84;
  --white:#ffffff;--danger:#c0392b;--danger-l:#fdf0ee;
  --r:18px;--rs:12px;
}
html,body{height:100%;font-family:'DM Sans',sans-serif;background:var(--cream);color:var(--text)}
body{display:flex;align-items:center;justify-content:center;min-height:100vh;padding:20px;position:relative;overflow:hidden}

/* Fondo decorativo */
body::before{content:'';position:fixed;top:-120px;right:-120px;width:420px;height:420px;border-radius:50%;background:radial-gradient(circle,rgba(107,158,120,.18) 0%,transparent 70%);pointer-events:none}
body::after{content:'';position:fixed;bottom:-80px;left:-80px;width:320px;height:320px;border-radius:50%;background:radial-gradient(circle,rgba(196,113,74,.1) 0%,transparent 70%);pointer-events:none}
.bg-accent{position:fixed;top:40%;left:-60px;width:180px;height:180px;border-radius:50%;background:radial-gradient(circle,rgba(26,51,40,.06) 0%,transparent 70%);pointer-events:none}

/* Card */
.card{background:var(--white);border-radius:24px;box-shadow:0 8px 48px rgba(26,51,40,.12),0 2px 12px rgba(26,51,40,.06);padding:48px 44px 44px;width:100%;max-width:420px;position:relative;z-index:1}

/* Marca */
.brand{text-align:center;margin-bottom:36px}
.brand-logo{width:72px;height:72px;object-fit:contain;display:block;margin:0 auto 14px;filter:drop-shadow(0 2px 8px rgba(26,51,40,.18))}
.brand-name{font-family:'Cormorant Garamond',serif;font-size:30px;font-weight:500;color:var(--forest);letter-spacing:-.5px;line-height:1}
.brand-sub{font-size:12px;color:var(--text-l);letter-spacing:2px;text-transform:uppercase;margin-top:5px;font-weight:400}

/* Titulo */
.login-title{font-family:'Cormorant Garamond',serif;font-size:22px;color:var(--forest);font-weight:500;margin-bottom:24px;text-align:center}

/* Campos */
.field{margin-bottom:18px}
.field label{display:block;font-size:12px;font-weight:500;color:var(--text-m);margin-bottom:7px;letter-spacing:.3px;text-transform:uppercase}
.field-wrap{position:relative}
.field input{width:100%;padding:13px 16px;border:1.5px solid var(--cream-d);border-radius:var(--rs);font-size:14.5px;font-family:'DM Sans',sans-serif;color:var(--text);background:var(--cream);transition:border-color .2s,box-shadow .2s;outline:none;-webkit-appearance:none;appearance:none}
.field input:focus{border-color:var(--sage);box-shadow:0 0 0 3px rgba(107,158,120,.15);background:var(--white)}
.field input::placeholder{color:var(--text-l)}
.toggle-pass{position:absolute;right:13px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:var(--text-l);padding:4px;font-size:15px;line-height:1;transition:color .2s}
.toggle-pass:hover{color:var(--text-m)}

/* Error */
.error-box{background:var(--danger-l);border:1px solid rgba(192,57,43,.2);border-radius:var(--rs);padding:11px 14px;font-size:13px;color:var(--danger);margin-bottom:20px;display:flex;align-items:center;gap:8px;animation:shake .4s ease}
@keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-6px)}40%{transform:translateX(6px)}60%{transform:translateX(-4px)}80%{transform:translateX(4px)}}

/* Boton */
.btn-login{width:100%;padding:14px;background:var(--forest);color:var(--cream);border:none;border-radius:var(--rs);font-size:15px;font-family:'DM Sans',sans-serif;font-weight:500;cursor:pointer;transition:background .2s,transform .1s,box-shadow .2s;margin-top:4px;letter-spacing:.3px}
.btn-login:hover{background:var(--forest-m);box-shadow:0 4px 16px rgba(26,51,40,.25)}
.btn-login:active{transform:scale(.98)}

/* Footer */
.card-footer{text-align:center;margin-top:24px;font-size:12px;color:var(--text-l)}

/* Separador decorativo */
.divider{display:flex;align-items:center;gap:12px;margin:20px 0}
.divider::before,.divider::after{content:'';flex:1;height:1px;background:var(--cream-d)}
.divider span{font-size:11px;color:var(--text-l);letter-spacing:1px;text-transform:uppercase}
</style>
</head>
<body>
<div class="bg-accent"></div>

<div class="card">
  <div class="brand">
    <img src="assets/img/logo.jpg" class="brand-logo" alt="GestaNut">
    <div class="brand-name">GestaNut</div>
    <div class="brand-sub">Sistema Clínico · v3.0</div>
  </div>

  <p class="login-title">Bienvenida de vuelta</p>

  <?php if ($error): ?>
  <div class="error-box">
    <span>⚠</span>
    <span><?= htmlspecialchars($error) ?></span>
  </div>
  <?php endif; ?>

  <form method="POST" autocomplete="on">
    <div class="field">
      <label for="email">Correo electrónico</label>
      <div class="field-wrap">
        <input type="email" id="email" name="email" placeholder="tu@correo.com"
               value="<?= htmlspecialchars($_POST['email'] ?? '') ?>"
               required autofocus autocomplete="email">
      </div>
    </div>

    <div class="field">
      <label for="password">Contraseña</label>
      <div class="field-wrap">
        <input type="password" id="password" name="password"
               placeholder="••••••••" required autocomplete="current-password">
        <button type="button" class="toggle-pass" onclick="togglePass()" title="Mostrar contraseña">
          <span id="eye-icon">👁</span>
        </button>
      </div>
    </div>

    <button type="submit" class="btn-login">Iniciar sesión</button>
  </form>

  <div class="card-footer">Sistema privado · Solo acceso autorizado</div>
</div>

<script>
function togglePass() {
  var inp = document.getElementById('password');
  var ico = document.getElementById('eye-icon');
  if (inp.type === 'password') {
    inp.type = 'text';
    ico.textContent = '🙈';
  } else {
    inp.type = 'password';
    ico.textContent = '👁';
  }
}
</script>
</body>
</html>
