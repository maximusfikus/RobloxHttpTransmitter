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
*password on web interface is `femboy69` :3
* for video upload i recommend checking the compress checkbox because it might be to large to send the regular way

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

ignore the frame input it is a failed function.

## to view what it will look like on the screen, in the browser, go to `/preview`

---

# 🎮 Roblox Integration

use `/image/send` to send data to server with the post function on the transmitter.
in headers use cookies:
* `cookie: cordX` to set x variable (req. value)
* `cookie: cordY` to set y variable (req. value)
* `cookie: frame` to set frame variable (req. value)
* `cookie: debug` to toggle debug console output (default off, no value needed)

use `/image/read` to get the pixel data at the selected position from the server as a get function.
* `increment: true` to make the x and y increment after each get request not needing to set the x, y and frame evfery time

## Selective pixel

1. counter keeping track of the position
2. send x and y (and frame if video) to the server from the counter
3. get pixel and display it
4. increment counter and repeat

## Automatic increment
1. at the start, reset x, y, frame to 0
2. in transmitter, have `increment: true` and send a get request
3. when recieved get, display and increment a counter that has the position paralel to the server
4. repeat from 2

## Automatic increment for videos

do the same as normal autoincrement, but once a new frame comes into place significated by the lsb reset position counters to 0 to prevent shifts stacking.

---

# ⚠️ Limits

* Roblox: **1 byte per request**
* max resolution is 255x255 (not full 256)
* lowest sample rate for video is 1fps
* when too many requests are being sent from roblox, it might reach the cap and stop transmitting

---

# 💡 Performance Tips

* Use **lower resolution** (e.g. 32×32 or 16×16)
* Lower FPS (1–5 recommended)
* Avoid unnecessary re-requests
* i got the fastest but still usable output with a not clock and a 0.07s delay
* after each frame, the lsb goes high for one frame, usefull to reset position on counter back to [0,0] in case a shift happened

---

# 🔧 Troubleshooting

## ❌ RangeError: Maximum call stack exceeded

Fix by using chunked base64 conversion (already implemented).

---

## ❌ Upload fails

* Check password
* Check payload size
* Try smaller resolution and framerate

---

## ❌ Preview not working

* Ensure data uploaded first
* Check `/preview` after `/webint`

---

# ✅ Summary

This system converts media into a **byte stream compatible with Roblox’s strict HTTP limits**, allowing you to:

* Display images
* Play videos
* Fully control rendering via logic gates

---

Enjoy building your byte-powered screen 🚀
