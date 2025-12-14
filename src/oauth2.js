const express = require('express')
const axios = require('axios')
const url = require('url')

class OAuth2Handler
{
    constructor()
    {
        this.events = {};
        this.app = express();

        // Fired when someone gets redirected from discord oauth2
        this.app.get('localhost:1337', async (request, response) => {
            try {
                const { code } = request.query;
                if (!code) return response.status(400).send('No code provided');

                const tokens_body = new url.URLSearchParams({
                    client_id: process.env.ClientId,
                    client_secret: process.env.ClientSecret,
                    grant_type: 'authorization_code',
                    code: code.toString(),
                    redirect_uri: `https://prouddani.github.io/hyver/`,
                });

                // Exchange the authorization code for an access token
                const token_response = await axios.post(
                    'https://discord.com/api/v10/oauth2/token',
                    tokens_body,
                    {
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                        }
                    }
                );

                if (!token_response.data || !token_response.data.access_token || !token_response.data.refresh_token)
                    return response.status(400).send('Tokens exchange failed');

                if (this.events.redirected)
                    await this.events.redirected(token_response.data);

            } catch (error) {
                const messsage = error?.response?.data ? JSON.stringify(error.response.data) : String(error);
                return response.status(500).send(messsage);
            }
        });

        this.app.listen(1337, () => {
            console.log(`Running oauth2`);
        });
    }

    on(event, callback)
    {
        this.events[event] = callback;
    }

    async getUserDataFromRefreshToken(refresh_token) {
        const refresh_body = new URLSearchParams({
            client_id: process.env.client_id,
            client_secret: process.env.client_secret,
            grant_type: "refresh_token",
            refresh_token: refresh_token,
        });

        const refreshed_token_body = await axios.post(
            "https://discord.com/api/v10/oauth2/token",
            refresh_body,
            { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
        )

        const access_token = refreshed_token_body.data.access_token
        if (!access_token)
            throw new Error("No access token in refreshed data")

        const user_info = await axios.get("https://discord.com/api/v10/users/@me", {
            headers: {
                Authorization: `Bearer ${access_token}`
            }
        })

        return { tokens_body: refreshed_token_body.data, user: user_info.data }
    }
}

module.exports = { OAuth2Handler };