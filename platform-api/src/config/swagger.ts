import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

export function setupSwagger(app: Express) {
  const specs = swaggerJsdoc({
    definition: {
      openapi: '3.0.0',
      info: { title: 'Educational Platform API', version: '1.0.0' },
      components: {
        securitySchemes: {
          bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        },
      },
      security: [{ bearerAuth: [] }],
    },
    apis: [], // Add JSDoc comments or YAML files paths here if desired
  });
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(specs));
}
