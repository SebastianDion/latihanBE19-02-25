const express = require('express');
const mysql = require('mysql2');
const { body, validationResult } = require('express-validator');
const app = express();

require('dotenv').config();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


console.log(process.env.DB_USER, "process.env.DB_USER")
console.log(process.env.DB_PASSWORD, "process.env.DB_PASSWORD")
console.log(process.env.DB_NAME, "process.env.DB_NAME")
const database = mysql.createConnection({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  host : process.env.DB_HOST
});


app.get('/init', (req, res) => {
  const sqlQuery =  'CREATE TABLE IF NOT EXISTS usernames(id int AUTO_INCREMENT, firstname VARCHAR(50), lastname VARCHAR(50), PRIMARY KEY(id))';

  console.log(database,"database")

  database.query(sqlQuery, (err) => {
      if (err) throw err;

      res.send('Table created!')
  });
});


app.post('/subscribe', 
  
  body('firstname').not().isEmpty().escape(),
  body('lastname').not().isEmpty().escape(),
  (req, res) => {
      const errors = validationResult(req);
      const{firstname, lastname} = req.body;
      const sqlQuery = "INSERT INTO usernames (firstname, lastname) VALUES (?, ?)";

      if (errors.array().length > 0) {
          res.send(errors.array());
      } else {
          const subscriber = {
              firstname: req.body.firstname,
              lastname: req.body.lastname,
          };
  
          
  
          database.query(sqlQuery, [firstname, lastname], (err, result) => {

              if (err) throw err;
              console.log(err, "err");
            
              console.log(result, "results");
              res.send('Subscribed successfully!');
          });
      }
});

app.get('/', (req, res) => {
  const sqlQuery = 'SELECT * FROM usernames';

  database.query(sqlQuery, (err, result) => {
      if (err) throw err;

      res.json({ 'Username': result });
  });
});

app.delete('/delete/:id', (req, res) => {
  const userId = req.params.id;
  const sqlQuery = 'DELETE FROM usernames WHERE id = ?';

  database.query(sqlQuery, [userId], (err, result) => {
      if (err) {
          console.error("Database error:", err);
          return res.status(500).send("Database error.");
      }
      
      if (result.affectedRows === 0) {
          return res.status(404).send("User not found.");
      }

      res.send("User deleted successfully!");
  });
});

app.get('/search/:name', (req, res) => {
  const searchTerm = req.params.name; // Get name from URL parameter
  const sqlQuery = 'SELECT * FROM usernames WHERE firstname LIKE ? OR lastname LIKE ?';
  const searchValue = `%${searchTerm}%`;

  database.query(sqlQuery, [searchValue, searchValue], (err, result) => {
      if (err) {
          res.status(500).json({ error: err.message });
          return;
      }

      res.json({ results: result });
  });
});



// app.listen(3000, () => {   
  const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);  
});