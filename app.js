const express = require('express');

// load environment variables
require('dotenv').config();

const orderRoutes = require('./routes/order');

const server = express();


// your app global middlewares
server.use(express.json());


// routing your http requests
server.use('/api', orderRoutes);


// request `Not Dound` handler
server.use((req, res, next) => {
  const error = new Error('Not Found');
  error.status = 404;
  throw error;
});


// thrown erros handler
server.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({ message: error.message || 'Internal Server Error' });
});


// bootstrap your server
server.listen(process.env.PORT, () => console.log('Server running on port ' + process.env.PORT));
