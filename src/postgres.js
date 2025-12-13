require('dotenv').config();

const { createClient } = require('@supabase/supabase-js')

class PostgresHandler
{
    constructor()
    {
        this.supabase = createClient(process.env.supabase_url, process.env.supabase_secret_key);
    }

    async getGuildsInfo()
    {
        const { data, error } = await this.supabase.from('guilds').select('*');
        if (error)
        {
            console.log(error);
        }

        return data;
    }

    async setGuildAndVerifyChannel(guild_id, verify_channel_id)
    {
        const { data, error } = await this.supabase.from('guilds').select('guild_id').eq('guild_id', guild_id).limit(1).maybeSingle()
        
        if (error)
            return error;

        if (data !== null)
        {
            // data exists

            // update the verify_channel_id value of guild_id to the new verify_channel_id
            const { error2 } = await this.supabase.from('guilds').update({ 'verify_channel_id': verify_channel_id }).eq('guild_id', guild_id);

            if (error2 )
            {
                return error2;
            }
        }
        else
        {
            // no data exists
            const { error2 } = await this.supabase.from('guilds').insert({ guild_id: guild_id, verify_channel_id: verify_channel_id });

            if (error2 )
            {
                return error2;
            }
        }

    }
}

module.exports = { PostgresHandler };