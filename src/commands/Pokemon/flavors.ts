import { DexDetails } from '@favware/graphql-pokemon';
import { RichDisplayCommand, RichDisplayCommandOptions } from '@lib/structures/RichDisplayCommand';
import { UserRichDisplay } from '@lib/structures/UserRichDisplay';
import { CdnUrls } from '@lib/types/Constants';
import { toTitleCase } from '@sapphire/utilities';
import { ApplyOptions } from '@skyra/decorators';
import { BrandingColors } from '@utils/constants';
import { fetchGraphQLPokemon, getPokemonFlavorTextsByFuzzy, resolveColour } from '@utils/Pokemon';
import { pickRandom } from '@utils/util';
import { MessageEmbed } from 'discord.js';
import { KlasaMessage } from 'klasa';

@ApplyOptions<RichDisplayCommandOptions>({
	aliases: ['flavor', 'flavour', 'flavours'],
	cooldown: 10,
	description: (language) => language.get('commandFlavorsDescription'),
	extendedHelp: (language) => language.get('commandFlavorsExtended'),
	usage: '<pokemon:str>',
	flagSupport: true
})
export default class extends RichDisplayCommand {
	public async run(message: KlasaMessage, [pokemon]: [string]) {
		const response = await message.sendEmbed(
			new MessageEmbed().setDescription(pickRandom(message.language.get('systemLoading'))).setColor(BrandingColors.Secondary)
		);

		const pokemonData = await this.fetchAPI(message, pokemon.toLowerCase());

		await this.buildDisplay(message, pokemonData).start(response, message.author.id);
		return response;
	}

	private async fetchAPI(message: KlasaMessage, pokemon: string) {
		try {
			const { data } = await fetchGraphQLPokemon<'getPokemonDetailsByFuzzy'>(getPokemonFlavorTextsByFuzzy, { pokemon });
			return data.getPokemonDetailsByFuzzy;
		} catch {
			throw message.language.get('commandFlavorsQueryFail', { pokemon });
		}
	}

	private buildDisplay(message: KlasaMessage, pokemonData: DexDetails) {
		const display = new UserRichDisplay(
			new MessageEmbed()
				.setColor(resolveColour(pokemonData.color))
				.setAuthor(`#${pokemonData.num} - ${toTitleCase(pokemonData.species)}`, CdnUrls.Pokedex)
				.setThumbnail(message.flagArgs.shiny ? pokemonData.shinySprite : pokemonData.sprite)
		);

		for (const flavorText of pokemonData.flavorTexts) {
			display.addPage((embed: MessageEmbed) => embed.setDescription([`**${flavorText.game}**`, flavorText.flavor].join('\n')));
		}

		return display;
	}
}
