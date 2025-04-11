const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const { connectDB } = require('./config/database');
const routes = require('./routes');
const { errorHandler, notFoundHandler } = require('./middlewares/errorHandler');
const { logger, logHttp, logServerStart } = require('./utils/logger');
const { BASE_URL } = require('./config/index');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// HTTP request logging using morgan
app.use(morgan((tokens, req, res) => {
  logHttp(req);
  return [
    `HTTP ${tokens.method(req, res)} ${tokens.url(req, res)}`,
    `Status: ${tokens.status(req, res)}`,
    `- ${tokens['response-time'](req, res)} ms`
  ].join(' ');
}));

// Middleware
app.use(cors());
// ⬇️ Allow up to 50MB for JSON and URL-encoded bodies
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));


// Health Check Route
app.get('/', (req, res) => res.send('OK - Server is running!'));

// Routes
app.use('/api', routes);

// Handle 404 - Not Found
app.use(notFoundHandler);

// Global Error Handler
app.use(errorHandler);

// Start the server
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    logger.info(`Server running on ${BASE_URL}:${PORT}`);
  });
};

startServer();
