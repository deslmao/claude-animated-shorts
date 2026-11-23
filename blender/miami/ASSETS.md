# Miami look: Poly Haven assets (CC0)

All of these come from [Poly Haven](https://polyhaven.com) under **CC0** (public domain): free for any use, including
monetised videos, with no attribution required. Our buildings, palms, cars, signs and cast stay our own designs.

**Fetch them** (into `blender/miami/assets/`, which is git-ignored, about 110 MB):
```bash
python3 blender/miami/assets_fetch.py
```
`miami.py` uses them automatically when that folder exists. Set `MIAMI_PH=0` for the procedural-only look.
Blender's glTF importer needs numpy (`apt-get install -y python3-numpy` on Ubuntu's Blender).

| Role | Poly Haven asset | Where it's used |
|---|---|---|
| asphalt | `asphalt_02` | the street and motel lot |
| walk | `concrete_pavers_02` | the pavements |
| sand / wet sand | `coast_sand_01`, `damp_beach_sand` | the beach and the waterline |
| stucco | `white_stucco` | the motel and office walls (tinted to our pastels) |
| bark | `palm_tree_bark` | our palm trunks |
| planks | `weathered_planks` | the pier and the dune fence |
| lawn | `leafy_grass` | leafy surfaces |
| sky | `kloofendal_48d_partly_cloudy_puresky` (`MIAMI_HDRI=sky_warm`: `qwantani_late_afternoon_puresky`) | the sky and ambient light; it's turned so its sun matches our sun lamp |
| shrubs | `shrub_02`, `pachira_aquatica_01` | hedges and bushes |
| planters | `calathea_orbifolia_01`, `potted_plant_02` | the street planters and the motel doors |
| grass clumps | `grass_bermuda_01` | the verge and the dunes |
| shells | `lambis_shell` | the beach |

**Tuning knobs:** `MIAMI_SKY` (sky strength, default 0.9) and `MIAMI_SKYSAT` (sky saturation, default 1.45).
