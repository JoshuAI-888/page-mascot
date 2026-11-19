# Māia artwork

Māia 02, The Collaborator: olive/bronze kea feathers, amber eyes, compact graphite beak, short crest and a two-tone orange scarf. The identity reference in `assets/approved-reference.png` is preserved unmodified from the supplied storyboard. Generated poses were conditioned on that sheet. The prompts and original PNG sheets are retained here.

Five sheets supply the nine gaze directions, original nine reactions, scratch/smile/excited cycles and the additional expressions/behaviours. The 576 × 576 WebP variants in `src/maia/assets/` are the delivered small-widget artwork; each contains nine 192 × 192 cells. The full-size studio variants are 1,254 × 1,254. `compile-assets.py` compiles web formats from the original PNGs; it does not create new poses.

These are review candidates, not a production-approved rig. Feather shapes, scarf folds/text, proportions and beak details vary slightly between poses. Scratch and wing gestures use discrete frames. Down-right gaze remains too subtle. No sprite is mirrored. Retain these limitations when presenting the demo; integration approval is not character-art approval.

The upstream component code retains its MIT licence. Māia character references and Milford branding were supplied for this project; the upstream code licence does not grant rights to those names, logos or character assets. No additional artwork/brand licence is granted by this notice. The studio fonts retain their included OFL notices. The compact companion does not load the Milford logo, fonts or original reference.
