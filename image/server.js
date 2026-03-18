const express = require("express");
const path = require("path");
const multer = require("multer");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

/* Example endpoint (keep your real ones here) */
router.post("/upload", upload.single("file"), (req,res)=>{
    res.json({status:"ok"});
});

module.exports = router;

const PORT = 3000;

/*
==============================
GLOBAL STATE
==============================
*/

let width = 64;
let height = 64;

let frames = [
    Array.from({ length: 64 }, () => Array.from({ length: 64 }, () => 0))
];

let currentFrame = 0;
let x = 0;
let y = 0;

let debugMode = false;
let incrementMode = false;

let password = "femboy69";

const storage = {};
let originalFiles = {}; // <-- save original uploads here
let packedData = null; // <-- save original packed data for /source
let lastSource = null;
let lastSourceType = null;

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
        return 0;
    }

    if (cookie === "cordY") {
        y = num;
        (debugMode ? console.log("Y →", y) : null);
        return 0;
    }

    if (cookie === "frame") {
        currentFrame = num;
        (debugMode ? console.log("Frame →", currentFrame) : null);
        return 0;
    }

    if (cookie === "debug") {
        debugMode = !debugMode;
        console.log("Debug mode", debugMode ? "enabled" : "disabled");
        return 0;
    }

    return 0;
}

/*
==============================
SEND COMMAND FROM ROBLOX
==============================
*/

router.post("/send", (req, res) => {
    const value = req.headers["value"] || req.body.value || req.query.value;
    const cookie = req.headers["cookie"] || req.query.cookie;

    (debugMode ? console.log("SEND:", value, cookie) : null);

    if (!value || !cookie)
        return res.json({ error: "Missing value or cookie" });

    if (!/^[01]{8}$/.test(value))
        return res.json({ error: "Value must be 8 bit binary" });

    if (!storage[cookie])
        storage[cookie] = { value: 0 };

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

router.get("/read", (req, res) => {
    const increment = req.headers["increment"] || req.query.increment;

    if (
        currentFrame >= frames.length ||
        x >= width ||
        y >= height
    ) {
        return res.json({ value: 0 });
    }

    let pixel = frames[currentFrame][y][x];

    if (increment === "true") {
        x++;
        if (x >= width) {
            x = 0;
            y++;
            if (y >= height) {
                y = 0;
                currentFrame++;

                pixel = pixel.slice(0, -1) + '1'; // set LSB of pixel to 1 to indicate frame increment
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

router.post("/webint", (req, res) => {
    const data = req.body;

    if (password !== data.password) {
        return res.json({ error: "Invalid password" });
    }

    if (req.source) {
        lastSource = req.source.buffer
        lastSourceType = req.source.mimetype
    } else {
        lastSource = null;
    }

    width = data.width;
    height = data.height;

    let newFrames = [];

    if (data.packed) {

        packedData = data.packed;

        // --- decode packed Base64 string ---
        const raw = Uint8Array.from(atob(data.packed), c => c.charCodeAt(0));
        const w = raw[0], h = raw[1];
        width = w;
        height = h;
        const frameCount = (raw[2] << 8) | raw[3];
        const compact = raw[4] === 1;
        let ptr = 6;

        for (let f = 0; f < frameCount; f++) {
            const frame = [];
            for (let y = 0; y < h; y++) {
                const row = [];
                for (let x = 0; x < w; x++) {
                    let val = rawToPixel(raw[ptr++]);
                    row.push(val);
                }
                frame.push(row);
            }
            newFrames.push(frame);
        }

        // save original payload for /source
        originalFiles[data.filename || `upload_${Date.now()}`] = data.packed;

    } else {

        if (!data.width || !data.height || (!data.frames && !data.packed))
        return res.json({ error: "Missing width, height, or frames" });
        // non-packed frames array mode
        newFrames = data.frames;
        // save original as JSON
        originalFiles[data.filename || `upload_${Date.now()}`] = JSON.stringify(data.frames);
    }

    frames = newFrames;

    console.log("Loaded", frames.length, "frames", width, "x", height);

    res.json({
        status: "frames loaded",
        frames: frames.length,
        width,
        height
    });
});

function rawToPixel(rawByte) {

    let byte = null;
    /*byte = (((rawByte >> 7) & 0b11) << 7).toString(2);
    byte += (((rawByte >> 6) & 0b11) << 6).toString(2);
    byte += (((rawByte >> 5) & 0b11) << 5).toString(2);
    byte += (((rawByte >> 4) & 0b11) << 4).toString(2);
    byte += (((rawByte >> 3) & 0b11) << 3).toString(2);
    byte += (((rawByte >> 2) & 0b11) << 2).toString(2);
    byte += (((rawByte >> 1) & 0b11) << 1).toString(2);
    byte += (((rawByte >> 0) & 0b11) << 0).toString(2);*/

    rawByte = (rawByte ? rawByte : 0);

    byte = rawByte.toString(2).padStart(8, "0");

    return byte;
}

/*
==============================
SOURCE FILE
==============================
*/

router.get("/source", (req, res) => {

    if (!lastSource)
        return res.send("This doent work, at least try /preview");

    res.setHeader("Content-Type", lastSourceType)
    res.send(lastSource)

})

/*
==============================
PREVIEW
==============================
*/

router.get("/preview", (req, res) => {

    if (!packedData)
        return res.send("no data uploaded")

    res.send(`
<html>

<body style="background:black;margin:0;display:flex;justify-content:center;align-items:center;height:100vh">

<canvas id="c"></canvas>

<script>

const data = Uint8Array.from(atob("${packedData}"), c => c.charCodeAt(0))

const width = data[0]
const height = data[1]
const frames = (data[2]<<8) | data[3]

const canvas = document.getElementById("c")
const ctx = canvas.getContext("2d")

canvas.width = width*10
canvas.height = height*10

let ptr = 6
let frame = 0

function draw(){

const img = ctx.createImageData(width,height)

for(let i=0;i<width*height;i++){

const val = data[ptr++]

const r=((val>>6)&3)<<6
const g=((val>>4)&3)<<6
const b=((val>>2)&3)<<6

const p=i*4

img.data[p]=r
img.data[p+1]=g
img.data[p+2]=b
img.data[p+3]=255

}

const temp=document.createElement("canvas")
temp.width=width
temp.height=height
temp.getContext("2d").putImageData(img,0,0)

ctx.imageSmoothingEnabled=false
ctx.drawImage(temp,0,0,canvas.width,canvas.height)

frame++

if(frame<frames)
    setTimeout(draw,100)

}

draw()

</script>

</body>
</html>
`)
})

/*
==============================
DEBUG
==============================
*/

router.get("/debug", (req, res) => {
    res.json({
        width,
        height,
        frames: frames.length,
        currentFrame,
        x,
        y
    });
});