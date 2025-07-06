/**
 * Add your first name and last name.
 */
import mongoose from 'mongoose';
import 'dotenv/config';

const GETCAMPWOOD_DB_NAME = 'getcampwood_db';

let connection = undefined;

/**
 * This function connects to the MongoDB server and to the database
 *  'getcampwood_db' in that server.
 */
async function connect(){
    try{
        connection = await mongoose.connect(process.env.MONGODB_CONNECT_STRING, 
                {dbName: GETCAMPWOOD_DB_NAME});
        console.log("Successfully connected to MongoDB using Mongoose!");
    } catch(err){
        console.log(err);
        throw Error(`Could not connect to MongoDB ${err.message}`)
    }
}

export { connect};