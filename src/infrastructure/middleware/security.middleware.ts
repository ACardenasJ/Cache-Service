/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable prettier/prettier */
import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { rateLimit, RateLimitRequestHandler } from 'express-rate-limit';
import helmet from 'helmet';

@Injectable()
export class SecurityMiddleware implements NestMiddleware {
  private readonly logger = new Logger(SecurityMiddleware.name);
  private readonly rateLimiter: RateLimitRequestHandler;
  private readonly helmetMiddleware: ReturnType<typeof helmet>;

  constructor() {
    this.rateLimiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutos
      max: 100, // límite de 100 peticiones por ventana
      message: 'Demasiadas peticiones desde esta IP, por favor intente más tarde',
      standardHeaders: true,
      legacyHeaders: false,
    });

    this.helmetMiddleware = helmet();
  }

  use(req: Request, res: Response, next: NextFunction): void {
    try {
      // Aplicar headers de seguridad básicos
      this.helmetMiddleware(req, res, () => {
        // Aplicar rate limiting
        this.rateLimiter(req, res, () => {
          // Validar origen de la petición
          const allowedOrigins = ['localhost', 'your-game-domain.com'];
          const origin = req.headers.origin;
          if (origin && !allowedOrigins.includes(origin)) {
            this.logger.warn(`Intento de acceso desde origen no permitido: ${origin}`);
            res.status(403).json({ message: 'Origen no permitido' });
            return;
          }

          // Logging de acceso
          this.logger.log(`${req.method} ${req.path} desde ${req.ip}`);
          next();
        });
      });
    } catch (error) {
      this.logger.error('Error en el middleware de seguridad:', error);
      next(error);
    }
  }
} 