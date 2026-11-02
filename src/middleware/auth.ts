import { Request, Response, NextFunction } from 'express';
import { adminAuth } from '../lib/firebase-admin.ts';
import { DecodedIdToken } from 'firebase-admin/auth';
import { getOrCreateUser } from '../db/users.ts';

export interface AuthRequest extends Request {
  user?: DecodedIdToken | { uid: string; email: string; mode: string };
}

const OWNER_EMAIL = 'harishankarism@gmail.com';
const ADMIN_PASSKEY = process.env.ADMIN_ACCESS_KEY || 'hari-admin-2026';

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing authentication token.' });
  }

  const token = authHeader.split('Bearer ')[1].trim();
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: Empty token.' });
  }

  // Support explicit owner passkey session token for local/admin access alongside Google OAuth
  if (token === `passkey:${ADMIN_PASSKEY}`) {
    try {
      await getOrCreateUser('owner-passkey-uid', OWNER_EMAIL);
    } catch (err) {
      console.error('Non-fatal user sync warning:', err);
    }
    req.user = {
      uid: 'owner-passkey-uid',
      email: OWNER_EMAIL,
      mode: 'passkey',
    };
    return next();
  }

  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    const email = (decodedToken.email || '').toLowerCase();
    // Enforce owner authorization check
    if (email && email !== OWNER_EMAIL) {
      return res.status(403).json({
        error: `Forbidden: ${email} is not authorized as portfolio administrator.`,
      });
    }
    await getOrCreateUser(decodedToken.uid, decodedToken.email || OWNER_EMAIL);
    req.user = decodedToken;
    return next();
  } catch (error) {
    console.error('Error verifying Firebase ID token:', error);
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired token.' });
  }
};
