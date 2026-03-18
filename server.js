const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));

const PORT = 3000;

debugMode = false;

/*
==================================
AUTO LOAD SUB-SERVERS
==================================
*/

const rootDir = __dirname;

const ignoreFolders = ["node_modules", ".old1", "ignore"];
const loadedModules = [];

fs.readdirSync(rootDir).forEach((folder) => {

    const fullPath = path.join(rootDir, folder);

    // skip files and node_modules
    if (!fs.statSync(fullPath).isDirectory()) return;
    if (ignoreFolders.includes(folder)) return;

    const serverFile = path.join(fullPath, "server.js");

    if (fs.existsSync(serverFile)) {
        try {
            const route = require(serverFile);

            app.use(`/${folder}`, route);

            loadedModules.push(folder);

            debugMode ? console.log("Loaded module:", folder) : null;
        } catch (err) {
            debugMode ? console.error("Failed to load:", folder, err) : null;
        }
    }
});

/*
==================================
ROOT INDEX (FILE)
==================================
*/

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

/*
==================================
START SERVER
==================================
*/

app.listen(PORT, () => {
    console.log("Main server running on port", PORT);
    console.log("Available routes:");
    loadedModules.forEach((mod) => {
        console.log(`- /${mod}`);
    });
});