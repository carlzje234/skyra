import { Command, Event, KlasaMessage, Stopwatch } from 'klasa';
import { Events } from '../lib/types/Enums';
import { GuildSettings } from '../lib/types/settings/GuildSettings';
import { CommandHandler, CommandHandlerParseResultOk } from '../lib/types/definitions/Internals';
import { SkyraCommand } from '../lib/structures/SkyraCommand';

export default class extends Event {

	public async run(message: KlasaMessage, command: string) {
		if (!message.guild || (message.guild!.settings.get(GuildSettings.DisabledChannels) as GuildSettings.DisabledChannels).includes(message.channel.id)) return null;
		command = command.toLowerCase();

		const tag = (message.guild!.settings.get(GuildSettings.Tags) as GuildSettings.Tags).some(t => t[0] === command);
		if (tag) return this.runTag(message, command);

		const alias = (message.guild!.settings.get(GuildSettings.Trigger.Alias) as GuildSettings.Trigger.Alias).find(entry => entry.input === command);
		const commandAlias = (alias && this.client.commands.get(alias.output)) || null;
		if (commandAlias) return this.runCommand(message, commandAlias);

		return null;
	}

	public runCommand(message: KlasaMessage, command: Command) {
		const commandHandler = this.client.monitors.get('commandHandler') as unknown as CommandHandler;
		const { prefix, prefixLength } = commandHandler.parseCommand(message) as CommandHandlerParseResultOk;

		// @ts-ignore
		return commandHandler.runCommand(message._registerCommand({ command, prefix, prefixLength }));
	}

	public async runTag(message: KlasaMessage, command: string) {
		const tagCommand = this.client.commands.get('tag') as TagCommand;
		const timer = new Stopwatch();

		try {
			await this.client.inhibitors.run(message, tagCommand);
			try {
				const commandRun = tagCommand.show(message, [command]);
				timer.stop();
				const response = await commandRun;
				this.client.finalizers.run(message, tagCommand, response, timer);
				this.client.emit(Events.CommandSuccess, message, tagCommand, ['show', command], response);
			} catch (error) {
				this.client.emit(Events.CommandError, message, tagCommand, ['show', command], error);
			}
		} catch (response) {
			this.client.emit(Events.CommandInhibited, message, tagCommand, response);
		}
	}

}

interface TagCommand extends SkyraCommand {
	add(message: KlasaMessage, args: [string, string]): Promise<KlasaMessage>;
	remove(message: KlasaMessage, args: [string]): Promise<KlasaMessage>;
	edit(message: KlasaMessage, args: [string, string]): Promise<KlasaMessage>;
	list(message: KlasaMessage): Promise<KlasaMessage>;
	show(message: KlasaMessage, args: [string]): Promise<KlasaMessage>;
	source(message: KlasaMessage, args: [string]): Promise<KlasaMessage>;
}
