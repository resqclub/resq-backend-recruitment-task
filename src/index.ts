import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

app.get('/welcome', (req, res) => {
  res.json('Welcome to R API');
});

app.listen(port, () => {
  console.log(`Backend listening on port ${port}`);
});
