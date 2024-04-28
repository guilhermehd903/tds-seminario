const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const path = require('path');

let todo = [
    {
        id: 1,
        title: "Padrão A fazer 1",
        content: "Corpo do texto aqui",
        state: false
    },
    {
        id: 2,
        title: "Padrão A fazer 2",
        content: "Corpo do texto aqui 2",
        state: true
    }
];

let mainScreen = null;
let addScreen = null;

function createWindow() {
    mainScreen = new BrowserWindow({
        width: 960,
        height: 680,
        backgroundColor: "#333",
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
        }
    });

    // mainScreen.webContents.openDevTools();
    mainScreen.loadFile("./src/mainScreen/index.html");

    ipcMain.on("send-text", (e, value) => {
        console.log(value);
    })

    ipcMain.on("open-add", (e, value) => {
        if (!addScreen) {
            createAddScreen();
        }
    })

    ipcMain.on("change-status", (e, value) => {
        todo.forEach((item, i) => {
            if (value.id == item.id) {
                todo[i].state = !value.status;
            }
        })
        mainScreen.webContents.send("fetch-todo-list", todo);
    })

    mainScreen.webContents.once("did-finish-load", () => {
        mainScreen.webContents.send("fetch-todo-list", todo);
    });

    const menuTemplate = [
        {
            "label": "Controle",
            submenu: [
                {
                    "label": "Add",
                    click: () => { createAddScreen() }
                }
            ]
        }
    ];

    const menu = Menu.buildFromTemplate(menuTemplate);
    Menu.setApplicationMenu(menu);
}

function createAddScreen() {
    addScreen = new BrowserWindow({
        width: 500,
        height: 550,
        backgroundColor: "#333",
        webPreferences: {
            preload: path.join(__dirname, "preload.js")
        }
    })

    addScreen.loadFile("./src/addScreen/index.html");

    const ipcAddTask = (e, value) => {
        createTodo(value.name, value.content);

        mainScreen.webContents.send("refresh", todo);
        mainScreen.webContents.send("fetch-todo-list", todo);
    }

    ipcMain.on("add-task", ipcAddTask);

    addScreen.on("closed", () => {
        ipcMain.removeListener("add-task", ipcAddTask);
        addScreen = null;
    });
}

function createTodo(title, content) {
    todo.push({ title, content, state: false, id: (todo.length) + 1 });
}

app.whenReady().then(() => {
    createWindow();
    console.log("Ready");
});