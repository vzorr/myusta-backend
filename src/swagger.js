// src/swagger.js - Modified for external access
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');

// Load the Swagger document
const swaggerDocument = YAML.load(path.join(__dirname, '../swagger.yaml'));

// Function to set up Swagger in Express app
function setupSwagger(app) {
  // Check if Swagger should be enabled
  if (process.env.ENABLE_SWAGGER !== 'false') { // Enable by default unless explicitly disabled
    // Swagger UI options with better external access
    const options = {
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'MyUsta API Documentation',
      swaggerOptions: {
        persistAuthorization: true,
        docExpansion: 'list', // Start with all sections expanded
        filter: true,         // Enable search/filter box
        showCommonExtensions: true,
      },
    };

    // Setup Swagger routes - make them accessible at both root and API path for flexibility
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, options));
    app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, options)); // Alternative path
    
    // Also provide raw JSON access
    app.get('/swagger.json', (req, res) => {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Access-Control-Allow-Origin', '*'); // Enable CORS for the JSON file
      res.json(swaggerDocument);
    });

    console.log('✅ Swagger documentation enabled and available at:');
    console.log('   - /api-docs');
    console.log('   - /api/docs');
    console.log('   - /swagger.json (raw JSON)');
  } else {
    console.log('ℹ️ Swagger documentation is disabled. Set ENABLE_SWAGGER=true to enable it.');
  }
}

module.exports = setupSwagger;