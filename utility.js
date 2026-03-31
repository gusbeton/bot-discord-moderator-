const {
  Client,
  GatewayIntentBits,
  SlashCommandBuilder,
  REST,
  Routes,
  EmbedBuilder,
  PermissionsBitField
} = require('discord.js');

const TOKEN = 'ISI_TOKEN_BOT_UTILITY';
const CLIENT_ID = 'ISI_CLIENT_ID';
const GUILD_ID = 'ISI_SERVER_ID';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages
  ]
});

// ================= REGISTER COMMAND =================
const commands = [
  new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Ban member')
    .addUserOption(opt =>
      opt.setName('user').setDescription('Target').setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kick member')
    .addUserOption(opt =>
      opt.setName('user').setDescription('Target').setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName('timeout')
    .setDescription('Mute member')
    .addUserOption(opt =>
      opt.setName('user').setDescription('Target').setRequired(true)
    )
    .addIntegerOption(opt =>
      opt.setName('durasi').setDescription('Detik').setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Hapus chat')
    .addIntegerOption(opt =>
      opt.setName('jumlah').setDescription('Jumlah pesan').setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName('serverinfo')
    .setDescription('Info server'),

  new SlashCommandBuilder()
    .setName('userinfo')
    .setDescription('Info user')
    .addUserOption(opt =>
      opt.setName('user').setDescription('Target').setRequired(true)
    )
];

// REGISTER KE DISCORD
const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
  await rest.put(
    Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
    { body: commands }
  );
})();

// ================= READY =================
client.once('ready', () => {
  console.log(`Utility bot ready: ${client.user.tag}`);
});

// ================= COMMAND HANDLER =================
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const member = interaction.member;

  // ================= BAN =================
  if (interaction.commandName === 'ban') {
    if (!member.permissions.has(PermissionsBitField.Flags.BanMembers))
      return interaction.reply({ content: '❌ No permission', ephemeral: true });

    const user = interaction.options.getUser('user');
    await interaction.guild.members.ban(user);

    return interaction.reply(`🔨 ${user.tag} diban`);
  }

  // ================= KICK =================
  if (interaction.commandName === 'kick') {
    if (!member.permissions.has(PermissionsBitField.Flags.KickMembers))
      return interaction.reply({ content: '❌ No permission', ephemeral: true });

    const user = interaction.options.getUser('user');
    await interaction.guild.members.kick(user);

    return interaction.reply(`👢 ${user.tag} dikick`);
  }

  // ================= TIMEOUT =================
  if (interaction.commandName === 'timeout') {
    if (!member.permissions.has(PermissionsBitField.Flags.ModerateMembers))
      return interaction.reply({ content: '❌ No permission', ephemeral: true });

    const user = interaction.options.getUser('user');
    const duration = interaction.options.getInteger('durasi');

    const target = await interaction.guild.members.fetch(user.id);
    await target.timeout(duration * 1000);

    return interaction.reply(`🔇 ${user.tag} dimute ${duration} detik`);
  }

  // ================= CLEAR =================
  if (interaction.commandName === 'clear') {
    if (!member.permissions.has(PermissionsBitField.Flags.ManageMessages))
      return interaction.reply({ content: '❌ No permission', ephemeral: true });

    const amount = interaction.options.getInteger('jumlah');

    const messages = await interaction.channel.bulkDelete(amount, true);
    return interaction.reply({
      content: `🧹 ${messages.size} pesan dihapus`,
      ephemeral: true
    });
  }

  // ================= SERVER INFO =================
  if (interaction.commandName === 'serverinfo') {
    const embed = new EmbedBuilder()
      .setColor('#FFD700')
      .setTitle('📊 SERVER INFO')
      .addFields(
        { name: 'Nama Server', value: interaction.guild.name },
        { name: 'Total Member', value: `${interaction.guild.memberCount}` }
      )
      .setThumbnail(interaction.guild.iconURL());

    return interaction.reply({ embeds: [embed] });
  }

  // ================= USER INFO =================
  if (interaction.commandName === 'userinfo') {
    const user = interaction.options.getUser('user');

    const embed = new EmbedBuilder()
      .setColor('#FFD700')
      .setTitle('👤 USER INFO')
      .setThumbnail(user.displayAvatarURL())
      .addFields(
        { name: 'Username', value: user.tag },
        { name: 'ID', value: user.id }
      );

    return interaction.reply({ embeds: [embed] });
  }
});

client.login(TOKEN);