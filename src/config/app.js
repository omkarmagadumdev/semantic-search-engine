import express from 'express';
import cors from 'cors';

import { REQUEST_LIMIT } from './constants.js';
import vectorRoutes from '../routes/vectorRoutes.js';
import documentRoutes from '../routes/documentRoutes.js';
import systemRoutes from '../routes/systemRoutes.js';

const app = express();

app.use(cors());
app.use(express.json({ limit: REQUEST_LIMIT }));
app.use(express.urlencoded({ limit: REQUEST_LIMIT, extended: true }));

app.use(vectorRoutes);
app.use(documentRoutes);
app.use(systemRoutes);

export { app };
