import { SkyraCommand } from '@lib/structures/SkyraCommand';
import { CommandStore, KlasaMessage } from 'klasa';

export default class extends SkyraCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['updoot'],
			description: (language) => language.get('commandUpvoteDescription'),
			extendedHelp: (language) => language.get('commandUpvoteExtended')
		});
	}

	public run(message: KlasaMessage) {
		return message.sendLocale('commandUpvoteMessage');
	}
}
