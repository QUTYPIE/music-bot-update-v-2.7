const { MessageEmbed } = require("discord.js");
module.exports = class Volume extends Interaction {
  constructor() {
    super({
      name: "volume",
      description: "Changes the volume of the music player",
      options: [
        {
          type: "4",
          name: "value",
          description: "The value to set the volume to",
          required: true,
        },
      ],
    });
  }

  async exec(int, data) {

const novc = new MessageEmbed() .setDescription(`${this.client.emotes.get("supremenomusic")} **You should be in a voice channel!** \n ${this.client.emotes.get("supremeblank")}${this.client.emotes.get("supremedot")} Developer: [Atreya#2401](https://aromaxdev.xyz/github)`)
  .setColor(`#FFFFFF`);

      const novcs = new MessageEmbed() .setDescription(`${this.client.emotes.get("supremenomusic")} **You should be in a my voice channel!** \n ${this.client.emotes.get("supremeblank")}${this.client.emotes.get("supremedot")} Developer: [Atreya#2401](https://aromaxdev.xyz/github)`)
  .setColor(`#FFFFFF`);

      const nodj = new MessageEmbed() .setDescription(`${this.client.emotes.get("supremedj")} **You should be a DJ or Alone in Voice Channel!** \n ${this.client.emotes.get("supremeblank")}${this.client.emotes.get("supremedot")} Developer: [Atreya#2401](https://aromaxdev.xyz/github)`)
  .setColor(`#FFFFFF`);

      const nomusic = new MessageEmbed() .setDescription(`${this.client.emotes.get("supremenomusic")} **Nothing is playing in this server!** \n ${this.client.emotes.get("supremeblank")}${this.client.emotes.get("supremedot")} Use: \`/play\` [song/url](https://aromaxdev.xyz/github) to play a music.`)
  .setColor(`#FFFFFF`);

const { MessageActionRow, MessageButton } = require("discord.js");
const btn1 = new MessageButton()
      .setLabel("Support")
        .setEmoji(`954350666539753512`)
      .setStyle("LINK")
          .setURL(`https://discord.gg/whJeF4mDAX`);

    const btn2 = new MessageButton()
      .setLabel("Invite")
      .setStyle("LINK")
      .setEmoji(`954610269609394187`)
          .setURL(`https://discord.com/api/oauth2/authorize?client_id=${this.client.user.id}&permissions=8&scope=bot%20applications.commands`);

let buttonList = [btn1, btn2];
const row = new MessageActionRow().addComponents(buttonList);


    
    const volume = int.options.getInteger("value");
    let channel = int.member.voice.channel;

    if (!channel)
      return int.reply({
        embeds: [novc],
        components: [row],
        ephemeral: false,
      });
    if (int.guild.me.voice.channel && channel !== int.guild.me.voice.channel)
      return int.reply({
        embeds: [novcs],
        ephemeral: false,
      });

    let isDJ = data.djRoles.some((r) => int.member._roles.includes(r));
    let isAllowed = data.voiceChannels.find((c) => c === channel.id);
    let members = channel.members.filter((m) => !m.user.bot);

    if (data.voiceChannels.length > 0 && !isAllowed) {
      return int.reply({
        content: `${this.client.emotes.get(
          "supremenomic"
        )} | You must be in one of the allowed voice channels to use this command!`,
        ephemeral: true,
      });
    }

    if (
      members.size > 1 &&
      !isDJ &&
      !int.member.permissions.has("MANAGE_GUILD")
    ) {
      return int.reply({
        embeds: [nodj],
        ephemeral: false,
      });
    }

    if (volume < 0 || volume > 150)
      return int.reply({
        content: "Please enter a volume between 0 and 150!",
        ephemeral: true,
      });

    let hasQueue = this.client.player.hasQueue(int.guild.id);
    if (!hasQueue)
      return int.reply({
        embeds: [nomusic],
        components: [row],
        ephemeral: false,
      });

    let queue = this.client.player.getQueue(int.guild.id);

    queue.setVolume(volume);

    let emoji;
    if (volume === 0) {
      emoji = this.client.emotes.get("vol-mute");
    } else if (volume > 0 && volume <= 33) {
      emoji = this.client.emotes.get("vol-low");
    } else if (volume > 33 && volume <= 66) {
      emoji = this.client.emotes.get("vol-mid");
    } else if (volume > 66 && volume < 100) {
      emoji = this.client.emotes.get("vol-high");
    }

const vol = new MessageEmbed() .setDescription(`${this.client.emotes.get("supremevolume")} **Volume is now set to __${volume}__%.** \n ${this.client.emotes.get("supremeblank")}${this.client.emotes.get("supremedot")} Tips: You can set volume upto 150%.`)
  .setColor(`#FFFFFF`);
    
    return int.reply({
      embeds: [vol],
      components: [row],
        ephemeral: false,
    });
  }
};
