"""Compile existing sprite artwork to web delivery sizes; preserve originals."""
from pathlib import Path
from PIL import Image
import json
import shutil
root=Path(__file__).parent/'assets'
records=[]
for name in ['directions','reactions','actions','expressions','behaviours']:
    source=root/(name+'.png')
    im=Image.open(source).convert('RGBA')
    assert im.width==im.height and im.width%3==0
    for suffix, size, quality in [('',im.width,90),('-small',576,86)]:
        target=root/(name+suffix+'.webp')
        compiled=im if size==im.width else im.resize((size,size),Image.Resampling.LANCZOS)
        compiled.save(target,format='WEBP',quality=quality,method=6)
        if suffix == '-small':
            delivered=root.parent.parent/'src'/'maia'/'assets'/(name+'.webp')
            delivered.parent.mkdir(parents=True,exist_ok=True)
            shutil.copyfile(target,delivered)
        records.append({'file':target.name,'bytes':target.stat().st_size,'width':size,'decodedRGBABytes':size*size*4})
print(json.dumps(records,indent=2))
(root/'delivery-sizes.json').write_text(json.dumps(records,indent=2))
