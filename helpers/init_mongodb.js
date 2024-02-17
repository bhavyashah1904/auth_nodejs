const mongoose = require('mongoose');

mongoose
  .connect(process.env.MONGODB_URI,
    { dbName: process.env.DB_NAME }
  )
  .then(() => {
    console.log('MongoDB connected');
  })
  .catch((error) => console.log(error.message));


//Connection events
mongoose.connection.on('connected', () => {
    console.log("Mongoose Connected to db")
})
mongoose.connection.on('err', (err) => {
    console.log(err.message)
})
mongoose.connection.on('disconnected', () => {
    console.log("Mongoose Connection is disconnected")
})

//The mongoose connection doesn't get disconnected on its own even if your app has stopped. Its needs to be disconneted properly
//You can listen to the SIGINT event on the process, it gets fired whenevr ctrl+c is preesed on the terminal

process.on('SIGINT', async () => {
    await mongoose.connection.close();
    process.exit(0)
})

