const { Command } = require('../../index');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['giveaway'],
			botPerms: ['EMBED_LINKS', 'ADD_REACTIONS'],
			description: msg => msg.language.get('COMMAND_GIVEAWAY_DESCRIPTION'),
			extendedHelp: msg => msg.language.get('COMMAND_GIVEAWAY_EXTENDED'),
			usage: '<time:time> <title:string> [...]',
			usageDelim: ' '
		});
	}

	async run(msg, [time, ...rawTitle]) {
		const offset = time.getTime() - Date.now();

		if (offset < 60000) throw msg.language.get('GIVEAWAY_TIME');
		const title = rawTitle.length > 0 ? rawTitle.join(' ') : null;
		const date = new Date(offset + Date.now() - 20000);

		let message;
		try {
			message = await msg.channel.send(msg.language.get('GIVEAWAY_TITLE'), {
				embed: new this.client.methods.Embed()
					.setColor(0x49C6F7)
					.setTitle(title)
					.setDescription(msg.language.get('GIVEAWAY_DURATION', offset))
					.setFooter(msg.language.get('GIVEAWAY_ENDS_AT'))
					.setTimestamp(date)
			});
			await message.react('🎉');
		} catch (_) {
			return null;
		}

		const { id } = await this.client.schedule.create('giveaway', date, {
			catchUp: true,
			data: {
				timestamp: date.getTime() + 20000,
				guildID: msg.guild.id,
				channelID: msg.channel.id,
				messageID: message.id,
				userID: msg.author.id,
				title
			}
		});

		await msg.author.send(msg.language.get('GIVEAWAY_START_DIRECT_MESSAGE', title, id)).catch(() => null);
		return message;
	}

};