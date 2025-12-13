require('dotenv').config();
const url = require('url');

const { CommandsHandler } = require ('./commands.js');
const { PostgresHandler } = require('./postgres');
const { OAuth2Handler } = require('./oauth2.js');
const { Client, IntentsBitField, ActionRowBuilder, ButtonStyle, ButtonBuilder, ApplicationCommandOptionType, MessageFlags } = require('discord.js');

// Bot's client instance
const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
    ]
});

const oauth2 = new OAuth2Handler();
const pgHandler = new PostgresHandler();
const cmdHandler = new CommandsHandler();

client.on('clientReady', async (c) => {
    console.log(`Bot initialized as ${c.user.tag}`);
    
    try
    {


        { /* Verification Message Posting */
            const guilds = await pgHandler.getGuildsInfo();
            console.log(guilds);
            if (guilds)
            {
                guilds.forEach(async guildInfo => {
                    console.log(guildInfo);
                    const channel = await client.channels.fetch(guildInfo.verify_channel_id);
                    if (!channel)
                        return;

                    const verify_messages = await channel.messages.fetch({ limit: 10 });
                    posted_already = verify_messages.some(message => message.author.id === client.user.id);

                    if (!posted_already)
                    {
                        // Message and create verify button

                        const row = new ActionRowBuilder();
                        row.components.push(
                            new ButtonBuilder().setCustomId('verify')
                                                .setLabel('Verify')
                                                .setStyle(ButtonStyle.Primary)
                        );
                        
                        await channel.send({
                            content: 'Verify by accessing the link below:',
                            components: [row],
                        });
                    }
                })
            }
        }
    } catch (err) {
        console.log(err);
    }



    { // oauth2
        oauth2.on('redirected', async (tokens_body) => {
            console.log(tokens_body);

            const {
                tokens_body: refreshed_tokens_body,
                user: user_data
            } = await oauth2.getUserDataFromRefreshToken(tokens_body.refresh_token);

            console.log(user_data);
        });
    }

    { // command handler
        cmdHandler.addCommand({
            name: 'setverify',
            description: 'Sets a new channel for verification to happen',
            options: [
                {
                    name: 'channel',
                    description: 'The channel you want to be used for verifications',
                    type: ApplicationCommandOptionType.Channel,
                    required: true
                }
            ]
        }, client, async (interaction) => {
            const channel = interaction.options.get('channel');
            
            await interaction.deferReply();

            const error = await pgHandler.setGuildAndVerifyChannel(interaction.guild.id, channel.channel.id);
            if (error)
            {
                interaction.editReply(
                    {
                        content: `${error}`,
                        flags: MessageFlags.Ephemeral,
                    }
                );
            }
            else {
                interaction.editReply(
                    {
                        content: 'Verified!',
                        flags: MessageFlags.Ephemeral
                    }
                );
            }
        });
        cmdHandler.flush(client);
    }
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;
});

client.login(process.env.token); // Activates the bot