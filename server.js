
const express = require('express');
const cors = require('cors');
const app = express();
const port = 3001;
const bodyParser = require('body-parser');
const path = require('path')
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended : true}));
const mysql = require('mysql');

const jwt = require('jsonwebtoken');
const { expressjwt: exjwt } = require('express-jwt');
const secretKey = 'My super secret key';

const jwtMW = exjwt({
    secret: secretKey,
    algorithms: ['HS256']
});

var connection = mysql.createConnection({
    host: 'sql5.freemysqlhosting.net',
    user: 'sql5669074',
    password: 'vQ2NDuY21i',
    database: 'sql5669074'
});

app.use(cors());



app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'https://renderfront-ovcw.onrender.com');
    res.setHeader('Access-Control-Allow-Headers', 'Content-type,Authorization');
    next();
})


app.use(function (err, req, res, next) {
    console.log(err.name === 'UnauthorizedError');
    console.log(err);
    if (err.name === 'UnauthorizedError') {
        res.status(401).json({
            success:false,
            officialError: err,
            err: "Username or password is wrong2"
        });
    }
    else{
        next(err);
    }
});


app.listen(port, () => {
    console.log(`API served at http://localhost:${port}`);
});




app.post('/api/createaccount', (req, res) => {
    const { username, password } = req.body;

    //make sure there there is no blank fields
    if (username.trim() === '' || password.trim() === '') {
        return res.status(400).json({
            success: false,
            message: 'Username and password are required.',
          });      
        } else {
        console.log('The string is not blank.');
      }

    //make sure there is no dup username that exists
    console.log('This is me',username, password);

    connection.query('SELECT * FROM users', function (error, results, fields) {
        if (error) 
        {
            return res.status(409).json({
                success: false,
                message: 'db not connecting try again',
              });  
        }
        //console.log("length is this: " + results.length);
        console.log(results[0]);

        for (let i = 0; i < results.length; i++) {
            var dbUsername = results[i].username;
            if(dbUsername == username)
            {
                return res.status(409).json({
                    success: false,
                    message: 'Username already exists. Choose a different username.',
                  });            
            }
        }
        res.json({
            success: true,
            message: 'Account Created Successfully'
          });   

    });

    connection.query('INSERT INTO users VALUES ("", ?, ?)', [username, password], function (error, results, fields) {
          if (error) 
          {            return res.status(409).json({
            success: false,
            message: 'db not connecting try again',
            error: error
          });  }
      });    

});

app.post('/api/loginpage', (req, res) => {
    const { username, password } = req.body;
    console.log('This is me',username, password);

    connection.query('SELECT * FROM users', function (error, results, fields) 
    {
        if (error)
        {
            return res.status(409).json({
                success: false,
                message: 'db not connecting try again',
                error: error
              });  
        } 
        //console.log("length is this: " + results.length);
        //console.log(results[0]);

        var credientalsFalse = true;
        var dbID = 0

        for (let i = 0; i < results.length; i++) {
            var dbUsername = results[i].username;
            var dbPassword = results[i].password;
            if(dbUsername == username && dbPassword == password)
            {
                dbID = results[i].id;
                credientalsFalse = false;         
            }
        }
        if(credientalsFalse)
        {    res.status(401).json({
            success: false,
            message: 'Invalid username or password',
            token: null
          });
        }
        else{
            //implement the token to push it to the front end
            let token = jwt.sign({id: dbID, username: username }, secretKey, {expiresIn: '1m'});
            res.json({
                success: true,
                message: 'Login successful',
                token: token
            });
        }
    });
});


app.post('/api/makebudget', jwtMW, (req, res) => {
    // Extract JWT token from the request headers
    const authorizationHeader = req.headers.authorization;
    const token = authorizationHeader ? authorizationHeader.split(' ')[1] : null;
  
    if (!token) {
      // Handle the case where there's no token
      return res.status(401).json({ error: 'Unauthorized - No JWT token provided' });
    }
  
    try {
      // Verify the JWT token
      const decoded = jwt.verify(token, secretKey); // Replace with your actual secret key
  
      // Now, you can access the user information from the decoded token
      const userId = decoded.id;
      console.log('User ID:', userId);
  
      // Access the submitted data from the React app
      const formData = req.body.formData;
  
      // Process the data as needed
      console.log('Received data from React app:', formData);
      console.log('Received data from React app:', formData[0].title);

      var numberOfBudgets = formData.length;
      const sqlC = Array.from({ length: 12 }, () => null);
      const sqlA = Array.from({ length: 12 }, () => null);


      for (let i = 0; i < numberOfBudgets; i++) 
      {
        sqlA[i] = formData[i].amount;
        sqlC[i] = formData[i].title;
      }

      console.log(sqlC);
      console.log(sqlA)
      

  
      // Send a response (adjust as needed)

      connection.query('SELECT * FROM userbudget WHERE id = (?)', [userId], function (error, results, fields) {
        if (error){
            return res.status(409).json({
                success: false,
                message: 'db not connecting try again',
                error: error
              });  
        } 
        console.log(typeof results); // Outputs: 'string'
        console.log(Object.keys(results).length === 0); // Outputs: true
        var objisEmpty = Object.keys(results).length

        if(objisEmpty == 0)
        {
                connection.query('INSERT INTO userbudget VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                 [userId,numberOfBudgets,sqlC[0], sqlA[0], sqlC[1], sqlA[1], sqlC[2], sqlA[2], sqlC[3], sqlA[3], sqlC[4], sqlA[4], sqlC[5], sqlA[5], sqlC[6], sqlA[6], sqlC[7], sqlA[7], sqlC[8], sqlA[8], sqlC[9], sqlA[9], sqlC[10], sqlA[10], sqlC[11], sqlA[11]], function (error, results, fields) {
          if (error){

          } 
      });   
        }
        else{

            //DELETE FROM your_table_name_here WHERE userid = 1;

            connection.query('DELETE FROM userbudget WHERE id = (?)', [userId], function (error, results, fields) 
            {
                if (error) {            return res.status(409).json({
                    success: false,
                    message: 'db not connecting try again',
                    error: error
                  });  }
            });

            connection.query('INSERT INTO userbudget VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [userId,numberOfBudgets,sqlC[0], sqlA[0], sqlC[1], sqlA[1], sqlC[2], sqlA[2], sqlC[3], sqlA[3], sqlC[4], sqlA[4], sqlC[5], sqlA[5], sqlC[6], sqlA[6], sqlC[7], sqlA[7], sqlC[8], sqlA[8], sqlC[9], sqlA[9], sqlC[10], sqlA[10], sqlC[11], sqlA[11]], function (error, results, fields) {
            if (error) 
            {            return res.status(409).json({
                success: false,
                message: 'db not connecting try again',
                error: error
              });  }
        });
        }
        res.json({ message: 'Data received successfully on the server.' });

    }); 

    } catch (error) {
      // Handle the case where the token is invalid
      console.error('Error decoding JWT token:', error);
      res.status(401).json({ error: 'Unauthorized - Invalid JWT token' });
    }
  });

  app.post('/api/addexpense', jwtMW, (req, res) => {
    // Extract JWT token from the request headers
    const authorizationHeader = req.headers.authorization;
    const token = authorizationHeader ? authorizationHeader.split(' ')[1] : null;
  
    if (!token) {
      // Handle the case where there's no token
      return res.status(401).json({ error: 'Unauthorized - No JWT token provided' });
    }
  
    try {
      // Verify the JWT token
      const decoded = jwt.verify(token, secretKey); // Replace with your actual secret key
  
      // Now, you can access the user information from the decoded token
      const userId = decoded.id;
      console.log('User ID:', userId);

  
      // Continue processing the form data
      const { title, budget, tag } = req.body;
      console.log('Received form data:');
      console.log('Title:', title);
      console.log('Budget:', budget);
      console.log('Tag:', tag);
  
      // Send a response


    //add expenses to the table
    connection.query('INSERT INTO budget VALUES (?, ?, ?, ?)', [userId, title, budget, tag], function (error, results, fields) {
        if (error){            return res.status(409).json({
            success: false,
            message: 'db not connecting try again',
            error: error
          });  }
    });   
    res.json({ message: 'Form data received successfully' });




    } catch (error) {
      // Handle the case where the token is invalid
      console.error('Error decoding JWT token:', error);
      res.status(401).json({ error: 'Unauthorized - Invalid JWT token' });
    }
  });

  app.get('/api/getbudget', jwtMW, (req, res) => {
    // Extract JWT token from the request headers
    const authorizationHeader = req.headers.authorization;
    const token = authorizationHeader ? authorizationHeader.split(' ')[1] : null;
  
    if (!token) {
      // Handle the case where there's no token
      return res.status(401).json({ error: 'Unauthorized - No JWT token provided' });
    }
  
    try 
    {
      // Verify the JWT token
      const decoded = jwt.verify(token, secretKey); 
      const userId = decoded.id;
      //console.log('User ID:', userId);
  

      
      //extract the budget from the db 
      connection.query('SELECT * FROM userbudget WHERE id = (?)', [userId], function (error, results, fields) 
      {
          if (error) {
            return res.status(409).json({
                success: false,
                message: 'db not connecting try again',
                error: error
              });  
          }
          console.log("The error is ocurring here: ",results)
          if(results.length == 0)
          { 
            res.status(400).json({ error: 'no budget created' });
            return;
        }
          var size = results[0].size
          var initialValue = ''; 
          //console.log('hi')
          var categoryArray = new Array(size*2).fill(initialValue);
          var reducedCatagoryArray = new Array(size).fill(initialValue);
          if(results.length > 1)
          { res.status(400).json({ error: 'configure your budget again' });}

            categoryArray[0] = results[0].catagory1 
            categoryArray[1] = results[0].catagory2
            categoryArray[2] = results[0].catagory3
            categoryArray[3] = results[0].catagory4
            categoryArray[4] = results[0].catagory5
            categoryArray[5] = results[0].catagory6
            categoryArray[6] = results[0].catagory7
            categoryArray[7] = results[0].catagory8
            categoryArray[8] = results[0].catagory9
            categoryArray[9] = results[0].catagory10
            categoryArray[10] = results[0].catagory11
            categoryArray[11] = results[0].catagory12

          for (var i = 0; i < size; i ++) 
          {reducedCatagoryArray[i] = categoryArray[i]}
          
         // console.log("catagories heaaare: ",reducedCatagoryArray)
          res.json(
            { 
                success: true,
                message: 'Budget information  good sent successfully',
                budget: reducedCatagoryArray
            });
      });

    }

     catch (error) 
    {
      // Handle the case where the token is invalid
      console.error('Error decoding JWT token:', error);
      res.status(401).json({ error: 'Unauthorized - Invalid JWT token' });
    }
  
  });


  app.get('/api/getAll', jwtMW, (req, res) => {
    // Extract JWT token from the request headers
    const authorizationHeader = req.headers.authorization;
    const token = authorizationHeader ? authorizationHeader.split(' ')[1] : null;
  
    if (!token) {
      // Handle the case where there's no token
      return res.status(401).json({ error: 'Unauthorized - No JWT token provided' });
    }
  
    try 
    {
      // Verify the JWT token
      const decoded = jwt.verify(token, secretKey); 
      const userId = decoded.id;
      console.log('User ID:', userId);
  


        var value;
      //nested connection query

      connection.query('SELECT * FROM userbudget WHERE id = (?)', [userId], function (error, results, fields) 
      {
          if (error) {            return res.status(409).json({
            success: false,
            message: 'db not connecting try again',
            error: error
          });  }
          console.log("The error is ocurring here: ",results)
          if(results.length == 0)
          { 
            res.status(400).json({ error: 'no budget created' });
            return;
        }
          var size = results[0].size
          var initialValue = ''; 
          //console.log('hi')
          var categoryArray = new Array(12).fill(initialValue);
          var reducedCatagoryArray = new Array(size).fill(initialValue);
          var expense = new Array(12).fill(initialValue);
          var reducedBudget = new Array(size).fill(initialValue);

          if(results.length > 1)
          { res.status(400).json({ error: 'configure your budget again' });}

            categoryArray[0] = results[0].catagory1 
            categoryArray[1] = results[0].catagory2
            categoryArray[2] = results[0].catagory3
            categoryArray[3] = results[0].catagory4
            categoryArray[4] = results[0].catagory5
            categoryArray[5] = results[0].catagory6
            categoryArray[6] = results[0].catagory7
            categoryArray[7] = results[0].catagory8
            categoryArray[8] = results[0].catagory9
            categoryArray[9] = results[0].catagory10
            categoryArray[10] = results[0].catagory11
            categoryArray[11] = results[0].catagory12
            
            expense[0] = results[0].budget1
            expense[1] = results[0].budget2
            expense[2] = results[0].budget3
            expense[3] = results[0].budget4
            expense[4] = results[0].budget5
            expense[5] = results[0].budget6
            expense[6] = results[0].budget7
            expense[7] = results[0].budget8
            expense[8] = results[0].budget9
            expense[9] = results[0].budget10
            expense[10] = results[0].budget11
            expense[11] = results[0].budget12

        for (var i = 0; i < size; i ++) 
        {
           reducedCatagoryArray[i] = categoryArray[i].toLowerCase()
           reducedBudget[i] =  expense[i]   
        }
          console.log("res catagory: ",reducedCatagoryArray)
          console.log("res expense: ",reducedBudget)


        //got the budget, now I need to get all the expenses made by the user
          connection.query('SELECT * FROM budget WHERE id = (?)', [userId], function (err, resp, fields) 
          {
            if (error){            return res.status(409).json({
                success: false,
                message: 'db not connecting try again',
                error: error
              });  }
            console.log(resp)
            var respSize = resp.length
            const expenses = [];

            for (const item of resp) {
                expenses.push({
                  title: item.title,
                  budget: item.budget,
                  tag: item.tag
                });
              }

              const filteredExpenses = expenses.filter((expense) =>
              reducedCatagoryArray.some((category) => category.toLowerCase() === expense.title.toLowerCase())
              );
            
          //  console.log("filtered: ",filteredExpenses);
              
            
           // console.log("expenses: ", expenses);

            res.json(
                { 
                    success: true,
                    message: 'Budget information  good sent successfully',
                    catagory: reducedCatagoryArray, 
                    budget: reducedBudget,
                    expense: filteredExpenses
                });
          });
      });




    }

     catch (error) 
    {
      // Handle the case where the token is invalid
      console.error('Error decoding JWT token:', error);
      res.status(401).json({ error: 'Unauthorized - Invalid JWT token' });
    }
  
  });

  