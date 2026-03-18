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

For roblox to interact with your server, you need to expose your localhost. I useded Ngrok.

Exposing with Ngrok:

```
ngrok.exe http 3000
```

---

# 📄 Documentation

**documentation for each transmitter project in a readme in the folders**

## current projects:

1. `/base` - simple server with sample functions to be used as base for projects
2. `/image` - image and video transmittion system

---

## ✅ Hope it helps with all your http projects
