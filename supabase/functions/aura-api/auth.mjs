import { randomUUID } from 'node:crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
const BCRYPT_SALT_ROUNDS = 10;

// Roles permitidos en el ecosistema FHS
export const VALID_ROLES = ['administrador', 'repartidor', 'cliente', 'especialista'];

/**
 * Valida formato estándar de correo electrónico
 */
export function validateEmail(email) {
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
export function validatePasswordStrength(password) {
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
export function hashPasswordSync(plainPassword) {
  return bcrypt.hashSync(plainPassword, BCRYPT_SALT_ROUNDS);
}

/**
 * Compara una contraseña en texto plano contra su hash bcrypt
 */
async function comparePassword(plainPassword, hashedPassword) {
  return await bcrypt.compare(plainPassword, hashedPassword);
}

/**
 * Remueve campos sensibles (como el hash de la contraseña) antes de responder
 */
export function sanitizeUser(user) {
  if (!user) return null;
  const { password, ...safeUser } = user;
  return safeUser;
}

/**
 * Middleware para agregar cabeceras de seguridad HTTP (estilo Helmet)
 */
export function securityHeadersMiddleware(req, res, next) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
}

/**
 * Middleware de Autorización Basada en Roles (RBAC)
 * @param  {...string} allowedRoles - Roles permitidos ('administrador', 'repartidor', 'cliente')
 */
export function authorizeRoles(...allowedRoles) {
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
 * @typedef {{ id: string, email: string, password?: string }} Identity
 * @typedef {{
 *   create(email: string, password: string): Promise<{ id: string, password?: string }>,
 *   verify(user: Identity, password: string): Promise<boolean>,
 *   changePassword(user: Identity, password: string, currentPassword: string): Promise<void>,
 *   changeEmail(user: Identity, email: string): Promise<void> | void,
 *   remove(id: string): void
 * }} IdentityProvider
 */

/** @type {IdentityProvider} */
export const localIdentities = {
  async create(email, password) {
    return { id: randomUUID(), password: await hashPassword(password) };
  },
  verify(user, password) {
    return user.password ? comparePassword(password, user.password) : Promise.resolve(false);
  },
  async changePassword(user, password) {
    user.password = await hashPassword(password);
  },
  changeEmail() {},
  remove() {},
};

export function createAuthentication({ signingKey, tokenExpiry = '24h', sandboxEnabled }) {
  if (typeof signingKey !== 'string' || signingKey.length < 32) {
    throw new Error('Configura JWT_SECRET con al menos 32 caracteres antes de iniciar el servidor.');
  }
  /**
   * Genera un token JWT firmado con claims seguros y expiración
   */
  function generateToken(user) {
    const payload = {
      id: user.id,
      role: user.role,
    };
    return jwt.sign(payload, signingKey, { expiresIn: tokenExpiry });
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

    jwt.verify(token, signingKey, (err, decodedUser) => {
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

      const user = req.app.locals.findUser(decodedUser.id);
      if (!user || user.role !== decodedUser.role) {
        return res.status(401).json({ success: false, message: 'Vuelve a iniciar sesión.' });
      }
      req.user = sanitizeUser(user);
      next();
    });
  }

  // El entorno de pruebas se ejecuta aislado. En la app se exige sesión y rol.
  function checkRoleOrDev(...allowedRoles) {
    return (req, res, next) => {
      if (sandboxEnabled && !req.headers.authorization) {
        req.user = { id: 'sandbox', role: allowedRoles[0], name: 'Sandbox' };
        return next();
      }
      authenticateToken(req, res, () => authorizeRoles(...allowedRoles)(req, res, next));
    };
  }
  return { authenticateToken, checkRoleOrDev, generateToken };
}
