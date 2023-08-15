We do not save images in this repo, you can download by scripts 
in this folder. Scripts or links may not work when wiki page changes.
Last tested date: 2023.8.13.

# Generage jsons
Refer to [fandom.md](fandom.md), run scripts in console, and copy
the output into a json file. 

Images of skills is unavailable currently.

Note `icon.json` is manually generated, if links of it expires, it should be
updated manually.

# Download images
run `download_images.py`, it will automatically create folders for each json
and download images into folder. If an image exists, it will skip.

# Generate Mobs
use `generate_mob.ipynb` to generate mob images, and they will be saved in 
`custom/charactors` folder. If do not want to use mobs, just skip this step.

# Collect all images
use the following bash script to collect all images into 
`../static/images` folder.
<!-- ```bash
mkdir ../static/images; find . -name '*.png' -exec bash -c 'for file do j=`basename "$file"`; cp "$file" ../static/images/"$j"; done;' bash {} +
``` -->
```bash
mkdir ../static/images
cp ./*/*.png ../static/images
```
Currently all images are put together. Only four images are duplicated 
(abyssal summons and unobtanalbe charactors), and their images are the same.
If images with same name are different, should change it.
