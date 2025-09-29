---
layout: post
title: "Communicating Between Processes in Electron Using contextBridge" 
date: 2025-09-28
categories: electron tutorial
---

# Communicating Between Processes in Electron Using contextBridge

Electron is a powerful framework that allows you to build cross-platform desktop applications using web technologies like HTML, CSS, and JavaScript. One key aspect of building Electron apps is enabling communication between the main process and the renderer processes. In this blog post, we'll explore how to use the `contextBridge` module to safely expose APIs from the main process to the renderer processes.

## The Need for contextBridge

In Electron, the main process is responsible for creating and managing windows, handling system events, and performing privileged operations. On the other hand, renderer processes are responsible for running the web pages and executing JavaScript code within those pages. By default, renderer processes do not have direct access to Node.js APIs or the ability to interact with the operating system.

To enable communication between the main process and renderer processes, Electron provides the `ipcMain` and `ipcRenderer` modules. However, directly exposing `ipcRenderer` to the renderer processes can be a security risk, as it allows untrusted code executed in the renderer to have access to powerful APIs.

This is where `contextBridge` comes into play. It provides a way to safely expose specific APIs from the main process to the renderer processes, without granting full access to `ipcRenderer` or other sensitive APIs.

## Using contextBridge

To use `contextBridge`, you need to follow these steps:

1. In the main process, create a `preload.js` script that defines the APIs you want to expose to the renderer processes.
2. Use `contextBridge.exposeInMainWorld()` to expose the APIs to the renderer processes.
3. In the renderer processes, access the exposed APIs via the global `window` object.

Here's an example of how to set up `contextBridge` in your Electron app:

**main.js**
```javascript
const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  });

  win.loadFile('index.html');
}

app.whenReady().then(() => {
  createWindow();
});
```

**preload.js**
```javascript
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  send: (channel, data) => {
    ipcRenderer.send(channel, data);
  },
  receive: (channel, func) => {
    ipcRenderer.on(channel, (event, ...args) => func(...args));
  }
});
```

In this example, we define an `api` object that exposes two methods: `send` and `receive`. These methods wrap the `ipcRenderer.send()` and `ipcRenderer.on()` functions, respectively. By exposing these methods through `contextBridge`, we can safely use them in the renderer processes.

**renderer.js**
```javascript
window.api.receive('response', (data) => {
  console.log(data);
});

window.api.send('request', { message: 'Hello from renderer!' });
```

In the renderer process, we can access the exposed APIs using `window.api`. We can use `window.api.send()` to send messages to the main process and `window.api.receive()` to receive responses.

## Conclusion

By using `contextBridge`, you can establish a secure communication channel between the main process and renderer processes in your Electron app. It allows you to expose specific APIs to the renderer processes without compromising security. With `contextBridge`, you have fine-grained control over what functionality is accessible to the renderer processes, ensuring that untrusted code cannot perform unauthorized actions.

Remember to carefully design the APIs you expose through `contextBridge` and validate any data received from the renderer processes to maintain the security of your Electron app.

Happy coding with Electron and `contextBridge`!
