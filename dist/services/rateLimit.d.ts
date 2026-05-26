import { Request, Response, NextFunction } from 'express';
export declare function rateLimit(req: Request, res: Response, next: NextFunction): void;
export declare function getRateLimitInfo(): {
    window: string;
    max: number;
};
//# sourceMappingURL=rateLimit.d.ts.map