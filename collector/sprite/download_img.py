import requests
import json


data = json.load(open('new_cards.json'))

target_folder = 'download'

for oneline in data:
    url = oneline[0]
    fname = oneline[1]
    print(fname)
    r = requests.get(url)
    with open(f'{target_folder}/{fname}', 'wb') as f:
        f.write(r.content)
