require('dotenv').config();
const express = require('express');
const axios = require('axios');
const url = require('url');

const port = process.env.PORT || 1337;
const app = express();

class OAuth2
{
    constructor()
    {

    }
}

app.get('/api/auth/discord/redirect', async (request, response) => {
    const { code } = request.query;

    if (code)
    {
        const formData = new url.URLSearchParams({
            client_id: process.env.ClientId,
            client_secret: process.env.ClientSecret,
            grant_type: 'authorization_code',
            code: code.toString(),
            redirect_uri: `http://localhost:${port}/api/auth/discord/redirect`,
        });

        const output = await axios.post(
            'https://discord.com/api/v10/oauth2/token',
            formData,
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                }
            }
        );

        if (output.data)
        {
            const access = output.data.access_token;
            const userinfo = await axios.get('https://discord.com/api/v10/users/@me', {
                headers: {
                    'Authorization': `Bearer ${access}`,
                },
            });

            // refresh token
            const formData1 = new url.URLSearchParams({
                client_id: process.env.ClientId,
                client_secret: process.env.ClientSecret,
                grant_type: 'refresh_token',
                refresh_token: output.data.refresh_token,
            });

            const refresh = await axios.post(
                'https://discord.com/api/v10/oauth2/token',
                formData1,
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    }
                }
            );

            console.log(output.data, userinfo.data, refresh.data);
        }
    }
});

app.listen(port, () => {
    console.log(`Running on ${port}`);
});