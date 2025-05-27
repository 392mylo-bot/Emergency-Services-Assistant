require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { REST, Routes } = require("discord.js");

// Load environment variables securely
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;
const token = process.env.BOT_TOKEN;

console.log("🔍 CLIENT_ID:", clientId);
console.log("🔍 GUILD_ID:", guildId);
console.log("🔍 BOT_TOKEN:", token ? "✅ Token Loaded" : "❌ Missing BOT_TOKEN");

if (!token) {
  console.error("❌ Missing bot token! Ensure BOT_TOKEN is set in the .env file.");
  process.exit(1);
}

const commands = [];
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  try {
    const command = require(filePath);

    if (command.data && command.data.name) {
      commands.push(command.data.toJSON());
    } else {
      console.warn(`⚠️ [WARNING] Command file '${file}' is missing "data" or "data.name". Skipping.`);
    }
  } catch (error) {
    console.error(`❌ Failed to load command '${file}':`, error);
  }
}

const rest = new REST({ version: "10" }).setToken(token);

(async () => {
  try {
    console.log("🚀 Started refreshing application (/) commands...");

    await rest.put(
      Routes.applicationGuildCommands(clientId, guildId), 
      { body: commands }
    );

    console.log("✅ Successfully reloaded application (/) commands!");
  } catch (error) {
    console.error("🔥 Error updating commands:", error);
  }
})();
