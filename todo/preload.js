const { contextBridge, ipcRenderer } = require('electron/renderer');


contextBridge.exposeInMainWorld("myAPI", {
    changeStatus: (status) => {
        ipcRenderer.send("change-status", status);
    },
    openAdd: () => {
        ipcRenderer.send("open-add");
    },
    addTask: (name, content) => {
        console.log("ADD from preload");
        ipcRenderer.send("add-task", { name, content });
    },
    fetchList: async () => {
        return new Promise((resolve, reject) => {
            ipcRenderer.on("fetch-todo-list", (event, data) => {
                resolve(data);
            });
        });
    },
    refresh: (callback) => {
        ipcRenderer.on("refresh", () => { 
            callback() 
        });
    }
});