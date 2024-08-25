const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const connectDB = require('./db/connect');

require('dotenv').config();

const port = process.env.PORT || 5000;

/*/ Middleware */
app.use(
  cors({
    origin: 'http://localhost:3001', // Allow requests from this origin
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true, // If you need to send cookies or authentication headers
  })
);
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

/** Router */
const authRouter = require('./routes/auth');
const booksRouter = require('./routes/books');

/**       */
app.get('/', (req, res) => {
  res.send('<h1>Home Page</h1>');
});

app.use('/api/auth', authRouter);
app.use('/api/books', booksRouter);

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();
