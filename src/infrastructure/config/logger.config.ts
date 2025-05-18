/* eslint-disable prettier/prettier */
import { WinstonModuleOptions } from 'nest-winston';
import * as winston from 'winston';
import 'winston-daily-rotate-file';

const { combine, timestamp, printf, colorize, align } = winston.format;

// Formato personalizado para consola
const consoleFormat = combine(
  colorize({ all: true }),
  timestamp(),
  align(),
  printf((info: winston.Logform.TransformableInfo) => {
    const { timestamp: ts, level, message, ...args } = info;
    const formattedTs = typeof ts === 'string' ? ts : new Date().toISOString();
    return `${formattedTs} [${level}]: ${message} ${Object.keys(args).length ? JSON.stringify(args, null, 2) : ''}`;
  }),
);

// Formato para archivos
const fileFormat = combine(
  timestamp(),
  printf((info: winston.Logform.TransformableInfo) => {
    const { timestamp: ts, level, message, ...args } = info;
    const formattedTs = typeof ts === 'string' ? ts : new Date().toISOString();
    return JSON.stringify({
      timestamp: formattedTs,
      level,
      message,
      ...args,
    });
  }),
);

export const loggerConfig: WinstonModuleOptions = {
  transports: [
    // Console Transport
    new winston.transports.Console({
      level: 'debug',
      format: consoleFormat,
    }),
    // Archivo para todos los logs
    new winston.transports.DailyRotateFile({
      filename: 'logs/combined-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
      format: fileFormat,
    }),
    // Archivo específico para errores
    new winston.transports.DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
      level: 'error',
      format: fileFormat,
    }),
  ],
};
