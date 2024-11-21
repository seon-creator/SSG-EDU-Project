const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');
require('dotenv').config();
const cookieParser = require('cookie-parser');


const connectDB = require('./config/database');
const corsOptions = require('./config/cors');
const errorHandler = require('./middlewares/error.middleware');

const app = express();

// Connect to Database
connectDB();
app.use(cookieParser());
// Middlewares
app.use(helmet());
app.use(cors(corsOptions));
app.use(morgan('dev'));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/v1/auth', require('./routes/auth.routes'));
app.use('/api/v1/users', require('./routes/user.routes'));
app.use('/api/v1/admin', require('./routes/admin.routes'));
app.use('/api/v1/report', require('./routes/report.routes'));
app.use('/api/v1/api', require('./routes/api.routes'));
// Error Handler
app.use(errorHandler);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    data: null
  });
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
