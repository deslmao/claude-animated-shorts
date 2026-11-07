# Video 05: hallway floor fix (waiting for the owner's review)

The before and after stills are 1080×1920, of the same three views and frames: the opening wide shot, a low view down
the hallway, and the final A / B composition. The comparisons are `compare-before-top-after-bottom.jpg` (whole frames)
and `compare-floor-1to1-before-top-after-bottom.png` (floor crops at 1:1).

## The causes
All four are in the new hallway set, `themes/extradoor`.
1. **The runner rug was stretched.** I used the library's `rug` (`rugHD`): one non-repeating image, a border and a
   central medallion, made for a room rug. Stretched over a 0.7 × 7.4 m runner, it smeared about 10 times along the
   hall into a giant diamond and long diagonal red bands.
2. **The floor shadows were striped and patchy.** The set dressing was built in the shadow-casting batch: the seven
   doors and their frames, the pictures, the clock, the banister and spindles, and the steps. The lighting's key light
   threw their shadows across most of the floor and the stairs. That left a purple-grey floor with random orange pools
   of light and zebra stripes from the spindles. The room builder (`sets/room.ts`) builds its trim and door without
   cast shadows, which is why the existing sets don't show this.
3. **The floor pieces didn't line up.** The floor is three quads: the corridor, the walkway beside the stairwell and
   the top landing. Each started its texture coordinates at 0, so the boards jumped at every join.
4. **The boards ran across the hallway** instead of along it.

These were not the causes: z-fighting (the z-fight test finds no coplanar surfaces), the geometry of the joins, and
the lighting level.

## The fix
Local to the new theme. The room builder and protected sets are unchanged, and the lighting is not darkened.
1. **A runner texture that tiles.** The runner has its own repeating texture (wine ground, cream and teal border bands
   along both long edges, a diamond medallion), repeating every 0.9 m along its length.
2. **The set dressing casts no shadows,** as the room builder builds its own. Story props (the old door, the photo)
   and characters keep their shadows.
3. **One world-aligned floor mapping** for all three floor pieces: u = z / 2 m and v = x / 2 m, so the boards run
   unbroken along the hallway across the joins.

## Checks
- **Z-fighting:** the hallway is clean (0 material pairs).
- **Floor map:** unchanged.
- **Library:** all protected assets intact.
