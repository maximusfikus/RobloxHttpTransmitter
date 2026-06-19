const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

const PORT = 3000;

/*
==============================
GLOBAL STATE
==============================
*/

let width = 64;
let height = 64;

let frames = [
    Array.from({ length: 64 }, () => Array.from({ length: 64 }, () => "00000000"))
];

let currentFrame = 0;

let x = 0;
let y = 0;

let debugMode = false;
let incrementMode = false;

let password = "femboy69";

const storage = {};

/*
==============================
PROCESS COMMANDS
==============================
*/

function processValue(value, cookie) {
    const num = parseInt(value, 2);

    if (cookie === "cordX") {
        x = num;
        (debugMode ? console.log("X →", x) : null);
        return "00000000";
    }

    if (cookie === "cordY") {
        y = num;
        (debugMode ? console.log("Y →", y) : null);
        return "00000000";
    }

    if (cookie === "frame") {
        currentFrame = num;
        (debugMode ? console.log("Frame →", currentFrame) : null);
        return "00000000";
    }

    if (cookie === "debug") {
        debugMode = !debugMode;
        console.log("Debug mode", debugMode ? "enabled" : "disabled");
        return "00000000";
    }

    return "00000000";
}

/*
==============================
SEND COMMAND FROM ROBLOX
==============================
*/

app.post("/send", (req, res) => {
    const value = req.headers["value"] || req.body.value || req.query.value;
    const cookie = req.headers["cookie"] || req.query.cookie;

    (debugMode ? console.log("SEND:", value, cookie) : null);

    if (!value || !cookie)
        return res.json({ error: "Missing value or cookie" });

    if (!/^[01]{8}$/.test(value))
        return res.json({ error: "Value must be 8 bit binary" });

    if (!storage[cookie])
        storage[cookie] = { value: "00000000" };

    const processed = processValue(value, cookie);

    storage[cookie].value = processed;

    res.json({
        received: value,
        stored: processed,
        cookie
    });
});

/*
==============================
READ PIXEL
==============================
*/

app.get("/read", (req, res) => {
    increment = req.headers["increment"] || req.query.increment;

    if (
        currentFrame >= frames.length ||
        x >= width ||
        y >= height
    ) {
        return res.json({ value: "00000000" });
    }

    const pixel = frames[currentFrame][y][x];

    if (increment === "true") {
        x++;
        if (x >= width) {
            x = 0;
            y++;
            if (y >= height) {
                y = 0;
                currentFrame++;
            }
        }

        (debugMode ? console.log("Incremented to", currentFrame, x, y) : null);
    }

    res.json({ value: pixel });
});

/*
==============================
UPLOAD IMAGE / VIDEO
==============================
*/

app.post("/webint", (req, res) => {
    const data = req.body;

    if (!(password === data.password)) {
        return res.json({ error: "Invalid password" });
    }

    if (!data.width || !data.height || !data.frames)
        return res.json({ error: "Missing width height or frames" });

    width = data.width;
    height = data.height;

    const newFrames = [];

    for (let f = 0; f < data.frames.length; f++) {
        const frame = data.frames[f];

        if (frame.length !== height)
            return res.json({ error: "Invalid frame height" });

        const newFrame = [];

        for (let yy = 0; yy < height; yy++) {
            if (frame[yy].length !== width)
                return res.json({ error: "Invalid row width" });

            const row = [];

            for (let xx = 0; xx < width; xx++) {
                const pixel = frame[yy][xx];

                let value;

                // normal binary string mode
                if (data.compact !== true) {
                    if (!/^[01]{8}$/.test(pixel))
                        return res.json({ error: "Invalid pixel " + xx + "," + yy });

                    value = pixel;
                }

                // compact numeric mode
                else {
                    if (typeof pixel !== "number" || pixel < 0 || pixel > 255)
                        return res.json({ error: "Invalid pixel " + xx + "," + yy });

                    // convert number -> 8 bit binary string
                    value = pixel.toString(2).padStart(8, "0");
                }

                row.push(value);
            }

            newFrame.push(row);
        }

        newFrames.push(newFrame);
    }

    frames = newFrames;

    console.log("Loaded", frames.length, "frames",
        width, "x", height);

    res.json({
        status: "frames loaded",
        frames: frames.length,
        width,
        height
    });
});

/*
==============================
DEBUG
==============================
*/

app.get("/debug", (req, res) => {
    res.json({
        width,
        height,
        frames: frames.length,
        currentFrame,
        x,
        y
    });
});

app.listen(PORT, () => {
    console.log("Server running on port", PORT);
    (debugMode ? console.log("current settings are:" + " width: " + width, " height: " + height, " frames: " + frames.length + " debugMode: " + debugMode + " incrementMode: " + incrementMode) : null);
});