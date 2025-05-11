import swaggerJsdoc from 'swagger-jsdoc';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Gaucho Buy API',
            version: '1.0.0',
            description: 'API for managing Gaucho Buy',
            contact: {
                name: 'Gaucho Buy API'
            },
            servers: [
                {
                    url: 'http://localhost:3000',
                    description: 'Local server'
                }
            ]
        }
    },
 apis: ['./src/docs/*.yml']




};
console.log('Swagger YAML Files:', options.apis); //
const specs = swaggerJsdoc(options);
export default specs;