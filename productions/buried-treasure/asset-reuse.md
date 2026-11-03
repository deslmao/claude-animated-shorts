# Asset reuse: "The truth about buried pirate treasure"

The search came first (`npm run assets -- search ...`, saved in `asset-search.md`). Only what it showed missing was created.

## Reused from the pirates theme (created for "Pirates ran surprisingly democratic ships")
| Kind | Assets |
|---|---|
| set | `shipDeck` (shots 2 and 6) |
| characters | `captain`, `quartermaster`, `miloPirate`, `junoPirate`, `gusPirate` |
| crowd | `extras:pirate` (shot 2 on deck, shot 4 in port) |
| props | `treasureChest` (closed and open) |
| items | `coinBag`, `scroll` |
| engine features | tricorn, bandana, eyepatch, stripes, frock coat |

## Reused from the base library
| Kind | Assets |
|---|---|
| sets | `oldtown` (the port town, and London at night), `nature` (Gardiners Island, New York: temperate, so not the palm beach), `home`, `classroom` |
| characters | `gus` (the authorities and the historian), `junoOut`, `milo` (the 1883 / modern scenes) |
| items | `map`, `book`, `bottle`, `coin`, `magnifier` |
| sound | `adventure`, `mystery` and `curious` music; `amb_sea`, `amb_square`, `amb_square_night`, `amb_nature_day`, `amb_room` |

## Created for this Short (missing from the library)
| Kind | Asset | Why |
|---|---|---|
| set | `island` (desert-island beach: sand, palms, rocks, shells, rowboat, shallows) | the legend's "desert island"; no beach existed |
| props | `palmTree`, `digSpot` (variants `x`, `dug`), `rowboat` | island dressing; nothing to dig existed |
| item | `shovel` | burying and digging up treasure; no digging tool existed |
| sound mapping | sand footsteps and `amb_sea` for the island | the island set needed its own beds |

`kidd` (Captain William Kidd) was designed together with the pirates theme, in the same commit as the other pirate
characters, but only this Short uses him.
