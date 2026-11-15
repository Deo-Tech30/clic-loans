import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const requireAuth = (roles: string[]) => {
  return (req: any, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No token provided' });

    const token = authHeader.split(' ')[1]; // Format: "Bearer <token>"
    
    try {
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);
      if (!roles.includes(decoded.role)) {
        return res.status(403).json({ error: 'Access denied: Wrong role' });
      }
      req.user = decoded; // Attach user info to the request
      next();
    } catch (error) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  };
};