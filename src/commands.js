require('dotenv').config();
const { REST, Routes, ApplicationCommandOptionType } = require('discord.js');

const commands = [
    {
        name: 'add',
        description: 'Adds two numbers together',
        options: [
            {
                name: 'num1',
                description: 'The first number',
                type: ApplicationCommandOptionType.Number,
                choices: [
                    {
                        name: 'one',
                        value: 1,
                    },
                    {
                        name: 'two',
                        value: 2,
                    },
                    {
                        name: 'three',
                        value: 3,
                    },
                ],
                required: true
            },
            {
                name: 'num2',
                description: 'The second number',
                type: ApplicationCommandOptionType.Number,
                required: true
            }
        ]
    }
];

const rest = new REST({ version: '10' }).setToken(process.env.token);

(async () => {
    try {
        console.log('Registering commands...');

        await rest.put(
            Routes.applicationGuildCommands(process.env.ClientID, process.env.GuildID),
            {
                
                body: commands,
            }
        );

        console.log('Commands were registered successfully.');
    } catch (error) {
        console.error(error);
    }
})();