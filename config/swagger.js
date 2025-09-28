const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'El Reino API',
      version: '1.0.0',
      description: 'Medieval-themed social networking API',
      contact: {
        name: 'El Reino Development Team',
        email: 'dev@el-reino.com'
      }
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:3100',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            name: { type: 'string', example: 'Sir Arthur' },
            surname: { type: 'string', example: 'Pendragon' },
            nickname: { type: 'string', example: 'the_king' },
            email: { type: 'string', example: 'arthur@camelot.com' },
            bio: { type: 'string', example: 'King of Camelot' },
            dungeon: { type: 'string', example: 'Royal Chambers' },
            role: { type: 'string', example: 'role_user' },
            image: { type: 'string', example: 'avatar.jpg' },
            created_at: { type: 'string', format: 'date-time' }
          }
        },
        Publication: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            user: { type: 'string', description: 'User ID' },
            text: { type: 'string', example: 'A royal proclamation!' },
            file: { type: 'string', example: 'image.jpg' },
            created_at: { type: 'string', format: 'date-time' }
          }
        },
        Follow: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            user: { type: 'string', description: 'Follower user ID' },
            followed: { type: 'string', description: 'Followed user ID' },
            created_at: { type: 'string', format: 'date-time' }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./Routes/*.js', './Controllers/*.js'], // Path to the API docs
};

const specs = swaggerJsdoc(options);

module.exports = { swaggerUi, specs };