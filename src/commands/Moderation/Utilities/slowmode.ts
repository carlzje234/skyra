import { SkyraCommand, SkyraCommandOptions } from '@lib/structures/SkyraCommand';
import { PermissionLevels } from '@lib/types/Enums';
import { ApplyOptions, CreateResolvers } from '@skyra/decorators';
import { Time } from '@utils/constants';
import { TextChannel } from 'discord.js';
import { KlasaMessage } from 'klasa';

const MAXIMUM_TIME = (Time.Hour * 6) / 1000;

@ApplyOptions<SkyraCommandOptions>({
	aliases: ['sm'],
	bucket: 2,
	cooldown: 5,
	cooldownLevel: 'channel',
	description: (language) => language.get('commandSlowmodeDescription'),
	extendedHelp: (language) => language.get('commandSlowmodeExtended'),
	permissionLevel: PermissionLevels.Moderator,
	requiredPermissions: ['MANAGE_CHANNELS'],
	runIn: ['text'],
	usage: '<reset|off|seconds:integer|cooldown:cooldown>'
})
@CreateResolvers([
	['cooldown', async (arg, possible, message) => (await message.client.arguments.get('timespan')!.run(arg, possible, message)) / 1000]
])
export default class extends SkyraCommand {
	public async run(message: KlasaMessage, [cooldown]: ['reset' | 'off' | number]) {
		if (cooldown === 'reset' || cooldown === 'off' || cooldown < 0) cooldown = 0;
		else if (cooldown > MAXIMUM_TIME) throw message.language.get('commandSlowmodeTooLong');
		const channel = message.channel as TextChannel;
		await channel.setRateLimitPerUser(cooldown);
		return cooldown === 0
			? message.sendLocale('commandSlowmodeReset')
			: message.sendLocale('commandSlowmodeSet', [{ cooldown: cooldown * 1000 }]);
	}
}
