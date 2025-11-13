const express = require('express');
const swaggerUi = require('swagger-ui-express');

const studentsRouter = require('./routes/students');
const coursesRouter = require('./routes/courses');

const swaggerDoc = require('../swagger.json');
const app = express();
app.use(express.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));

const storage = require('./services/storage');

storage.seed();

app.use('/students', studentsRouter);

app.use('/courses', coursesRouter);

app.use((res) => {
  res.status(404).json({ error: 'Not Found' });
});

app.use((err, res ) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

if (require.main === module) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}

module.exports = app;
