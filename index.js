require("dotenv").config();
const { Client, Collection, GatewayIntentBits, REST, Routes, ActivityType } = require("discord.js");
const fs = require("fs");
const path = require("path");

const token = process.env.BOT_TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;

if (!token) {
  console.error("❌ Missing bot token! Ensure BOT_TOKEN is set in the .env file.");
  process.exit(1);
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
});

client.commands = new Collection();

const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));

const commands = [];

for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  if (command.data && command.data.name) {
    client.commands.set(command.data.name, command);
    commands.push(command.data.toJSON());
  } else {
    console.warn(`⚠️ Command ${file} missing data or name`);
  }
}

const rest = new REST({ version: "10" }).setToken(token);

(async () => {
  try {
    console.log("🚀 Refreshing application (/) commands...");
    await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands });
    console.log("✅ Successfully refreshed application (/) commands.");
    await client.login(token);
  } catch (error) {
    console.error("🔥 Failed to deploy commands:", error);
  }
})();

client.once("ready", () => {
  console.log(`✅ Logged in as ${client.user.tag}!`);
  client.user.setPresence({
    activities: [{ name: "RRS Law Enforcement", type: ActivityType.Watching }],
    status: "online",
  });
});

// Catch unhandled promise rejections
process.on("unhandledRejection", (error) => {
  console.error("Unhandled promise rejection:", error);
});

client.on("interactionCreate", async (interaction) => {
  console.log("Interaction received:", interaction.commandName || interaction.customId);

  if (interaction.isChatInputCommand()) {
    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    // Example: permission check (remove or customize as needed)
    // if (!interaction.member.roles.cache.has('YOUR_ROLE_ID')) {
    //   return interaction.reply({ content: "⛔ You don't have permission.", ephemeral: true });
    // }

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error("Error executing command:", error);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: "⚠️ There was an error executing this command.", ephemeral: true });
      } else {
        await interaction.reply({ content: "⚠️ There was an error executing this command.", ephemeral: true });
      }
    }
  }
});
