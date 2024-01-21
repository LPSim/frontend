import os
import random
from typing import List
from PIL import Image


folder = r'C:\Users\zyr17\Downloads\v4.3'
sample_folder = r'C:\Users\zyr17\Downloads\images-v43\cardface'
save_folder = r'C:\Users\zyr17\Downloads\images-v43\gold_cardface'
files = os.listdir(folder)
files = [x for x in files if x.startswith('UI_Gcg_CardFace_') and 'Golden' in x]
sample_files = os.listdir(sample_folder)
sample_files = [x for x in sample_files if x.endswith('.png')]


def get_golds():
    selected = {}
    for name in files:
        fullpath = os.path.join(folder, name)
        part = name[:-4].split('#')[0]
        assert part not in selected
        selected[part] = fullpath

    # print(selected, len(selected))

    name_map = {}

    for s in sample_files:
        part = s[:-4]
        init = [x for x in selected.keys() if part + '_Gold' in x]
        if len(init) == 0:
            continue
        target = init[0]
        name_map[selected[target]] = s

    # print(name_map)

    for src, dst in name_map.items():
        # copy to dest folder
        os.system(f'copy {src} {os.path.join(save_folder, dst)}')


def combine(
    img_folder: str,
    char_names: List[str],
    card_names: List[str],
    height: int = 233
):
    char_images = [Image.open(f'{img_folder}/{name}') for name in char_names]
    card_images = [Image.open(f'{img_folder}/{name}') for name in card_names]

    char_images = [img.resize((int(img.width * height / img.height), height)) for img in char_images]
    card_images = [img.resize((int(img.width * height / img.height), height)) for img in card_images]

    max_width = max(img.width for img in char_images + card_images) * 6
    total_height = ((len(char_images + card_images) - 1) // 6 + 1) * height

    new_img = Image.new('RGB', (max_width, total_height), (255, 255, 255))

    x_offset = 0
    y_offset = 0
    for i, img in enumerate(char_images + card_images):
        background = Image.new('RGBA', img.size, (255, 255, 255))
        img_with_bg = Image.alpha_composite(background, img.convert('RGBA'))
        new_img.paste(img_with_bg, (x_offset, y_offset))
        x_offset += img.width
        if (i + 1) % 6 == 0:
            x_offset = 0
            y_offset += height

    return new_img


if __name__ == '__main__':
    save_files = os.listdir(save_folder)
    random.shuffle(save_files)
    test_charactor_card = save_files[:3]
    random.shuffle(save_files)
    test_card = save_files[:30]
    result = combine(save_folder, test_charactor_card, test_card)
    result.show()
