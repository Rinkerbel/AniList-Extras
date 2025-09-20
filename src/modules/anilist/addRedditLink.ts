import { $, $$, waitFor, createElement, removeElements, isUI } from '@/utils/Helpers';
import { registerModule, ModuleTags } from '@/utils/ModuleLoader';

registerModule.anilist({
	id: 'addRedditLink',
	name: 'Reddit Discussions Link',
	description: 'Adds a link to search for discussion threads on /r/anime on Reddit. This is probably not 100% accurate.',
	tags: [
		ModuleTags.Media,
		ModuleTags.External,
	],
	toggleable: true,

	validate({ currentPage }) {
		return /^\/anime\/\d+\/.+\/?$/.test(currentPage.pathname);
	},

	validateUnload({ currentPage, previousPage }) {
		const match1 = (/\/(anime\/\d+)/i.exec(currentPage.pathname))?.[1];
		const match2 = (/\/(anime\/\d+)/i.exec(previousPage.pathname))?.[1];
		return match1 !== match2 || isUI.mobile;
	},

	async load({ media }) {
		const targetLoaded = await waitFor('.sidebar');

		// If the target element or mal id is not found, return.
		if (!targetLoaded || !media.malId) return;

		let attrName: string;

		// In some cases this element may exist. We will wait/check to see if it
		// does and if not we will create it ourselves.
		if (await waitFor('.external-links .external-links-wrap')) {
			const attrEl = $('.external-links .external-links-wrap > a');
			attrName = attrEl!.attributes[0].name;
		} else {
			// Setting the "data-v-" attribute manually is not ideal as
			// this could change in the future but it'll do for now.
			attrName = 'data-v-c1b7ee7c';

			createElement('div', {
				attributes: {
					[attrName]: '',
					class: 'external-links alextras--external-links',
				},
				children: [
					createElement('h2', {
						textContent: 'External Links',
					}),
					createElement('div', {
						attributes: {
							class: 'external-links-wrap',
						},
					}),
				],
				appendTo: $('.sidebar')!,
			});
		}

		const statusNode = $$('.data-set').find(el => /status/i.test(el.textContent!));

		if (statusNode?.querySelector('.value')?.textContent === 'Not Yet Released') return;

		const query = new URLSearchParams({
			q: `subreddit:anime self:true (flair:Episode OR Discussion) (selftext:"${media.type}/${media.id}" OR selftext:"${media.type}/${media.malId}")`,
			restrict_sr: 'on',
			sort: 'new',
			t: 'all',
		});

		createElement('a', {
			attributes: {
				[attrName]: '',
				class: 'external-link alextras--reddit-link',
				target: '_blank',
				href: `https://www.reddit.com/r/anime/search?${query.toString()}`,
			},
			styles: {
				'--link-color': '#ff4500',
			},
			children: [
				createElement('div', {
					attributes: {
						[attrName]: '',
						class: 'icon-wrap',
					},
					styles: {
						padding: '0px',
						background: '#ff4500',
					},
					children: [
						createElement('img', {
							attributes: {
								[attrName]: '',
								class: 'icon',
								src: 'https://www.redditstatic.com/desktop2x/img/favicon/favicon-32x32.png',
							},
							styles: {
								'border-radius': '5px',
							},
						}),
					],
				}),
				createElement('div', {
					attributes: {
						[attrName]: '',
						class: 'name',
					},
					textContent: 'Reddit Discussions',
				}),
			],
			appendTo: isUI.mobile
				? $('.overview .external-links .external-links-wrap')!
				: $('.external-links .external-links-wrap')!,
		});
	},

	unload() {
		removeElements('.alextras--reddit-link, .alextras--external-links');
	},
});
