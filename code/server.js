const express = require("express");
const path = require("path");
const crypto = require("crypto");

const router = express.Router();

router.use(express.static(__dirname));
router.use(express.json());

let storage = {};

/*storage organisation:
{
    "sessionId": ["An1Kl","naU3t",...]
}
    sessionId: unique session identifier
    array of strings: string => line, char => byte
*/

/* mock upload endpoint for testing 
fetch("/upload", {
    method: "POST",
    headers: {seshID: "sessionId"},
    body: JSON.stringify({packed: ["An1Kl","naU3t",...]})
})
*/

function getByte(sessionId, line, char) {
    if (!storage[sessionId]) {
        return 0;
    }

    const byte = (storage[sessionId][line] ? storage[sessionId][line].charCodeAt(char) : 0).toString(2).padStart(8, "0");

    return byte
}

router.post("/upload", (req, res) => {
    const data = req.body.code;
    const sessionId = req.headers["seshID"];

    if (!data) return res.json({ error: "No data provided" });
    if (!sessionId) return res.json({ error: "No session ID provided" });

    storage[sessionId] = data;

    return res.json({ message: "Data received successfully" });

});

router.get("/getByte", (req, res) => {
    const sessionId = req.headers["seshID"];
    const line = parseInt(req.headers["value"]);
    const byte = req.headers["byte"];

    const data = getByte(sessionId, line, byte);
    console.log(`getByte: sessionId=${sessionId}, line=${line}, byte=${byte} => ${data}`);

    res.json({value: data});
});

module.exports = router;