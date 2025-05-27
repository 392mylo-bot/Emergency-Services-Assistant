const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Displays help message'),
  async execute(interaction) {
    await interaction.reply('How can I assist you? If this is an emergency, please contact local authorities.');
  }
};
