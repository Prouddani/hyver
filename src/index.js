// import { Client, IntentsBitField, ActionRowBuilder, ButtonStyle, ButtonBuilder, ApplicationCommandOptionType, MessageFlags } from 'discord.js'
const { Client, IntentsBitField, ActionRowBuilder, ButtonStyle, ButtonBuilder, ApplicationCommandOptionType, MessageFlags } = require('discord.js')

const { CommandsHandler } = require('./commands')
const { PostgresHandler } = require('./postgres')
const { OAuth2Handler } = require('./oauth2')

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

        // Send verification message slash command
        cmdHandler.addCommand({
            name: 'sendverification',
            description: 'Send the verify message on the channel you currently are in',
        }, client, async (interaction) => {
            const error = await pgHandler.setGuildAndVerifyChannel(interaction.guildId, interaction.channelId);
            if (error)
            {
                interaction.reply(
                    {
                        content: `${error}`,
                        flags: MessageFlags.Ephemeral,
                    }
                );
            }
            else {
                try {
                    /* Verification Message Posting */
                    const row = new ActionRowBuilder();
                    row.components.push(
                        new ButtonBuilder().setLabel('Authenticate discord account')
                                            .setStyle(ButtonStyle.Link)
                                            .setURL(process.env.oauth2)

                    );
                    
                    const message = await interaction.channel.send(
                        {
                            content: 'Verify by accessing the link below:',
                            components: [row],
                        }
                    );

                    await pgHandler.setMessageId(message.guild.id, message.id);


                    // cleaning
                    const contents = [
                        'Fwoosh! This channel can now be used for hyverification 😏',
                        'Done! Just like you ordered! *salutes*',
                        'I am inside your walls. (I did my task)',
                        "console.log('Hello world! (this channel is now being used for verifications!)') // 01101000 01101001",
                        `I, ${client.user.tag}, announce that this channel will now be used as a verification centre! 👏👏👏`
                    ]
                    interaction.reply(
                        {
                            content: contents[Math.floor(Math.random() * contents.length)],
                            flags: MessageFlags.Ephemeral
                        }
                    );
                } catch (error) {
                    console.log(error);
                }
            }
        });

        cmdHandler.flush(client);
    }
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;
});

client.login(process.env.token); // Activates the bot