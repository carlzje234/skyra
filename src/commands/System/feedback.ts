import { SkyraCommand, SkyraCommandOptions } from '@lib/structures/SkyraCommand';
import { ApplyOptions } from '@skyra/decorators';
import { KlasaMessage } from 'klasa';

@ApplyOptions<SkyraCommandOptions>({
	bucket: 2,
	cooldown: 20,
	description: (language) => language.get('commandFeedbackDescription'),
	extendedHelp: (language) => language.get('commandFeedbackExtended'),
	guarded: true,
	usage: '<message:string{8,1900}>'
})
export default class extends SkyraCommand {
	public async run(message: KlasaMessage, [feedback]: [string]) {
		// Set the global flag
		Reflect.set(message.flagArgs, 'global', 'global');

		// Send the feedback as a suggestion
		return this.client.commands.get('suggest')!.run(message, [feedback]);
	}

	public async init() {
		if (this.client.webhookFeedback === null) this.disable();
	}
}
