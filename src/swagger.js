const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');

// Load the Swagger document
const swaggerDocument = YAML.load(path.join(__dirname, '../swagger.yaml'));

// Function to set up Swagger in Express app
function setupSwagger(app) {
  // Check if Swagger should be enabled
  if (process.env.ENABLE_SWAGGER === 'true' || process.env.NODE_ENV === 'development') {
    // Swagger UI options
    const options = {
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'MyUsta API Documentation',
      swaggerOptions: {
        persistAuthorization: true,
      },
    };

    // Setup Swagger routes
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, options));
    app.get('/api-docs.json', (req, res) => {
      res.json(swaggerDocument);
    });

    console.log('✅ Swagger documentation enabled and available at /api-docs');
  } else {
    console.log('ℹ️ Swagger documentation is disabled. Set ENABLE_SWAGGER=true to enable it.');
  }
}

module.exports = setupSwagger;