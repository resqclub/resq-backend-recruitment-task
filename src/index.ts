import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import paymentRouter from './routes/payment.route';

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

// Use routes
app.use('/payment', paymentRouter);

app.listen(port, () => {
  console.log(`Backend listening on port ${port}`);
});
