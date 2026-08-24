# Audio assets

Every file in this folder is committed to the repository, so only material that
may be redistributed as a file — Public Domain or CC0, with no attribution
requirement — belongs here.

## Reunion Scene

### `reunion/restaurant_ambience.ogg`

- **Title**: Restaurant ambience.ogg
- **Source**: Wikimedia Commons
- **Source page**: https://commons.wikimedia.org/wiki/File:Restaurant_ambience.ogg
- **Original file**: https://upload.wikimedia.org/wikipedia/commons/b/b5/Restaurant_ambience.ogg
- **Original origin**: pdsounds.org record #274 ("Restaurant Ambience", by *stephan*, recorded 2007-05-18)
- **License**: Public domain (pdsounds.org releases every upload into the public domain)
- **Attribution required**: no (`AttributionRequired: false` in the Commons metadata)
- **Format**: Ogg Vorbis, stereo, 76.25 s, 1.97 MB
- **Retrieved**: 2026-08-19
- **Purpose**: SIDE-B prologue reunion scene ambience (izakaya room tone)

Contents: crowd chatter in a mid-size restaurant, distant conversation and the
sound of people eating. No music, no foreground dialogue, nothing horror-adjacent
— it exists only to make the reunion feel like a room with people in it.

Used by [`src/audio/reunionAudio.js`](../../audio/reunionAudio.js), which loops it
at roughly 24% volume behind [`src/views/ReunionScene.vue`](../../views/ReunionScene.vue).
