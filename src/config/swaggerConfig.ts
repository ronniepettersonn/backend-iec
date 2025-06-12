import swaggerJsdoc from 'swagger-jsdoc'

export const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API do Sistema IEC',
      version: '1.0.0',
      description: 'Documentação das rotas do sistema'
    },
    servers: [
      {
        url: 'http://localhost:3333',
        description: 'Servidor local'
      },
      // Adicione aqui o link do servidor de produção se quiser
      {
        url: 'https://api.igrejaiec.com.br',
        description: 'Servidor Produção'
      }
    ],
  },
  apis: ['./src/routes/*.ts', './src/validations/**/*.ts'], // Ajuste conforme a pasta onde estão suas rotas
}

export const swaggerSpec = swaggerJsdoc(swaggerOptions)
