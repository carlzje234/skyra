import { SkyraCommand, SkyraCommandOptions } from '@lib/structures/SkyraCommand';
import { ApplyOptions } from '@skyra/decorators';
import { pickRandom } from '@utils/util';
import { KlasaMessage } from 'klasa';

const NUMBER_OPTS = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];

const ALPHABET_OPTS = ['🇦', '🇧', '🇨', '🇩', '🇪', '🇫', '🇬', '🇭', '🇮', '🇯', '🇰', '🇱', '🇲', '🇳', '🇴', '🇵', '🇶', '🇷', '🇸', '🇹'];

@ApplyOptions<SkyraCommandOptions>({
	aliases: ['spoll'],
	cooldown: 5,
	description: (language) => language.get('commandPollDescription'),
	extendedHelp: (language) => language.get('commandPollExtended'),
	usage: '<options:string> [...]',
	usageDelim: ',',
	requiredPermissions: ['ADD_REACTIONS', 'READ_MESSAGE_HISTORY']
})
export default class extends SkyraCommand {
	public async run(message: KlasaMessage, options: string[]) {
		// since klasa usage is trash
		if (options.length < 2 || options.length > 20)
			throw message.language.get('resolverMinmaxBothInclusive', { name: 'options', min: 2, max: 20 });

		const emojis = (options.length > 10 ? ALPHABET_OPTS : NUMBER_OPTS).slice(0, options.length);
		const loadingMsg = await message.send(pickRandom(message.language.get('systemLoading')), []);

		for (const emoji of emojis) {
			if (loadingMsg.reactions.cache.size === 20) throw message.language.get('commandPollReactionLimit');
			await loadingMsg.react(emoji);
		}

		await message.send(options.map((option, i) => `${emojis[i]} → *${option.trim()}*`).join('\n'));
	}
}
