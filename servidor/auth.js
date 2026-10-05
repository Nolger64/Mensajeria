const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Clave secreta para firma de tokens JWT
const JWT_SECRET = process.env.JWT_SECRET || 'fhs_secret_jwt_key_super_secure_2026_983749823749';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
const BCRYPT_SALT_ROUNDS = 10;

// Roles permitidos en el ecosistema FHS
const VALID_ROLES = ['administrador', 'repartidor', 'cliente'];

/**
 * Valida formato estándar de correo electrónico
 */
function validateEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim().toLowerCase());
}

/**
 * Valida estándares de seguridad de contraseñas (OWASP):
 * - Mínimo 8 caracteres
 * - Al menos una letra mayúscula
 * - Al menos una letra minúscula
 * - Al menos un número
 * - Al menos un caracter especial
 */
function validatePasswordStrength(password) {
  if (!password || typeof password !== 'string') {
    return { valid: false, message: 'La contraseña es requerida' };
  }
  if (password.length < 8) {
    return { valid: false, message: 'La contraseña debe tener al menos 8 caracteres' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'La contraseña debe incluir al menos una letra mayúscula' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'La contraseña debe incluir al menos una letra minúscula' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'La contraseña debe incluir al menos un número' };
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return { valid: false, message: 'La contraseña debe incluir al menos un caracter especial (!@#$%^&*...)' };
  }
  return { valid: true };
}

/**
 * Genera el hash seguro de una contraseña usando bcrypt
 */
async function hashPassword(plainPassword) {
  return await bcrypt.hash(plainPassword, BCRYPT_SALT_ROUNDS);
}

/**
 * Hash sincrónico para la inicialización de usuarios predeterminados
 */
function hashPasswordSync(plainPassword) {
  return bcrypt.hashSync(plainPassword, BCRYPT_SALT_ROUNDS);
}

/**
 * Compara una contraseña en texto plano contra su hash bcrypt
 */
async function comparePassword(plainPassword, hashedPassword) {
  return await bcrypt.compare(plainPassword, hashedPassword);
}

/**
 * Genera un token JWT firmado con claims seguros y expiración
 */
function generateToken(user) {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Remueve campos sensibles (como el hash de la contraseña) antes de responder
 */
function sanitizeUser(user) {
  if (!user) return null;
  const { password, ...safeUser } = user;
  return safeUser;
}

/**
 * Middleware para agregar cabeceras de seguridad HTTP (estilo Helmet)
 */
function securityHeadersMiddleware(req, res, next) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
}

/**
 * Middleware de Autenticación: Verifica y decodifica el token JWT
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.split(' ')[1]
    : null;

  if (!token) {
    return res.status(401).json({
      success: false,
      code: 'AUTH_TOKEN_REQUIRED',
      message: 'Acceso no autorizado: Se requiere token de autenticación (Bearer <token>)',
    });
  }

  jwt.verify(token, JWT_SECRET, (err, decodedUser) => {
    if (err) {
      const isExpired = err.name === 'TokenExpiredError';
      return res.status(403).json({
        success: false,
        code: isExpired ? 'TOKEN_EXPIRED' : 'TOKEN_INVALID',
        message: isExpired
          ? 'El token de sesión ha expirado. Por favor inicia sesión nuevamente.'
          : 'Token de autenticación inválido o manipulado.',
      });
    }

    req.user = decodedUser;
    next();
  });
}

/**
 * Middleware de Autorización Basada en Roles (RBAC)
 * @param  {...string} allowedRoles - Roles permitidos ('administrador', 'repartidor', 'cliente')
 */
function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        code: 'USER_NOT_AUTHENTICATED',
        message: 'Usuario no autenticado',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        code: 'FORBIDDEN_ROLE',
        message: `Acceso restringido: Tu rol actual ('${req.user.role}') no tiene permisos para esta acción. Roles autorizados: [${allowedRoles.join(', ')}]`,
      });
    }

    next();
  };
}

/**
 * Middleware opcional: si viene token lo autentica, si no, continúa como anónimo
 */
function optionalAuthenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.split(' ')[1]
    : null;

  if (!token) {
    req.user = null;
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err, decodedUser) => {
    if (!err) {
      req.user = decodedUser;
    }
    next();
  });
}

/**
 * Middleware que aplica RBAC de forma estricta si se provee Bearer token,
 * o permite modo desarrollo si no se requiere STRICT_AUTH=true.
 */
function checkRoleOrDev(...allowedRoles) {
  return (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ')
      ? authHeader.split(' ')[1]
      : null;

    if (!token) {
      if (process.env.STRICT_AUTH === 'true') {
        return res.status(401).json({
          success: false,
          code: 'AUTH_TOKEN_REQUIRED',
          message: `Se requiere token Bearer con rol [${allowedRoles.join(', ')}]`,
        });
      }
      // Modo desarrollo: asigna un usuario virtual con rol por defecto
      const devRole = req.headers['x-dev-role'] || allowedRoles[0];
      req.user = { id: 'dev-user', role: devRole, name: `Dev (${devRole})` };
      return next();
    }

    authenticateToken(req, res, () => {
      authorizeRoles(...allowedRoles)(req, res, next);
    });
  };
}

module.exports = {
  VALID_ROLES,
  validateEmail,
  validatePasswordStrength,
  hashPassword,
  hashPasswordSync,
  comparePassword,
  generateToken,
  sanitizeUser,
  securityHeadersMiddleware,
  authenticateToken,
  authorizeRoles,
  optionalAuthenticateToken,
  checkRoleOrDev,
};
