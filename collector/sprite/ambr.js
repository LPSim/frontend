/*
used in https://ambr.top/en/changelog?v=xx, to find image path of new images,
and their ids, and href target page URL.

Save the result manually into new_cards.json.
*/
imgs = document.querySelectorAll('img')
links = document.querySelectorAll('a')
alinks = []
for (i = 0; i < links.length; i++) {
    alinks.push(links[i])
}
links = alinks.filter(o => o.href.includes('/gcg/'))
urls = []
for (i = 0; i < links.length; i++) {
    link = links[i]
    link_href = link.href.split('/')
    id_num = link_href[link_href.length - 2]
    bottom = link.querySelector('.absolute.bottom-0')

    img = link.querySelector('img')
    src = img.src
    if (!src.includes('CardFace')) continue
    src_split = src.split('/')
    filename = src_split[src_split.length - 1]
    filename = filename.split('.sm.png')[0]
    filename = filename.split('UI_Gcg_CardFace_')[1]
    filename = filename + '.png'
    src = src.split('.sm.png')[0] + '.png'
    urls.push([src, filename, bottom.innerText, id_num, link.href])
}
console.log(urls)


/*
used to collect skill descs. combine jsonl with ipynb
*/
function collect_skill_desc() {
VERSION = '4.2'
links = document.querySelectorAll('a')
divs = document.querySelectorAll('div[name=" Skill"]');
res = {}
id = parseInt(document.URL.split('/')[5])
cname = document.querySelector('h1').innerText
if (document.URL.includes('/en/')) lang = 'en-US'
else if (document.URL.includes('/chs/')) lang = 'zh-CN'
else lang = undefined
if (id < 100000) {
    // is character
    for (i = 0; i < divs.length; i++) {
        div = divs[i]
        first_c = div.children[0]
        second_c = div.children[1]
        first_c = first_c.children[1]
        name = first_c.children[0].innerText
        type = first_c.children[1].innerText
        desc = second_c.children[0].children[0].innerText
        console.log(name, type, desc)
        let key = 'SKILL_' + cname + '_' + type.toUpperCase() + '/' + name
        res[key] = {
            names: {
                [lang]: name
            },
            descs: {
                [VERSION]: {
                    [lang]: desc
                }
            }
        }
    }
    return JSON.stringify(res)
}
else {
    // not character
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
        character_name = title_div.innerText.split(':')[0].trim()
        key = 'TALENT_' + character_name
    }
    res[key + '_' + cname] = {
        names: {
            [lang]: cname
        },
        descs: {
            [VERSION]: {
                [lang]: desc_div.innerText
            }
        }
    }
    return JSON.stringify(res)
}
}
console.log(collect_skill_desc())
