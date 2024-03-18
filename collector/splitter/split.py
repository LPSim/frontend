# %%
import os
import re
import shutil
from tqdm import tqdm
from PIL import Image

folder_name = 'Extract'  # parsed folder, inner should contain Sprite ... etc.
save_name = '4.5'  # save to folder
exist_folder = '4.4'  # exist folder to compare with
files = os.listdir(os.path.join(folder_name, 'Sprite'))
skill_regex = r'^(Skill.*|^MonsterSkill.*)_HD.png'
status_regex = r'^UI_Gcg_((Buff|Debuff)_.*).png'
cardface_regex = r'^UI_Gcg_CardFace_((Assist_[^_]*_|Char_[^_]*_|Event_[^_]*_|Modify_[^_]*_|Summon).*).png$'
small_card_regex = r'^UI_Gcg_History_(.*)_S.png$'
avatar_regex = r'^UI_Gcg_Char_.*Icon_(.*).png'
tag_regex = r'^UI_Gcg_Tag_(.*).png'
mark_regex = r'^UI_TeyvatCard_((LifeBg|Preview|Revive|Select|Death).*).png'
dice_regex = r'UI_Gcg_DiceS_(.*).png'

# %%
keys = [x for x in globals().keys() if re.match(r'^.*_regex$', x)]
# mapping data is used to map file names that is wierd to new names
mapping_data = {
    'avatar_regex': {
        'ALbedo.png': 'Albedo.png',
        'Amber.png': 'Ambor.png',
        'BruteAxeElec.png': 'BruteEleAxe.png',
        'BruteAxeFire.png': 'BruteAxe.png',
        'EffigyElectric.png': 'Effigyelectric.png',
        'FatuusMageIce.png': 'FatuusMageice.png',
        'HiliRangeElec.png': 'HiliElectric.png',
        'InvokerDeaconFire.png': 'DeaconFire.png',
        'KairagiElec.png': 'KairagiEle.png',
        'SamuraiRonin01.png': 'RoninWater.png',
        'SamuraiRonin02.png': 'RoninFire.png',
        'SamuraiRonin03.png': 'RoninEle.png',
        'SkirmisherIce.png': 'Skirnisherfatice.png',
        'SkirmisherWater.png': 'Skirnisherfatwater.png',
        'SkirmisherWind.png': 'Skirnisherstrongwind.png',
        'SlimeElec.png': 'SlimeEle.png',
        'UnuAnudattaGrass.png': 'UnDeltaGrass.png',
        'EremiteOracle.png': 'Muscleman.png',
        'GargoyleGround.png': 'Formathr.png',
        'EremiteGlaive.png': 'Eremiteice.png',
        'EremiteKatar.png': 'Eremiterock.png',
        'EremitePushDagger.png': 'Eremitewater.png',
    },
    'status_regex': {
        'Debuff_Common_Element_Elec.png': 'Debuff_Element_Elec.png',
        'Debuff_Common_Element_Fire.png': 'Debuff_Element_Fire.png',
        'Debuff_Common_Element_Grass.png': 'Debuff_Element_Grass.png',
        'Debuff_Common_Element_Ice.png': 'Debuff_Element_Ice.png',
        'Debuff_Common_Element_Water.png': 'Debuff_Element_Water.png',
        'Debuff_Common_Element_Wind.png': 'Debuff_Element_Wind.png',
        'Debuff_Common_Element_Rock.png': 'Debuff_Element_Rock.png',
        'Debuff_Common_Element_Physics.png': 'Debuff_Element_Physics.png',
    }
}
copy_data = {
    'avatar_regex': {
        'Tartaglia.png': 'Tartaglia02.png',
        'Wanderer.png': 'Wanderer02.png',
        'Cyno.png': 'Cyno02.png',
        'Xiao.png': 'Xiao02.png',
        'FatuusMageice.png': 'MageIce.png',
    }
}


# %%
keys = [
    'avatar_regex',
    'cardface_regex',
    'dice_regex',
    # 'mark_regex',
    'skill_regex',
    'small_card_regex',
    'status_regex',
    'tag_regex'
]
sfolder_name = os.path.join(folder_name, 'Sprite')
for key in keys:
    fname = os.path.join(save_name, key.replace('_regex', ''))
    regex = globals()[key]
    os.makedirs(fname, exist_ok=True)
    counter = 0
    md = mapping_data[key] if key in mapping_data else {}
    cd = copy_data[key] if key in copy_data else {}
    for file in files:
        m = re.match(regex, file)
        if m:
            newname = m.group(1)
            if key == 'status_regex':
                # if status start with Buff, remove it.
                if newname.startswith('Buff_'):
                    newname = newname.replace('Buff_', '')
            if key == 'cardface_regex':
                # if is cardface, need more check

                newname = re.sub(r'#\d+', '', newname)
                newname = re.sub(r'_Layer\d+', '', newname)
                newname += '.png'
                # if has golden, skip
                if 'Golden' in file:
                    gfname = fname.replace('cardface', 'gold_cardface')
                    os.makedirs(gfname, exist_ok=True)
                    newname = newname.replace('_Golden', '')
                    shutil.copy(
                        os.path.join(sfolder_name, file),
                        os.path.join(gfname, newname)
                    )
                    continue
                # if name contains #number, remove it from name
                if os.path.exists(os.path.join(fname, newname)):
                    # exists, check both image size
                    this_size = Image.open(os.path.join(sfolder_name, file)).size
                    target_size = Image.open(os.path.join(fname, newname)).size
                    if this_size[0] < target_size[0]:
                        # this is smaller, skip
                        continue
            else:
                newname += '.png'
            # newname = file
            # copy file to folder
            if newname in md:
                newname = md[newname]
            shutil.copy(os.path.join(sfolder_name, file), os.path.join(fname, newname))
            if newname in cd:
                shutil.copy(os.path.join(sfolder_name, file), os.path.join(fname, cd[newname]))
            counter += 1
    print(key, counter)

# %%
# check img size of cardface
for file in os.listdir(os.path.join(save_name, 'cardface')):
    size = Image.open(os.path.join(save_name, 'cardface', file)).size
    assert size[0] == 420, (file, size)
# check file prefix
# prefix = set()
# for file in os.listdir('cardface'):
#     prefix.add('_'.join(file.split('_')[:-1]))
# for p in prefix:
#     print(p)

# %%
# copy cardback to cardface
back_name = os.path.join(folder_name, 'Sprite/UI_Gcg_History_CardBack_Championship_02.png')
shutil.copy(back_name, os.path.join(save_name, 'cardface', 'Championship_02.png'))
shutil.copy(os.path.join(folder_name, 'Sprite/UI_Gcg_CardBack_00.png'),
            os.path.join(save_name, 'gold_cardface', 'UI_Gcg_CardBack_00.png'))

# %%
# move Texture2D files to mark
# This is not needed to run every update!!!
# files = os.listdir(os.path.join(folder_name, 'Texture2D'))
# for file in files:
#     newname = file[:-4]
#     newname = newname.replace('_Bg', '')
#     newname = newname.split('_')[-1]
#     shutil.copy(
#         os.path.join(folder_name, 'Texture2D', file),
#         os.path.join(save_name, 'mark', newname + '.png')
#     )

# %%
# check small_card all exist in cardface
small_card = set(os.listdir(os.path.join(save_name, 'small_card')))
cardface = set(os.listdir(os.path.join(save_name, 'cardface')))
assert small_card.issubset(cardface)

# %%
# compare with exist
folders = os.listdir(save_name)
for folder in folders:
    print(f'processing {folder}')
    new_file_lists = set(os.listdir(os.path.join(save_name, folder)))
    old_file_lists = set(os.listdir(os.path.join(exist_folder, folder)))
    if 'custom' in old_file_lists and 'custom' not in new_file_lists:
        # copy custom to new
        shutil.copytree(
            os.path.join(exist_folder, folder, 'custom'),
            os.path.join(save_name, folder, 'custom')
        )
        new_file_lists.add('custom')
    extra_files = new_file_lists - old_file_lists
    missing_files = old_file_lists - new_file_lists
    extra_files = list(extra_files)
    extra_files.sort()
    missing_files = list(missing_files)
    missing_files.sort()
    if len(extra_files) > 0:
        print('New files:\n  ' + '\n  '.join(extra_files))
    if len(missing_files) > 0:
        print('Missing files:\n  ' + '\n  '.join(missing_files))

# %%
# check avatar name match with cardface
ignore = {
    'Zengyihuang.png',
    'Zengyimang.png',
}
avatar_list = os.listdir(os.path.join(save_name, 'avatar'))
cardface_list = os.listdir(os.path.join(save_name, 'cardface'))
cardface_list = [
    '_'.join(x.split('_')[2:])
    for x in cardface_list if x.startswith('Char_')
]
avatar_set = set(avatar_list)
if 'custom' in avatar_list:
    avatar_set.remove('custom')
cardface_set = set(cardface_list)
extra = avatar_set - cardface_set
missing = cardface_set - avatar_set - ignore
extra = list(extra)
missing = list(missing)
extra.sort()
missing.sort()
if len(extra) > 0:
    print('Extra avatar:\n  ' + '\n  '.join(extra))
if len(missing) > 0:
    print('Missing avatar:\n  ' + '\n  '.join(missing))

# %% copy mark from old
mark_folder = os.path.join(save_name, 'mark')
old_mark_folder = os.path.join(exist_folder, 'mark')
shutil.copytree(old_mark_folder, mark_folder)
