require('dotenv').config();
const url = require('url');

const { Client, IntentsBitField } = require('discord.js');

// Bot's client instance
const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
    ]
});

client.on('ready', (c) => {
    console.log(`Bot initialized as ${c.user.tag}`);
});

client.on('messageCreate', (message) => {
    if (message.author.bot) return; // Ignore messages from bots

    if (message.content === 'ping')
    {
        message.reply('ping');
    }
});


client.login(process.env.token); // Activates the bot