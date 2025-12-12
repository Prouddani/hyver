require('dotenv').config();
const url = require('url');

const { } = require ('./commands.js');
const { OAuth2Handler } = require('./oauth2.js');
const { Client, IntentsBitField, ActionRowBuilder, ButtonStyle } = require('discord.js');
const { ButtonBuilder } = require('@discordjs/builders');
const { verify } = require('crypto');

// Bot's client instance
const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
    ]
});
let guildId;

const oauth2 = new OAuth2Handler();
oauth2.on('redirected', async (tokens_body) => {
    console.log(tokens_body);

    const {
        tokens_body: refreshed_tokens_body,
        user: user_data
    } = await oauth2.getUserDataFromRefreshToken(tokens_body.refresh_token);

    console.log(user_data);
});

client.on('clientReady', async (c) => {
    console.log(`Bot initialized as ${c.user.tag}`);
    
    try
    {


        { /* Verification Message Posting */
            const channel = await client.channels.cache.get(process.env.VerifyChannelID);
            if (!channel) return;

            const verify_messages = await channel.messages.fetch({ limit: 100 });
            posted_already = verify_messages.some(message => message.author.id === client.user.id);

            if (!posted_already)
            {
                // Message and create verify button

                const row = new ActionRowBuilder();
                row.components.push(
                    new ButtonBuilder().setCustomId('verify')
                                        .setLabel('Verify')
                                        .setStyle(ButtonStyle.Link)
                                        .setURL()
                );
                
                await channel.send({
                    content: 'Verify by accessing the link below:',
                    components: [row],
                });
            }
        }
    } catch (err) {
        console.log(err);
    }
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;
});

client.login(process.env.token); // Activates the bot