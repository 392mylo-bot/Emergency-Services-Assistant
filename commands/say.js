const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('say')
    .setDescription('Make the bot say something.')
    .addStringOption(option =>
      option.setName('message')
        .setDescription('The message to say')
        .setRequired(true)
    ),

  async execute(interaction) {
    const message = interaction.options.getString('message');

    // Defer without replying visibly
    await interaction.deferReply({ ephemeral: true });

    // Send message to the same channel
    await interaction.channel.send(message);

    // Create the embed for logging
    const logEmbed = new EmbedBuilder()
      .setTitle('**Command Used**')
      .setDescription(`<@${interaction.user.id}> has used the say command, \`${message}\``)
      .setColor('#CBA135') // FHP Tan
      .setFooter({ text: interaction.guild.name })
      .setTimestamp();

    // Send log to log channel
    const logChannelId = '1369969537914507386';
    const logChannel = interaction.client.channels.cache.get(logChannelId);
    if (logChannel) {
      await logChannel.send({ embeds: [logEmbed] });
    } else {
      console.warn('Log channel not found');
    }

    // Delete ephemeral reply (hides the command trace)
    await interaction.deleteReply();
  },
};
