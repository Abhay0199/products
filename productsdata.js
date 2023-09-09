let express = require("express");
let app = express();
app.use(express.json());
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Methods",
        "GEt, POST , OPTIONS, PUT, PATCH,DELETE,HEAD"
    );
    res.header(
        "Access-Control-Allow-Headers",
        "Origin,X-Requested-With,Content-Type,Accept"
    );
    next();
});
const port = 2410;
app.listen(port, () => console.log(`Node app listening on port ${port}!`));

const { Client } = require("pg");
const connection = new Client({
    user: "postgres",
    password: "7830928904abhay",
    database: "postgres",
    port: 5432,
    host: "db.jhgawhozadvuhgrejjkl.supabase.co",
    ssl: { rejectUnauthorized: false },
});
connection.connect(function (res, error) {
    console.log(`connected!!!`);
});




app.get("/products", (req, res, next) => {
    const { brand, ram, rom } = req.query;
    const conditions = [];
    const values = [];

    if (brand) {
        const brandValues = brand.split(',');
        conditions.push(`brand = ANY($${values.length + 1}::text[])`);
        values.push(brandValues);
    }
    if (ram) {
        const ramValues = ram.split(',');
        conditions.push(`ram = ANY($${values.length + 1}::text[])`);
        values.push(ramValues);
    }
    if (rom) {
        const romValues = rom.split(',');
        conditions.push(`rom = ANY($${values.length + 1}::text[])`);
        values.push(romValues);
    }

    let sql = "SELECT * FROM products";

    if (conditions.length > 0) {
        sql += " WHERE " + conditions.join(" AND ");
    }

    connection.query(sql, values, (err, results) => {
        console.log(sql, values); // Logging SQL query and parameter values for debugging
        if (err) {
            console.error("Error fetching products:", err);
            res.status(500).json({ error: "Internal Server Error" });
            return;
        }
        res.send(results.rows);
    });
});



app.get("/products/:id", (req, res, next) => {
    const { id } = req.params;
    connection.query(`SELECT * FROM products WHERE id = $1`, [id], (err, results) => {
        if (err) {
            console.error("Error fetching products by ID:", err);
            res.status(500).json({ error: "Internal Server Error" });
            return;
        }
        if (results.length === 0) {
            res.status(404).json({ error: "Employee not found" }); // Updated the error message
        } else {
            res.json(results.rows[0]);
        }
    });
});

app.post("/products", (req, res, next) => {
    const { name, price, brand, ram, rom, os } = req.body;

    connection.query(
        "INSERT INTO products (name,price,brand,ram,rom,os) VALUES ($1, $2, $3, $4, $5, $6)",
        [name, price, brand, ram, rom, os],
        (err, results) => {
            if (err) {
                console.error("Error adding employee:", err);
                res.status(500).json({ error: "Internal Server Error" });
                return;
            }
            res.send(`${results.rowCount} insertion successfull`);
        }
    );
});






app.put("/products/:id", (req, res, next) => {
    const { id } = req.params; // Remove the .id here
    const { name, price, brand, ram, rom, os } = req.body;
    connection.query(
        "UPDATE products SET name = $1, price = $2, brand = $3, ram = $4, rom = $5, os = $6 WHERE id =$7",
        [name, price, brand, ram, rom, os, id], // Add 'id' to the parameter array
        (err, result) => { // Change 'results' to 'result'
            if (err) {
                console.error("Error updating products:", err);
                res.status(500).json({ error: "Internal Server Error" });
                return;
            }
            res.send(`${result.rowCount} updation successful`);
        });
});



app.delete("/products/:id", (req, res) => {
    const { id } = req.params;
    connection.query("DELETE FROM products WHERE id = $1", [id], (err) => {
        if (err) {
            console.error("Error deleting products:", err);
            res.status(500).json({ error: "Internal Server Error" });
            return;
        }
        res.json({ message: "products deleted successfully" });
    });
});

app.get("/employees/resetData", (req, res) => {
    // You can implement data reset logic here, such as truncating the table.
    connection.query("TRUNCATE TABLE employess", (err) => {
        if (err) {
            console.error("Error resetting data:", err);
            res.status(500).json({ error: "Internal Server Error" });
            return;
        }
        res.json({ message: "Data reset successfully" });
    });
});

// INSERT INTO products (name, price, brand, ram, rom, os)
// VALUES
//     ('iPhone XR', 49000, 'Apple', '4GB', '128GB', 'iOS'),
//     ('iPhone 7', 28500, 'Apple', '3GB', '32GB', 'iOS'),
//     ('iPhone 8', 33000, 'Apple', '3GB', '64GB', 'iOS'),
//     ('iPhone 11', 52000, 'Apple', '6GB', '128GB', 'iOS'),
//     ('iPhone 12', 71000, 'Apple', '8GB', '128GB', 'iOS'),
//     ('J1', 7500, 'Samsung', '3GB', '32GB', 'Android'),
//     ('J2', 9500, 'Samsung', '4GB', '32GB', 'Android'),
//     ('J5', 12700, 'Samsung', '6GB', '64GB', 'Android'),
//     ('M32', 18300, 'Samsung', '6GB', '64GB', 'Android'),
//     ('A25', 24600, 'Samsung', '8GB', '128GB', 'Android'),
//     ('Note 6', 9999, 'Xiaomi', '3GB', '32GB', 'Android'),
//     ('Note 7', 12000, 'Xiaomi', '6GB', '64GB', 'Android'),
//     ('Note 8', 14100, 'Xiaomi', '8GB', '128GB', 'Android'),
//     ('Note 9', 17900, 'Xiaomi', '8GB', '128GB', 'Android'),
//     ('X4', 11300, 'Realme', '3GB', '32GB', 'Android'),
//     ('X5', 12900, 'Realme', '4GB', '64GB', 'Android'),
//     ('X6', 15800, 'Realme', '6GB', '128GB', 'Android'),
//     ('X7', 19300, 'Realme', '8GB', '128GB', 'Android');