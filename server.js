const express = require("express");
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());

const uri = "mongodb+srv://shamsjubair:shamsjubair111@cluster0.w9vks9x.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";




// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });
  
  async function run() {
    try {
    
      await client.connect();

      const database = client.db("whatsAppDB");
      const userTable = database.collection("users");
      const chatHistory = database.collection("chatHistory");
      

      app.post("/createUser", async(req,res) =>{
        
        const query = {
            email: req?.body?.email
        }
        const alreadyRegistered = await userTable.findOne(query);
        
        if(alreadyRegistered !== null){
        res.send("Already has a user with this email. Please try again with another email");
        }
        else{

            const registerResult = await userTable.insertOne(req.body);
            res.send("User created successfully. Login now to chat");

        
        }
        

      })

      app.post("/login", async(req,res) =>{
        
        const query = {
            userName: req?.body?.userName,
            password: req?.body?.password 
        }
        
        const verifyUser = await userTable.findOne(query);
        if(req?.body?.userName === verifyUser?.userName && req?.body?.password === verifyUser?.password){
            res.send(true)
        }
        else{
            res.send(false);
        }

      })


      app.post("/sendMessage", async(req,res) =>{
         
        const messageBody = req.body;
        console.log(req?.body);
        const result = await chatHistory.insertOne(messageBody);
        res.send("Successful");

      })


      app.get("/getAllUsers", async(req,res) => {
        const cursor = userTable.find();
        const userList = await cursor.toArray();
        res.send(userList);
      })


      app.get("/getSpecificChat", async(req, res) =>{

        const query1 ={

          sender: req?.query?.sender,
          receiver: req?.query?.receiver 
        }

        const query2 ={

          sender: req?.query?.receiver,
          receiver: req?.query?.sender 
        }
      
        const cursor1 = chatHistory.find(query1);
        const cursor2 = chatHistory.find(query2);

        const result1 = await cursor1.toArray();
        const result2 = await cursor2.toArray();
        
        // console.log(result1);
        // console.log(result2);

        const finalResult = result1.concat(result2);

        finalResult.sort((a, b) => {
          const timeA = a.time.split(':').map(Number);
          const timeB = b.time.split(':').map(Number);
        
          if (timeA[0] !== timeB[0]) {
            return timeA[0] - timeB[0];
          } else if (timeA[1] !== timeB[1]) {
            return timeA[1] - timeB[1];
          } else {
            return timeA[2] - timeB[2];
          }
        });
        
        // console.log(finalResult);
        res.send(finalResult);

      })



     

    } finally {
     
    //   await client.close();
    }
  }
  run().catch(console.dir);



app.listen(port, ()=>{
    console.log("Server is running on port " + port);
})