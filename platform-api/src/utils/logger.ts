import morgan from 'morgan';
import { createLogger, format, transports } from 'winston';

export const httpLogger = morgan('combined');

export const logger = createLogger({
  level: 'info',
  format: format.combine(format.timestamp(), format.json()),
  transports: [new transports.Console()],
});
