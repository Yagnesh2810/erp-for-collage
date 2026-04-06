import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole } from '../models/User';

export interface AuthUser {
  id: string;
  email: string;
  role: string;
}

export const auth = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    (req as any).user = {
      id: decoded.id || decoded.userId,
      email: decoded.email,
      role: decoded.role || UserRole.NORMAL
    };
    
    next();
  } catch (error) {
    // For development, allow requests without valid tokens
    if (process.env.NODE_ENV === 'development') {
      (req as any).user = {
        id: '507f1f77bcf86cd799439011', // Mock user ID
        email: 'dev@example.com',
        role: UserRole.ADMIN
      };
      return next();
    }
    
    res.status(401).json({ error: 'Invalid token.' });
  }
};

export const authorize = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ error: 'Access denied. User not authenticated.' });
    }

    if (!roles.includes(user.role)) {
      return res.status(403).json({ error: 'Access denied. Insufficient permissions.' });
    }

    next();
  };
};