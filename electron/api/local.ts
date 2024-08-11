import {ipcMain} from "electron";
import log from "electron-log";

const {exec, spawn} = require("child_process");

type LocalPort = {
    protocol: string;
    ip: string;
    port: number;
}

export const initLocalApi = () => {
    const command = process.platform === 'win32'
        ? 'netstat -a -n'
        : 'netstat -tuln';

    ipcMain.on("local.getLocalPorts", async (event, args) => {
        log.info("开始获取本地端口")
        // 执行命令
        exec(command, (error, stdout, stderr) => {
            if (error) {
                log.error(`getLocalPorts - error ${error.message}`)
                return;
            }
            if (stderr) {
                log.error(`getLocalPorts - stderr ${stderr}`)
                return;
            }

            log.debug(`sc ${stdout}`)
            let ports = [];
            if (stdout) {
                ports = stdout.split('\r\n')
                    .filter(f => f.indexOf('TCP') > 0 || f.indexOf('UDP') > 0)
                    .map(m => {
                        const cols = m.split(' ')
                            .filter(f => f != '')
                        const local = cols[1]
                        const s = local.lastIndexOf(":")
                        let localIP = local.slice(0, s);
                        let localPort = local.slice(s - local.length + 1);
                        console.log(1)
                        // if (local.indexOf('[') == -1) {
                        //     // ipv4
                        //     const tmp = cols[1].split(":")
                        //     localIP = tmp[0]
                        //     localPort = tmp[1]
                        // } else {
                        //     // ipv6
                        //     console.log(1)
                        // }

                        const singe: LocalPort = {
                            protocol: cols[0],
                            ip: localIP,
                            port: localPort
                        }

                        return singe;
                    })
            }

           ports.sort((a, b) => a.port - b.port);

            event.reply("local.getLocalPorts.hook", {
                data: ports
            });
        });
    });
}