const express = require("express");
const path = require("path");
const crypto = require("crypto");

const router = express.Router();

router.use(express.static(__dirname));
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

let storage = {};
let adresses = {};

function getByte(sessionId, line, byte) {
    if (!storage[sessionId]?.[line]) {
        return "00000000";
    }

    return storage[sessionId][line][byte].toString(2).padStart(8, "0");
}

router.post("/upload", (req, res) => {
    const data = req.body.code;
    const sessionId = req.headers["seshid"];

    if (!data) return res.json({ error: "No data provided" });
    if (!sessionId) return res.json({ error: "No session ID provided" });

    storage[sessionId] = data;

    return res.json({ message: "Data received successfully" });

});

router.post("/getByte", (req, res) => {
    const sessionId = req.headers["seshid"];
    const use_local_adress = req.headers["useLocalAddress"] === "true";
    const increment = req.headers["increment"] === "true";
    const line = use_local_adress ? adresses[sessionId] : parseInt(req.headers["value"] ?? 0x0f, 2);
    const byte = req.headers["byte"];

    res.json({ value: getByte(sessionId, line, byte) });

    increment ? adresses[sessionId] = (adresses[sessionId] + 1) % storage[sessionId].length : null;
});

router.post("/setAddress", (req, res) => {
    const sessionId = req.headers["seshid"];
    const byte = Number(req.headers["byte"] ?? 0);
    const value = parseInt( req.headers["value"] ?? req.query.value ?? req.body?.value , 2);

    if (!sessionId || !storage[sessionId]) {
        return res.status(400).json({ error: "Invalid or missing session" });
    }

    adresses[sessionId] = value;

    return res.json({ value: storage[sessionId][value][0].toString(2).padStart(8, "0") ?? 0 });
});

router.get("/getAddress", (req, res) => {
    const sessionId = req.headers["seshid"];

    if (!sessionId || !storage[sessionId]) {
        return res.status(400).json({ error: "Invalid or missing session" });
    }

    return res.json({ value: adresses[sessionId].toString(2).padStart(8, "0") ?? 0 });
});

module.exports = router;