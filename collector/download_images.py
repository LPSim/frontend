import json
import os
import requests
import sys


def download_one_png(url, path):
    print(f'downloading {path}')
    if os.path.exists(path):
        print('already exists: ', path)
        return
    r = requests.get(url, stream=True)
    if r.status_code == 200:
        with open(path, 'wb') as f:
            f.write(r.content)
    else:
        print('error: ', url)


def download_one_json(filepath):
    print(f'downloading {filepath}')
    with open(filepath, 'r') as f:
        data = json.load(f)
    file_name = '.'.join(os.path.basename(filepath).split('.')[:-1])
    dirpath = os.path.join(os.path.dirname(filepath), file_name)
    os.makedirs(dirpath, exist_ok=True)
    if not isinstance(data, list):
        print('not list: ', filepath)
        return
    for i in data:
        url = i['image']
        path = os.path.join(dirpath, i['name'] + '.png')
        download_one_png(url, path)


def download_all_json(dirpath):
    print(f'downloading all json files in {dirpath}')
    for filename in os.listdir(dirpath):
        if filename.endswith('.json'):
            filepath = os.path.join(dirpath, filename)
            download_one_json(filepath)


if __name__ == '__main__':
    download_all_json(sys.argv[1])
