import { makeWASocket, DisconnectReason, useMultiFileAuthState } from "@whiskeysockets/baileys";

let conn = null;

async function establishConnection() {
    try {
        const { state, saveCreds } = await useMultiFileAuthState("tokens/istianto-ilham");

        conn = makeWASocket({
            auth: state,
            printQRInTerminal: true
        });

        conn.ev.on('creds.update', saveCreds);

        conn.ev.on("connection.update", (update) => {
            const { connection, lastDisconnect } = update;
            if (connection === "close") {
                const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
                console.log("connection closed due to ", lastDisconnect.error, ", reconnecting ", shouldReconnect);
                if (shouldReconnect) {
                    establishConnection();
                }
            } else if (connection === "open") {
                console.log("opened connection");
            }
        });
        console.log('Connection established successfully!');
    } catch (error) {
        console.error('An error occurred while establishing connection:', error);
    }
}

export { conn, establishConnection };