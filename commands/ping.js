module.exports = {
    name: "ping",
    description: "Cek respons bot",
    execute: async (msg, args, client) => {
        msg.reply("Pong!");
    }
};