import time
from selenium import webdriver
from selenium.webdriver.common.by import By
import json
import sys


VERSION = '4.3'


js_code = '''
function collect_skill_desc() {
VERSION = 'X.X'
links = document.querySelectorAll('a')
divs = document.querySelectorAll('div[name=" Skill"]');
res = []
id = parseInt(document.URL.split('/')[5])
cname = document.querySelector('h1').innerText
if (document.URL.includes('/en/')) lang = 'en-US'
else if (document.URL.includes('/chs/')) lang = 'zh-CN'
else lang = undefined
if (id < 100000) {
    // is charactor
    for (i = 0; i < divs.length; i++) {
        div = divs[i]
        first_c = div.children[0]
        second_c = div.children[1]
        first_c = first_c.children[1]
        name = first_c.children[0].innerText
        type = (first_c.children[1] && first_c.children[1].innerText) || 'Unknown'
        desc = second_c.children[0].children[0].innerText
        // console.log(name, type, desc)
        let key = 'SKILL_' + cname + '_' + type.toUpperCase() + '/' + name
        res.push([key, {
            names: {
                [lang]: name
            },
            descs: {
                [VERSION]: {
                    [lang]: desc
                }
            }
        }])
        let other_descs = second_c.children[0].children[1]
        if (other_descs != undefined) {
            // contains other descs
            for (j = 0; j < other_descs.children.length; j++) {
                let other_desc = other_descs.children[j].children[0]
                let oname = other_desc.children[0].innerText
                let odesc = other_desc.innerText.replace(oname, '').trim()
                oname = oname.replace('•', '').trim()
                let otype = 'XXXXXXXX'
                if (
                    desc.toLowerCase().includes('summon')
                    || desc.toLowerCase().includes('召唤')
                ) otype = 'SUMMON';
                else if (
                    desc.toLowerCase().includes('create')
                    || desc.toLowerCase().includes('生成')
                ) otype = '_STATUS'; // not know what status, but should be status
                res.push([otype + '/' + oname, {
                    names: {
                        [lang]: oname
                    },
                    descs: {
                        [VERSION]: {
                            [lang]: odesc
                        }
                    }
                }])
                console.log(otype, oname, odesc)
            }
        }
    }
    return JSON.stringify(res)
}
else {
    // not charactor
    let key = ''
    if (id < 300000) key = 'TALENT'
    else if (id >= 311000 && id < 312000) key = 'WEAPON'
    else if (id >= 312000 && id < 313000) key = 'ARTIFACT'
    else if (id >= 321000 && id < 330000) key = 'SUPPORT'
    else if (id >= 330000 && id < 331000) key = 'ARCANE'
    else if (id >= 331000) key = 'CARD'
    skill_div = document.querySelector('div[name=" Skill"]')
    desc_div = skill_div.children[1].children[0].children[0]
    if (key == 'TALENT') {
        card_info_div = document.querySelector('div[name="Card Info"]')
        title_div = card_info_div.children[2].children[0].children[0]
        charactor_name = title_div.innerText.split(':')[0].trim()
        key = 'TALENT_' + charactor_name
    }
    res.push([key + '/' + cname, {
        names: {
            [lang]: cname
        },
        descs: {
            [VERSION]: {
                [lang]: desc_div.innerText
            }
        }
    }])
    return JSON.stringify(res)
}
}
console.log(collect_skill_desc())
return collect_skill_desc()
'''


def wait_until_loaded(driver, selector):
    while True:
        try:
            driver.find_element(By.CSS_SELECTOR, selector)
            break
        except Exception:
            time.sleep(0.5)


def get_skill_desc(driver, link, version):
    print(link)
    driver.get(link)
    wait_until_loaded(driver, 'div[name=" Skill"]')
    print('open done')
    try:
        res = driver.execute_script(js_code.replace('X.X', version))
    except Exception:
        print(f'error in link {link}')
        return None
    return res


if __name__ == '__main__':
    if len(sys.argv) > 1:
        VERSION = sys.argv[1]
    driver = webdriver.Chrome()
    image_urls = json.load(open('new_cards.json'))
    res = []
    for oneline in image_urls:
        en_url = oneline[-1]
        cn_url = en_url.replace('/en/', '/chs/')
        r = get_skill_desc(driver, en_url, VERSION)
        if r is not None:
            res.append(r)
        r = get_skill_desc(driver, cn_url, VERSION)
        if r is not None:
            res.append(r)
    print(res)
    json.dump(res, open('new_desc.json', 'w', encoding='utf-8'),
              ensure_ascii=False, indent=2)
    input('press any key to quit')
    driver.quit()
