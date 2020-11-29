require("dotenv").config();
const express = require("express");
const app = express();
const connection = require("./config");
const port = process.env.PORT || 3000;

connection.connect(function (err) {
  if (err) {
    console.error("error connecting: " + err.stack);
    return;
  }

  console.log("connected as id " + connection.threadId);
});

app.use(express.json());

////////////////////////////////////////////////////////////GET - Retrieve all of the data from your table

app.get("/api/bar", (req, res) => {
  connection.query("SELECT * from bar", (err, results) => {
    if (err) {
      res.status(500).send("Error retrieving data");
    } else {
      res.status(200).json(results);
    }
  });
});

/////////////////////////////////////////////////////GET - Retrieve specific fields (i.e. id, names, dates, etc.)

app.get("/api/bar/alcool/:id", (req, res) => {
  connection.query(
    "SELECT * from bar WHERE id=?",
    [req.params.id],
    (err, results) => {
      if (err) {
        console.log(err);
        res.status(500).send("Error retrieving a drink");
      } else {
        if (results.length === 0) {
          return res.status(404).send("drink not found");
        } else {
          res.status(200).json(results);
        }
      }
    }
  );
});

/////////////////////////////////////////////////A filter for data that contains... (e.g. name containing the string 'wcs')

// http://localhost:3000/api/bar/contains/?alcool=vin

app.get("/api/bar/contains/", (req, res) => {
  let sql = "SELECT * FROM bar";
  const sqlValues = [];

  if (req.query.alcool) {
    sql += " WHERE alcool LIKE ?";
    sqlValues.push(`%${req.query.alcool}%`);
  }

  connection.query(sql, sqlValues, (err, results) => {
    if (err) {
      res.status(500).send(`An error occurred: ${err.message}`);
    } else if (results.length === 0) {
      return res.status(404).send("We don't have this drink for you tonight👎");
    } else {
      res.status(200).json(results);
    }
  });
});

/////////////////////////////////////////////////   A filter for data that starts with... (e.g. name beginning with 'campus')

//http://localhost:3000/api/bar/starts/?alcool=v

app.get("/api/bar/starts", (req, res) => {
  let sql = "SELECT * FROM bar";
  const sqlValues = [];

  if (req.query.alcool) {
    sql += " WHERE alcool LIKE ?";
    sqlValues.push(`${req.query.alcool}%`);
  }

  connection.query(sql, sqlValues, (err, results) => {
    if (err) {
      res.status(500).send(`An error occurred: ${err.message}`);
    } else if (results.length === 0) {
      return res.status(404).send("We don't have this drink for you tonight👎");
    } else {
      res.status(200).json(results);
    }
  });
});
//////////////////////////////A filter for data that is greater than... (e.g. date greater than 18/10/2010)
// http://localhost:3000/api/inventory/?stock=10

app.get("/api/inventory/", (req, res) => {
  connection.query(
    `SELECT * from bar WHERE stock>?`,
    [req.query.stock],
    (err, results) => {
      if (err) {
        console.log(err);
        res.status(500).send("Error retrieving data");
      } else {
        res.status(200).json(results);
      }
    }
  );
});

//////////////////////////////////ORDER BY
// http://localhost:3000/api/bar/list/DESC

app.get("/api/bar/list/:order", (req, res) => {
  connection.query(
    `SELECT * FROM bar ORDER BY alcool ${req.params.order}`,
    [req.params.order],
    (err, results) => {
      if (err) {
        console.log(err);
        res.status(500).send("Error listing drinks");
      } else {
        res.status(200).json(results);
      }
    }
  );
});

/////////////////////////////////////POST - Insertion of a new entity

app.post("/api/bar", (req, res) => {
  const { alcool, achat, fort, stock } = req.body;
  connection.query(
    "INSERT INTO bar(alcool, achat, fort, stock) VALUES(?, ?, ?, ?)",
    [alcool, achat, fort, stock],
    (err, results) => {
      if (err) {
        console.log(err);
        res
          .status(500)
          .send("Error saving a drinks, the bars stays empty T_T ");
      } else {
        res.status(200).send("Successfully saved, CHEERS MATE");
      }
    }
  );
});

///////////////////////////////////////////PUT

app.put("/api/bar/alcool/:id", (req, res) => {
  const idAlcool = req.params.id;
  const newAlcool = req.body;

  connection.query(
    "UPDATE bar SET ? WHERE id = ?",
    [newAlcool, idAlcool],
    (err, results) => {
      if (err) {
        console.log(err);
        res.status(500).send("Error updating your beverage");
      } else {
        res.status(200).send("Beverage updated successfully, Cheers 🎉");
      }
    }
  );
});

app.put("/api/bar/fort/:id", (req, res) => {
  connection.query(
    "UPDATE bar SET fort=!fort WHERE id = ?",
    [req.params.id],
    (err, results) => {
      if (err) {
        console.log(err);
        res.status(500).send("Error updating your beverage");
      } else {
        res
          .status(200)
          .send("Beverage category successfully updated , Cheers 🎉");
      }
    }
  );
});

//////////////////////////DELETE / BOOLEAN FALSE

app.delete("/api/bar/fort", (req, res) => {
  connection.query("DELETE FROM bar WHERE fort = 1", (err) => {
    if (err) {
      res.status(500).send("An error has occured.");
    } else {
      res
        .status(200)
        .send("All strong drinks have been deleted, better for your health!");
    }
  });
});

///////////////////////////////////DELETE

app.delete("/api/bar/alcool/:id", (req, res) => {
  connection.query("DELETE FROM bar WHERE id = ?", [req.params.id], (err) => {
    if (err) {
      res.status(500).send("An error has occured.");
    } else {
      res.status(200).send("You finished the drink");
    }
  });
});

app.listen(port, () => {
  console.log(`Server is runing on 8080`);
});
