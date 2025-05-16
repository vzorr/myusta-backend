// src/index.js - Updated for external Swagger access
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const { connectDB } = require('./config/database');
const routes = require('./routes');
const { errorHandler, notFoundHandler } = require('./middlewares/errorHandler');
const { logger, logError } = require('./utils/logger');
const { BASE_URL } = require('./config/index');
const fs = require('fs');
const path = require('path');
const setupSwagger = require('./swagger');

// Add global error handlers before anything else
process.on('uncaughtException', (error) => {
  const errorLog = {
    timestamp: new Date().toISOString(),
    type: 'UNCAUGHT_EXCEPTION',
    message: error.message,
    stack: error.stack
  };
  
  // Log to console
  console.error('\n=== UNCAUGHT EXCEPTION ===');
  console.error(`Time: ${errorLog.timestamp}`);
  console.error(`Error: ${errorLog.message}`);
  console.error(`Stack: ${errorLog.stack}`);
  console.error('===========================\n');
  
  // Also write to error log file
  try {
    const logDir = path.join(__dirname, '../logs');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    fs.appendFileSync(
      path.join(logDir, 'error.log'), 
      JSON.stringify(errorLog) + '\n'
    );
  } catch (fileError) {
    console.error('Failed to write to error log file:', fileError);
  }
  
  // In production we might want to try to gracefully shutdown
  // or restart the server, but in development just crash
  // to make errors obvious
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  const errorLog = {
    timestamp: new Date().toISOString(),
    type: 'UNHANDLED_REJECTION',
    reason: reason instanceof Error ? reason.message : String(reason),
    stack: reason instanceof Error ? reason.stack : 'No stack trace available'
  };
  
  // Log to console
  console.error('\n=== UNHANDLED PROMISE REJECTION ===');
  console.error(`Time: ${errorLog.timestamp}`);
  console.error(`Reason: ${errorLog.reason}`);
  console.error(`Stack: ${errorLog.stack}`);
  console.error('===================================\n');
  
  // Also write to error log file
  try {
    const logDir = path.join(__dirname, '../logs');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    fs.appendFileSync(
      path.join(logDir, 'error.log'), 
      JSON.stringify(errorLog) + '\n'
    );
  } catch (fileError) {
    console.error('Failed to write to error log file:', fileError);
  }
  
  // In development, we'll let the process continue
  // but in production you might want to exit
  // process.exit(1);
});

dotenv.config();

// Add verbose startup logging
console.log('=== APPLICATION STARTUP ===');
console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`Node Version: ${process.version}`);
console.log(`Process ID: ${process.pid}`);
console.log(`Working Directory: ${process.cwd()}`);
console.log('=========================');

// Log loaded files during initialization
const logModuleLoad = (moduleName) => {
  console.log(`[INFO] Loading module: ${moduleName}`);
  return (result) => {
    console.log(`[INFO] Successfully loaded: ${moduleName}`);
    return result;
  };
};

// Check S3 configuration
try {
  console.log('[INFO] Checking AWS configuration...');
  const { AWS } = require('./config/index');
  if (!AWS.REGION || !AWS.ACCESS_KEY_ID || !AWS.SECRET_ACCESS_KEY) {
    console.warn('[WARN] AWS configuration is incomplete. S3 operations may fail.');
  } else {
    console.log('[INFO] AWS configuration found.');
  }
  
  // Check AWS SDK version
  try {
    const s3 = require('./helpers/s3');
    console.log('[INFO] S3 helper loaded successfully.');
  } catch (error) {
    console.error('[ERROR] Failed to load S3 helper:', error.message);
    console.error('[ERROR] Check that you have migrated to AWS SDK v3 correctly.');
  }
} catch (error) {
  console.error('[ERROR] Error checking AWS configuration:', error.message);
}

const app = express();
const PORT = process.env.PORT || 3000;

// HTTP request logging using morgan
app.use(morgan((tokens, req, res) => {
  try {
    return [
      `HTTP ${tokens.method(req, res)} ${tokens.url(req, res)}`,
      `Status: ${tokens.status(req, res)}`,
      `- ${tokens['response-time'](req, res)} ms`
    ].join(' ');
  } catch (error) {
    console.error('[ERROR] Error in morgan logger:', error);
    return 'Error logging request';
  }
}));

// Middleware
try {
  // Enhanced CORS configuration for better external access
  const corsOptions = {
    origin: '*', // Allow all origins
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  };
  app.use(cors(corsOptions));
  console.log('[INFO] CORS middleware initialized with access from all origins');
  
  // Handle preflight requests explicitly
  app.options('*', cors(corsOptions));
  
  app.use(express.json({ limit: '50mb' }));
  console.log('[INFO] JSON body parser initialized');
  
  app.use(express.urlencoded({ limit: '50mb', extended: true }));
  console.log('[INFO] URL-encoded parser initialized');
} catch (error) {
  console.error('[ERROR] Failed to initialize middleware:', error);
  process.exit(1);
}

// Health Check Route
app.get('/', (req, res) => {
  console.log('[INFO] Health check endpoint called');
  res.send('OK - Server is running alright!');
});

// Generate API endpoint summary
const generateEndpointSummary = (expressApp) => {
  const routeList = [];
  
  // Extract routes from Express app
  const extractRoutes = (layer, basePath = '') => {
    if (layer.route) {
      const methods = Object.keys(layer.route.methods).join(', ').toUpperCase();
      const path = basePath + layer.route.path;
      routeList.push({ method: methods, path });
    } else if (layer.name === 'router' && layer.handle.stack) {
      const newBasePath = basePath + (layer.regexp ? 
        layer.regexp.source
          .replace(/\\\//g, '/')
          .replace(/\^|\\|\$|\(\?:\(\[\^\\\/\]\+\?\)\)/g, '') 
        : '');
      layer.handle.stack.forEach(stackItem => extractRoutes(stackItem, newBasePath));
    }
  };
  
  // Format the endpoint info
  const formatEndpointInfo = () => {
    const byCategory = {};
    
    // Group routes by major path components
    routeList.forEach(route => {
      const parts = route.path.split('/').filter(Boolean);
      const category = parts.length > 0 ? parts[0] : 'root';
      
      if (!byCategory[category]) {
        byCategory[category] = [];
      }
      
      byCategory[category].push(route);
    });
    
    // Format the output
    let output = '\n=== AVAILABLE API ENDPOINTS ===\n\n';
    
    Object.keys(byCategory).sort().forEach(category => {
      output += `🔹 ${category.toUpperCase()} Routes:\n`;
      
      byCategory[category].sort((a, b) => a.path.localeCompare(b.path)).forEach(route => {
        output += `   ${route.method.padEnd(7)} ${route.path}\n`;
      });
      
      output += '\n';
    });
    
    return output;
  };
  
  return { extractRoutes, formatEndpointInfo };
};

// Check for Swagger and other documentation
const checkDocumentation = (serverUrl) => {
  let infoOutput = '\n=== API DOCUMENTATION ===\n\n';
  
  // Check for Swagger files
  const swaggerLocations = [
    { path: path.join(__dirname, 'swagger.yaml'), url: `${serverUrl}/api-docs` },
    { path: path.join(__dirname, 'swagger.json'), url: `${serverUrl}/api-docs` },
    { path: path.join(__dirname, '..', 'swagger.yaml'), url: `${serverUrl}/api-docs` },
    { path: path.join(__dirname, '..', 'swagger.json'), url: `${serverUrl}/api-docs` },
    { path: path.join(__dirname, 'swagger', 'swagger.yaml'), url: `${serverUrl}/api-docs` },
    { path: path.join(__dirname, 'docs', 'swagger.yaml'), url: `${serverUrl}/api-docs` },
  ];
  
  let swaggerFound = false;
  
  swaggerLocations.forEach(location => {
    if (fs.existsSync(location.path) && !swaggerFound) {
      infoOutput += `📚 Swagger Documentation: ${location.url}\n`;
      swaggerFound = true;
    }
  });
  
  // Check for routes that might be Swagger UIs
  if (!swaggerFound) {
    infoOutput += `📚 API Documentation might be available at: ${serverUrl}/api-docs or ${serverUrl}/docs\n`;
  }
  
  infoOutput += '\n';
  return infoOutput;
};

// Enhanced database connection with detailed error logging
const connectWithRetry = async (retries = 5, delay = 5000) => {
  let lastError;
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`[INFO] Database connection attempt ${attempt}/${retries}`);
      await connectDB();
      console.log('[INFO] Database connected successfully, proceeding with application startup');
      return true;
    } catch (error) {
      lastError = error;
      const errorDetails = {
        message: error.message,
        code: error.code,
        errno: error.errno,
        syscall: error.syscall,
        hostname: error.hostname,
        host: error.host,
        port: error.port,
        stack: error.stack
      };
      
      console.error(`[ERROR] Database connection attempt ${attempt} failed:`, error.message);
      console.error('[ERROR] Error details:', JSON.stringify(errorDetails, null, 2));
      
      if (attempt < retries) {
        console.log(`[INFO] Retrying in ${delay/1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  console.error(`[ERROR] Failed to connect to database after ${retries} attempts`);
  console.error('[ERROR] Last error:', lastError);
  return false;
};

// Start the server with enhanced error logging
const startServer = async () => {
  console.log('[INFO] Starting server...');
  
  try {
    // Connect to database with retry mechanism
    const dbConnected = await connectWithRetry();
    if (!dbConnected) {
      console.error('[ERROR] Could not establish database connection, exiting');
      process.exit(1);
    }
    
    // Set up Swagger documentation 
    setupSwagger(app);
    console.log('[INFO] Swagger documentation initialized');

    // Set up routes
    console.log('[INFO] Setting up application routes');
    try {
      app.use('/api', routes);
      console.log('[INFO] Routes initialized successfully');
    } catch (error) {
      console.error('[ERROR] Failed to initialize routes:', error);
      process.exit(1);
    }
    
    // Set up error handling
    console.log('[INFO] Setting up error handlers');
    app.use(notFoundHandler);
    app.use(errorHandler);
    
    // Start listening on all network interfaces (0.0.0.0)
    app.listen(PORT, '0.0.0.0', () => {
      const serverUrl = `${BASE_URL}:${PORT}`;
      logger.info(`Server running on ${serverUrl}`);
      console.log(`[INFO] Server running on ${serverUrl}`);
      console.log(`[INFO] Server is bound to all network interfaces (0.0.0.0)`);
      console.log(`[INFO] Access Swagger documentation at:`);
      console.log(`   - ${serverUrl}/api-docs`);
      console.log(`   - ${serverUrl}/api/docs`);
      
      // Display API information after server starts
      console.log('\n=== SERVER INFORMATION ===');
      console.log(`🚀 Server running at: ${serverUrl}`);
      console.log(`🔐 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📋 Node.js Version: ${process.version}`);
      
      // Display documentation information
      console.log(checkDocumentation(serverUrl));
      
      // Once the server is running, analyze and display the endpoints
      setTimeout(() => {
        try {
          // Only extract routes after routes have been set up
          if (app._router) {
            const { extractRoutes, formatEndpointInfo } = generateEndpointSummary(app);
            app._router.stack.forEach(layer => extractRoutes(layer));
            console.log(formatEndpointInfo());
            console.log('=== SERVER STARTED SUCCESSFULLY ===\n');
          }
        } catch (error) {
          console.error('[ERROR] Failed to generate endpoint summary:', error.message);
        }
      }, 1000); // Small delay to ensure all routes are registered
    });
  } catch (error) {
    console.error('[ERROR] Failed to start server:', error);
    console.error('[ERROR] Stack trace:', error.stack);
    process.exit(1);
  }
};

// Start the application
startServer().catch(error => {
  console.error('[FATAL] Unexpected error during server startup:', error);
  process.exit(1);
});

// Export app for testing
module.exports = app;