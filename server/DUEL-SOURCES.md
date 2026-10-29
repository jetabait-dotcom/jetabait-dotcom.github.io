# 7 Wonders Duel — base-game data sources

Checked 29 October 2026 against these primary sources:

- Official Repos Production rulebook (English, 20 pages): https://cdn.svc.asmodee.net/production-rprod/storage/downloads/games/7wonders-duel/en/7du-rules-us-15990558193s5I6.pdf
- Official Asmodee shop photograph of all twelve Wonder cards: https://store.asmodee.com/cdn/shop/files/SEV07-prodimages-image5_2000_1500x.jpg?v=1690494981
- Official Repos Production product page: https://www.rprod.com/en/games/7-wonders-duel
- Official English press pack, reached through the product's press page: https://cdn.svc.asmodee.net/production-rprod/storage/downloads/games/7wonders-duel/press/7wd-press-en-1632402532kYctz.zip

## Verification

`duel-data.mjs` is a transcription of mechanical facts, with normalized English identifiers and no copied artwork. It contains 23 Age I buildings, 23 Age II buildings, 20 Age III buildings, seven Guilds, twelve Wonders, ten Progress tokens, and three layouts of twenty slots.

- Rulebook pp18–19: all building names, construction costs, resource production, military strength, scientific symbols, victory points, coin effects, trade discounts, and chain predecessors visually compared.
- Rulebook p20: all three face-up/face-down patterns and covering relationships visually compared. Initially available cards are 6 / 2 / 2 respectively.
- Rulebook pp14–17: Progress and Wonder effects, including resource discounts, replay rules, discarded-card retrieval and boxed Progress selection.
- Wonder costs: all twelve visually compared with the official Asmodee photograph. Great Library costs three wood, one glass and one papyrus; Mausoleum costs two clay, two glass and one papyrus.

The dataset covers the base game only. It excludes Pantheon, Agora and promotional Wonders. Guilds are tagged `age:4` in the normalized data to keep their separate setup pool; they are shuffled into Age III by the engine. `covers` lists indices of lower-row cards that block a slot, rather than the cards covered underneath it.

## Important engine details checked

Construction production is reusable. Opponent brown/grey production alone determines resource purchase surcharges. Architecture/Masonry each waive any two applicable resource units; Economy receives resource purchases only. Military pillage occurs at distances three and six and capital victory at nine. Six distinct science symbols win immediately. The seventh built Wonder prevents the eighth. An extra turn is lost when an Age is exhausted. Civilian ties compare blue-card points, then remain tied.

Special-effect choices must resolve before revealing newly available cards and before normal end-of-Age scoring. Military/scientific supremacy ends immediately. Hidden future decks, the second draft pool and unused boxed Progress are excluded from player views; Great Library choices are visible only to their selecting player.
