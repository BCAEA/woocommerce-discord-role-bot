const { Client, Intents } = require('discord.js');
const mysql = require('mysql');

const discordClient = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS] });
const guildId = "561030588971220993"; // VancouFur Public
let guild;

const dbConnection = mysql.createConnection({
    host: 'localhost',
    user: 'user',
    password: 'password',
    database: 'database'
});

function updateRoles() {
    let sql = `SELECT option_value FROM wp_options WHERE option_name = 'lp_discord_usernames'`;
    dbConnection.query(sql, (error, results, fields) => {
        if (error) {
            console.error(error.message);
            return;
        }

        let usernames = JSON.parse(results[0].option_value);
        let has_names = false;

        for(let i in usernames) {
            has_names = true;
            let user = guild.members.cache.find(m => m.user.tag === usernames[i])
            if(user !== undefined){
                user.roles.add("581191833628180490");
                discordClient.channels.cache.get('798721002506158123').send('I assigned 18+ to <@' + user.id + '>')
            } else {
                discordClient.channels.cache.get('798721002506158123').send('I couldn\'t find @' + usernames[i])
            }
        }

        if(has_names) {
            let sql = `update wp_options set option_value = ? WHERE option_name = 'lp_discord_usernames'`;
            dbConnection.query(sql, ["[]"], (error, results, fields) => {
                if (error) console.error(error)
            });
        }
    });
}

discordClient.on('ready', () => {
    console.log(`Logged in as ${discordClient.user.tag}!`);
    guild = discordClient.guilds.cache.get(guildId)
    guild.members.fetch().then(results => {
        updateRoles();
        setInterval(updateRoles, 300000);
    }, error => {
        console.error(error);
    })
});

discordClient.login('DISCORD_TOKEN');

dbConnection.connect(function(err) {
    if (err) {
        return console.error('mysql error: ' + err.message);
    }
    console.log('Connected to the MySQL server.');
});

process.on('SIGTERM', () => {
    try {
        dbConnection.destroy();
        discordClient.destroy();
    } catch (e) {}
})
