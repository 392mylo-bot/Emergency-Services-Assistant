// bot.js
const { Client, GatewayIntentBits, Partials, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, Events } = require('discord.js');
const express = require('express');
const bodyParser = require('body-parser');

const TOKEN = 'YOUR_NEW_BOT_TOKEN'; // Replace with regenerated token
const REVIEW_CHANNEL_ID = '1373039177482109029';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
  ],
  partials: [Partials.Channel]
});

// Express server to receive form submissions
const app = express();
app.use(bodyParser.json());

// Form POST endpoint
app.post('/submit', async (req, res) => {
  const { name, discordId, answers } = req.body;

  const embed = new EmbedBuilder()
    .setTitle('New Application Submitted')
    .setDescription(`**Name:** ${name}\n**Discord ID:** ${discordId}\n\n${answers.map((a, i) => `**Q${i + 1}:** ${a.question}\n${a.answer}`).join('\n\n')}`)
    .setColor(0x3498db)
    .setFooter({ text: 'Use buttons below to accept or deny.' });

  const buttons = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`accept_${name}_${discordId}`)
      .setLabel('Accept')
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId(`deny_${name}_${discordId}`)
      .setLabel('Deny')
      .setStyle(ButtonStyle.Danger)
  );

  const channel = await client.channels.fetch(REVIEW_CHANNEL_ID);
  await channel.send({ embeds: [embed], components: [buttons] });

  res.sendStatus(200);
});

// Handle button clicks
client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isButton()) return;

  const [action, name, discordId] = interaction.customId.split('_');

  const resultEmbed = new EmbedBuilder()
    .setTitle('Entry Application Reviewed!')
    .setDescription(`> **${name}**'s application has been **${action.toUpperCase()}**.`)
    .setColor(action === 'accept' ? 0x2ecc71 : 0xe74c3c);

  await interaction.reply({ embeds: [resultEmbed], ephemeral: false });

  try {
    const user = await client.users.fetch(discordId);
    await user.send(`Hi ${name}, your application has been **${action.toUpperCase()}**.`);
  } catch (err) {
    console.error(`Could not DM user ${discordId}:`, err.message);
  }
});

client.login(TOKEN);

// Start server
app.listen(3000, () => {
  console.log('Form receiver listening on port 3000');
});
