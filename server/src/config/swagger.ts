import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Food Ordering Platform API',
    version: '1.0.0',
    description: 'Production-ready REST API for Sri Lankan & International Food Ordering Application',
  },
  servers: [
    {
      url: 'http://localhost:5000/api/v1',
      description: 'Development Server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
  paths: {
    '/auth/register': {
      post: {
        summary: 'Register a new user',
        tags: ['Auth'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  email: { type: 'string' },
                  password: { type: 'string' },
                  phone: { type: 'string' },
                  role: { type: 'string', enum: ['CUSTOMER', 'RESTAURANT_ADMIN', 'SUPER_ADMIN'] },
                },
              },
            },
          },
        },
        responses: { 201: { description: 'User registered' } },
      },
    },
    '/auth/login': {
      post: {
        summary: 'Login user',
        tags: ['Auth'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string' },
                  password: { type: 'string' },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'Login successful' } },
      },
    },
    '/restaurants': {
      get: {
        summary: 'List restaurants with filters, search, and pagination',
        tags: ['Restaurants'],
        responses: { 200: { description: 'List of restaurants' } },
      },
    },
    '/menu-items': {
      get: {
        summary: 'List menu items',
        tags: ['Menu'],
        responses: { 200: { description: 'List of dishes' } },
      },
    },
    '/orders': {
      post: {
        summary: 'Create an order',
        tags: ['Orders'],
        responses: { 201: { description: 'Order created' } },
      },
      get: {
        summary: 'Get user/restaurant orders',
        tags: ['Orders'],
        responses: { 200: { description: 'Orders list' } },
      },
    },
  },
};

export const setupSwagger = (app: Express) => {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
};
