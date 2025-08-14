/*import mongoose */
import mongoose from 'mongoose';

/*This is to use MONGO_URI in .env */
import dotenv from 'dotenv';
dotenv.config();



const MONGO_URI = process.env.MONGO_URI;


if(!MONGO_URI){
    console.error('MONGO_URI is not found in .env');
    process.exit(1);
}

/*connects mongoose to database */
mongoose.connect(MONGO_URI);


mongoose.connection.on('connected', ()=>{
    console.log("Database is connected")
})

mongoose.connection.on('error', (err)=>{
    console.error(`Could not connect Database ${err}`);
})

mongoose.connection.on('disconnected', ()=>{
    console.warn(`Database is disconnected`);
})

export default mongoose;