import { SkyraCommand } from '@lib/structures/SkyraCommand';
import { isNumber } from '@sapphire/utilities';
import { CommandStore, KlasaMessage } from 'klasa';

export default class extends SkyraCommand {
	/**
	 * Syntax  : {number}?[ ]d[ ]{number}[ ]{.*?}
	 * Examples:
	 *  - 4d6
	 *  - d20
	 *  - 2d8+2
	 */
	private readonly kDice20RegExp = /^(\d+)?\s*d\s*(\d+)\s*(.*?)$/;

	/**
	 * Syntax  : {+-}[ ]{number}
	 * Examples:
	 *  - +20
	 *  - -50
	 *  - + 70
	 */
	private readonly kDice20TrailRegExp = /([+-])\s*(\d+)/g;

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['roll'],
			cooldown: 5,
			description: (language) => language.get('commandDiceDescription'),
			extendedHelp: (language) => language.get('commandDiceExtended'),
			usage: '[amount:integer|dice:string]',
			spam: true
		});
	}

	public run(message: KlasaMessage, [amountOrDice = 1]: [number | string | undefined]) {
		return message.sendLocale('commandDiceOutput', [
			{
				result: this.roll(message, amountOrDice)
			}
		]);
	}

	private roll(message: KlasaMessage, pattern: string | number) {
		let amount: number | undefined = undefined;
		let dice: number | undefined = undefined;
		let modifier = 0;
		if (typeof pattern === 'number') {
			if (!isNumber(pattern) || pattern <= 0) throw message.language.get('resolverInvalidInt', { name: 'dice' });
			amount = pattern;
			dice = 6;
		} else {
			const results = this.kDice20RegExp.exec(pattern);
			if (results === null) throw message.language.get('commandDiceRollsError');
			amount = typeof results[1] === 'undefined' ? 1 : Number(results[1]);
			dice = Number(results[2]);

			if (amount <= 0 || amount > 1024) throw message.language.get('commandDiceRollsError');
			if (dice < 3 || dice > 1024) throw message.language.get('commandDiceSidesError');

			if (results[3].length > 0) {
				let modifierResults: RegExpExecArray | null = null;
				while ((modifierResults = this.kDice20TrailRegExp.exec(results[3]))) {
					if (modifierResults[1] === '+') {
						modifier += Number(modifierResults[2]);
					} else {
						modifier -= Number(modifierResults[2]);
					}
				}
			}
		}

		const maximum = amount * dice;
		const minimum = amount;
		return Math.floor(Math.random() * (maximum - minimum + 1) + minimum + modifier);
	}
}
