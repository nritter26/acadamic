import { Request, Response, NextFunction } from 'express';
export interface AuthPayload {
    userId: string;
    email: string;
    name?: string;
}
declare global {
    namespace Express {
        interface Request {
            user?: AuthPayload;
        }
    }
}
export declare function generateToken(payload: AuthPayload): string;
export declare function verifyToken(token: string): AuthPayload;
export declare function optionalAuth(req: Request, _res: Response, next: NextFunction): void;
export declare function requireAuth(req: Request, res: Response, next: NextFunction): void;
//# sourceMappingURL=auth.d.ts.map