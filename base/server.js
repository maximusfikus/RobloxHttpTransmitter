const express = require("express");
const cors = require("cors");
const path = require("path");
const { debug } = require("console");

const app = express();
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

const PORT = 3000;

/*
Storage object

Each cookie gets its own storage entry:
{
   cookie1 : { value: "00000000" },
   cookie2 : { value: "10101010" }
}
*/

let storage = {};
let adress = "00000000"; // Default address (can be changed via cookie command)


//const pswrd_web = "1234"; no method for web interface yet// Change this to your desired password for the web interface
const pswrd_api = "abcd"; // Change this to your desired password for the API (if needed)

let debugMode = false; // Set to true to enable debug mode (prints more info to console)

/*
================================================
MAIN PROCESSING FUNCTION (EDIT THIS LATER)
================================================

Input:
    value  = 8-bit binary string from transmitter
    cookie = device identifier

Output:
    return 8-bit binary string to be sent back to transmitter (can be the same as input or processed)
*/

function processValue(value, cookie) {
    if (cookie === "debug") {
        debugMode = !debugMode; // Toggle debug mode
        console.log("Debug mode is now ", debugMode ? "ON" : "OFF");
        return value; // Return the original value without processing
    }

    if (cookie === "reset") {
        storage = {}; // Clear all stored data
        debugMode ? console.log("Storage has been reset") : null;
        return value; // Return the original value without processing
    }

    if (cookie === "adress") {
        adress = value; // Update the address variable
        debugMode ? console.log("Address updated to:", adress) : null;
        return value; // Return the original value without processing
    }

    if (cookie === "set") {
        if (!storage[adress]) {
            storage[adress] = { value: "00000000" };
        }
        storage[adress].value = value;
        debugMode ? console.log(`Value at address ${adress} set to:`, value) : null;
        return value; // Return the original value without processing
    }

    if (cookie === "random") {
        const randomValue = Math.floor(Math.random() * 256).toString(2).padStart(8, "0");
        debugMode ? console.log("Generated random value for cookie 'random':", randomValue) : null;
        return randomValue; // Return a random 8-bit binary string
    }

    if (cookie === "process") {
        // Example processing: Invert the bits of the value
        const processedValue = value.split("").map(bit => bit === "0" ? "1" : "0").join("");
        debugMode ? console.log("Processed value for cookie 'process':", processedValue) : null;
        return processedValue; // Return the processed value
    }

    // Example processing (placeholder)

    return value;
}



/*
====================================
RECEIVE DATA FROM HTTP TRANSMITTER
====================================
Reads headers:
value
cookie
password
*/
app.post("/send", (req, res) => {
    const value = req.headers["value"] || req.query.value || req.body.value;
    const cookie = req.headers["cookie"] || req.query.cookie || req.body.cookie;
    const password = req.headers["password"] || req.query.password || req.body.password;

    debugMode ? console.log("Received /send request with value:", value, "cookie:", cookie, "password:", password) : null;

    if (password !== pswrd_api) {
        debugMode ? console.log(`Password ${password} is invalid`) : null;
        return res.json({ error: "Invalid password" });
    }

    if (!value || !cookie) {
        debugMode ? console.log("Missing value or cookie header") : null;
        return res.json({ error: "Missing value or cookie header" });
    }

    if (!/^[01]{8}$/.test(value)) {
        debugMode ? console.log("Invalid value format:", value) : null;
        return res.json({ error: "value must be 8 bit binary" });
    }

    const processed = processValue(value, cookie);

    debugMode ? console.log(`Processed value for cookie ${cookie}:`, processed) : null;

    res.json({
        input: value,
        output: processed,
        cookie: cookie,
        value: processed
    });
});



/*
====================================
READ DATA (FOR OUTPUT TRANSMITTER)
====================================
Uses adress header to select value
*/
app.get("/read", (req, res) => {
    const password = req.headers["password"] || req.query.password || req.body.password;
    const addr = req.headers["adress"] || req.query.adress || req.body.adress || adress; // Use provided address or default

    if (password !== pswrd_api) {
        debugMode ? console.log(`Password ${password} is invalid`) : null;
        return res.json({ error: "Invalid password" });
    }

    return res.json({
        value: storage[addr].value || "00000000"
    });
});



/*
DEBUG VIEW
*/
app.get("/debug", (req, res) => {
    res.json(storage);
});



app.listen(PORT, () => {
    console.log("Server running on port", PORT);
});