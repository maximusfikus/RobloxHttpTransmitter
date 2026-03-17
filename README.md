# Roblox http transmitter api

**A Node.js-based system for interfacing with the http transmitter in Roblox Build Logic**

---

## Current usage

### image/video interface with panels `/image`

* Upload **images or videos**
* Converts into **byte stream (RrGgBbxx format)**
* Roblox reads data **one byte at a time**
* `/preview` → browser playback
* `/send` → interface for http transmitters
  * `cookie: cordX` to set X
  * `cookie: cordY` to set Y
  * `cookie: frame` to set frame
  * `cookie: debug` to toggle debug messages in console
* `/read` → read pixel data
  * `increment: true` to auto increment x and y without having to send position data
* Supports:

  * Image upload
  * Video upload

---

# 📦 Installation

## 1. Install Node.js

Download and install:
👉 https://nodejs.org/

---

## 2. Initiate and install dependencies

Open terminal in project folder:

```bash
npm init -y
npm install express multer cors
```

---

## 3. Project structure

```
project/
├── image/
|   ├── server.js
|   └── index.html
├── node_modules/
|   └── ...
├── package.json
└── package-lock.json
```

---

# ▶️ First Run

Start the server:

```bash
node server.js
```

You should see:

```
server running on port 3000
```

Open in browser:

```
http://localhost:3000
```

---

# 🖥️ Frontend Usage

## Upload Image

1. Select **Image mode**
2. Upload file
3. Set resolution (e.g. 64x64)
4. Enter password
5. Click **Process & Send**

---

## Upload Video

1. Switch to **Video mode**
2. Upload video
3. Set:

   * Resolution (e.g. 64x64)
   * FPS (e.g. 5)
4. Click **Process & Send**

---

## Paste Image (Ctrl+V)

Just press **Ctrl+V** in the page — it works the same as upload.

---

# 🌐 Endpoints

## `/webint` (POST)

Uploads processed data.

### Body (FormData):

```
packed    → base64 encoded byte stream
password  → server password
source    → original file
```

---

## `/preview`

Displays reconstructed frames in browser.

* Auto-scaled
* Plays frames sequentially
* Simulates Roblox screen

---

## `/source`

Returns the **last uploaded file**

* Image → shown in browser
* Video → playable in browser

---

## `/info`

Returns total byte count:

```json
{ "size": 12345 }
```

---

## `/byte?i=N`

Returns a single byte:

```json
{ "value": "10101010" }
```

Used by Roblox to reconstruct data.

---

# 🎮 Roblox Integration

## Step 1: Get total size

```
GET /info
```

---

## Step 2: Read bytes sequentially

```
GET /byte?i=0
GET /byte?i=1
GET /byte?i=2
...
```

Each response:

```json
{ "value": "10101010" }
```

---

## Step 3: Reconstruct

On Roblox side:

* Read header:

  * byte 0 → width
  * byte 1 → height
  * byte 2-3 → frame count
* Remaining bytes → pixel data

---

# 📊 Data Format

```
Byte Layout:

0 → width
1 → height
2 → frameCount (high byte)
3 → frameCount (low byte)
4 → compact flag
5 → reserved

6+ → pixel data
```

---

## Pixel Format

```
RrGgBbxx (8 bits)

RR → red   (0–3)
GG → green (0–3)
BB → blue  (0–3)
xx → unused
```

---

# ⚠️ Limits

* Roblox: **1 byte per request**
* Large videos = many requests
* Base64 adds **~33% overhead**
* 64×64 video = large payload

---

# 💡 Performance Tips

* Use **lower resolution** (e.g. 32×32 or 16×16)
* Lower FPS (5–10 recommended)
* Cache bytes on Roblox side
* Avoid unnecessary re-requests

---

# 🔧 Troubleshooting

## ❌ RangeError: Maximum call stack exceeded

Fix by using chunked base64 conversion (already implemented).

---

## ❌ Upload fails

* Check password
* Check payload size
* Try smaller resolution

---

## ❌ Preview not working

* Ensure data uploaded first
* Check `/preview` after `/webint`

---

# 🧠 Advanced Ideas (optional)

* Delta frame encoding (only send changed pixels)
* Run-length encoding (compress repeating values)
* Bit-packing (2-bit grayscale)

---

# ✅ Summary

This system converts media into a **byte stream compatible with Roblox’s strict HTTP limits**, allowing you to:

* Display images
* Play videos
* Fully control rendering via logic gates

---

Enjoy building your byte-powered screen 🚀
