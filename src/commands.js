require('dotenv').config();
const { Client, REST, Routes } = require('discord.js');

class CommandsHandler
{
    constructor(postgresHandler)
    {
        this.rest = new REST({ version: '10' }).setToken(process.env.token);
        this.commands = [];

        this.pgHandler = postgresHandler;
    }

    async addCommand(command, client, callback)
    {
        this.commands.push(command);
        client.on('interactionCreate', async (interaction) => {
            if (!interaction.isChatInputCommand()) return;
            
            if (interaction.commandName === command.name)
                await callback(interaction);
        });
    }

    async flush(client)
    {
        const guilds = await client.guilds.fetch();
        if (!guilds)
            return;

        guilds.forEach(async guild => {
           try {
                await this.rest.put(
                    Routes.applicationGuildCommands(process.env.client_id, guild.id),
                    {
                        body: this.commands,
                    }
                );
            } catch (error) {
                console.log(error);
            } 
        });
    }
}

module.exports = { CommandsHandler };