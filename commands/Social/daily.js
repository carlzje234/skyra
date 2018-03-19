const { Command, constants: { TIME } } = require('../../index');
const GRACE_PERIOD = TIME.HOUR * 11;
const DAILY_PERIOD = TIME.HOUR * 12;

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['dailies'],
			bucket: 2,
			cooldown: 30,
			description: msg => msg.language.get('COMMAND_DAILY_DESCRIPTION'),
			extendedHelp: msg => msg.language.get('COMMAND_DAILY_EXTENDED'),
			runIn: ['text']
		});
		this.spam = true;
	}

	async run(msg) {
		const now = Date.now();
		const time = msg.author.configs.timeDaily;

		// It's been 12 hours, grant dailies
		if (time <= now) return msg.sendMessage(msg.language.get('COMMAND_DAILY_TIME_SUCCESS',
			await this.claimDaily(msg, now + DAILY_PERIOD)));

		const remaining = time - now;

		// It's been less than 11 hours, tell the remaining time
		if (remaining < GRACE_PERIOD) return msg.sendMessage(msg.language.get('COMMAND_DAILY_TIME', remaining));

		// It's been 11-12 hours, ask for the user if they want to claim the grace period
		const accepted = await msg.ask(msg.language.get('COMMAND_DAILY_GRACE', remaining));
		if (!accepted) return msg.sendMessage(msg.language.get('COMMAND_DAILY_GRACE_DENIED'));

		// The user accepted the grace period
		return msg.sendMessage(msg.language.get('COMMAND_DAILY_GRACE_ACCEPTED',
			await this.claimDaily(msg, now + remaining + DAILY_PERIOD),
			remaining + DAILY_PERIOD));
	}

	async claimDaily(msg, nextTime) {
		let money = 200;
		if (msg.guild) {
			if (msg.guild.configs._syncStatus) await msg.guild.configs._syncStatus;
			money *= msg.guild.configs.social.boost;
		}
		await msg.author.configs.update(['money', 'timeDaily'], [msg.author.configs + money, nextTime]);
		return money;
	}

};