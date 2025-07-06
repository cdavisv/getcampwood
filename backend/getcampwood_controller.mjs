/**
 * Add your first name and last name.
 */
import 'dotenv/config';
import express from 'express';
import asyncHandler from 'express-async-handler';
import * as getcampwood from './getcampwood_model.mjs';

const PORT = process.env.PORT;
const app = express();

app.use(express.json());

app.listen(PORT, async () => {
    await getcampwood.connect()
    console.log(`Server listening on port ${PORT}...`);
});