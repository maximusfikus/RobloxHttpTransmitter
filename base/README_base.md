# Base file

---

# 🖥️ Frontend

this fronted is built on the same function your http transmitter would use. `/send`
you can test everything without launching roblox.

The server choses what to do with the provided value depending on thr `cookie:` header.
It processes the value and also outputs an output value from the post output pins.

Current functions:
1. `cookie: adress` - sets adress variable
2. `cookie: set` - sets a value at adress position on storage to value
3. `cookie: reset` - clears storage
4. `cookie: process` - processes the value and outputs processed value. currently it acts as a NOT gate
5. `cookie: random` - outputs a random 8bit value
6. `cookie: debug` - toggles debug messages in console, but cant bbe changed in the web interface

`/read` as a get method to get the value at an adress. the address can be specified either in headers `adress: 10011011` or query `https://your-domain.com/base/read?adress=10011011` or the set adress variable will be used.
