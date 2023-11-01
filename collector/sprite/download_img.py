import requests


data = [
    [
        "https://api.ambr.top/assets/UI/gcg/UI_Gcg_CardFace_Char_Avatar_Nilou.png",
        "Char_Avatar_Nilou.png"
    ],
    [
        "https://api.ambr.top/assets/UI/gcg/UI_Gcg_CardFace_Char_Avatar_Dori.png",
        "Char_Avatar_Dori.png"
    ],
    [
        "https://api.ambr.top/assets/UI/gcg/UI_Gcg_CardFace_Char_Avatar_Baizhuer.png",
        "Char_Avatar_Baizhuer.png"
    ],
    [
        "https://api.ambr.top/assets/UI/gcg/UI_Gcg_CardFace_Modify_Constellation_Nilou.png",
        "Modify_Constellation_Nilou.png"
    ],
    [
        "https://api.ambr.top/assets/UI/gcg/UI_Gcg_CardFace_Modify_Constellation_Dori.png",
        "Modify_Constellation_Dori.png"
    ],
    [
        "https://api.ambr.top/assets/UI/gcg/UI_Gcg_CardFace_Modify_Talent_Baizhuer.png",
        "Modify_Talent_Baizhuer.png"
    ],
    [
        "https://api.ambr.top/assets/UI/gcg/UI_Gcg_CardFace_Modify_Artifact_Hairantaozhuang.png",
        "Modify_Artifact_Hairantaozhuang.png"
    ],
    [
        "https://api.ambr.top/assets/UI/gcg/UI_Gcg_CardFace_Modify_Artifact_Chiwangdanjian.png",
        "Modify_Artifact_Chiwangdanjian.png"
    ],
    [
        "https://api.ambr.top/assets/UI/gcg/UI_Gcg_CardFace_Assist_Location_Fenglong.png",
        "Assist_Location_Fenglong.png"
    ],
    [
        "https://api.ambr.top/assets/UI/gcg/UI_Gcg_CardFace_Event_Event_Guobahelp.png",
        "Event_Event_Guobahelp.png"
    ],
    [
        "https://api.ambr.top/assets/UI/gcg/UI_Gcg_CardFace_Event_Event_Wangfu.png",
        "Event_Event_Wangfu.png"
    ]
]

target_folder = 'download'

for url, fname in data:
    print(fname)
    r = requests.get(url)
    with open(f'{target_folder}/{fname}', 'wb') as f:
        f.write(r.content)
