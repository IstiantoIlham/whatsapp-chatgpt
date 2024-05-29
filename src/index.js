import OpenAI from "openai";
import { PrismaClient } from "@prisma/client";
import { conn, establishConnection } from "./lib/connection.js";

const openai = new OpenAI({ apiKey: process.env.OPENAI_APIKEY });
const prisma = new PrismaClient();

const functionStatus = {};

async function main() {
    try {
        await establishConnection();
        conn.ev.on('messages.upsert', async (m) => {
            const message = m.messages[0];
            if (!message.key.fromMe && message.key.remoteJid && !message.key.remoteJid.endsWith('@g.us')) {
                const phoneNumber = message.key.remoteJid.replace('@s.whatsapp.net', '');
                const userMessage = message.message?.extendedTextMessage?.text || message.message?.conversation || '';
                console.log(userMessage);

                if (!functionStatus[phoneNumber]) {
                    functionStatus[phoneNumber] = {
                        isRunning: false
                    };
                }

                if (userMessage.toLowerCase() === "nihao") {
                    functionStatus[phoneNumber].isRunning = true;
                    await conn.sendMessage(phoneNumber + "@s.whatsapp.net", { text: "Silakan bertanya apa saja. \n\nKetik \"bye\" untuk menghentikan sesi ini." });
                    return;
                }

                if (userMessage.toLowerCase() === "bye") {
                    functionStatus[phoneNumber].isRunning = false;
                    await conn.sendMessage(phoneNumber + "@s.whatsapp.net", { text: "Sampai jumpa! Semoga harimu menyenangkan😊" });
                    return;
                }

                if (!functionStatus[phoneNumber].isRunning) {
                    console.log('Fungsi tidak berjalan untuk nomor telepon:', phoneNumber);
                    return;
                }

                let messageGroup = await prisma.messageGroup.findUnique({
                    where: {
                        number: phoneNumber
                    },
                    include: {
                        message: true
                    }
                });

                if (!messageGroup) {
                    messageGroup = await prisma.messageGroup.create({
                        data: {
                            number: phoneNumber,
                        },
                    });
                    console.log('Created new MessageGroup');
                } else {
                    console.log('Found MessageGroup');
                }

                if (userMessage === "delete") {
                    await prisma.message.deleteMany({
                        where: { messageGroupId: messageGroup.id },
                    });

                    console.log("Delete Message " + messageGroup.number);
                    return;
                }

                if (messageGroup) {
                    await prisma.message.create({
                        data: {
                            role: "user",
                            content: userMessage,
                            messageGroupId: messageGroup.id
                        }
                    });

                    messageGroup = await prisma.messageGroup.findUnique({
                        where: {
                            id: messageGroup.id
                        },
                        include: {
                            message: true
                        }
                    });

                    const messages = messageGroup.message.map(msg => ({
                        role: msg.role,
                        content: msg.content
                    }));

                    if (messages.length === 0) {
                        messages.push({
                            role: "system",
                            content: "Initial system message to start the conversation."
                        });
                    }

                    const completion = await openai.chat.completions.create({
                        messages: messages,
                        model: "gpt-3.5-turbo",
                    });

                    const result = completion.choices[0];

                    await prisma.message.create({
                        data: {
                            role: result.message.role,
                            content: result.message.content,
                            messageGroupId: messageGroup.id
                        }
                    });

                    await conn.sendMessage(messageGroup.number + "@s.whatsapp.net", { text: result.message.content });

                } else {
                    console.log('Failed to create MessageGroup');
                }
            }
        });
    } catch (error) {
        console.error('Error occurred:', error);
    }
}

main()
    .catch((e) => {
        console.error(e);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

