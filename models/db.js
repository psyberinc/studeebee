const mongoose = require('mongoose');

// Connect Mongoose
mongoose.connect("mongodb://103.86.177.201:32768/studeebee", { useNewUrlParser: true, useUnifiedTopology: true },(err)=>{
    if(err) console.log(`Connection Error: ${err}`);
    else console.log('Connected Succesfully');  
});
mongoose.set('useCreateIndex', true);
