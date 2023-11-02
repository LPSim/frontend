/*
used in https://ambr.top/chs/gcg, to find image path of new images
*/



available = `
... fill exist cardface filenames
`
available = available.split('\n').filter(x => x != '')
imgs = document.querySelectorAll('img')
urls = []
for (let i of imgs) {
    src = i.src
    if (!src.includes('CardFace')) continue
    src_split = src.split('/')
    filename = src_split[src_split.length - 1]
    filename = filename.split('.sm.png')[0]
    filename = filename.split('UI_Gcg_CardFace_')[1]
    filename = filename + '.png'
    src = src.split('.sm.png')[0] + '.png'
    if (available.includes(filename)) continue
    urls.push([src, filename])
}
console.log(urls)


/*
used in https://ambr.top/en/gcg, to find card name to id
*/
links = document.querySelectorAll('a')
alinks = []
for (i = 0; i < links.length; i++) {
    alinks.push(links[i])
}
links = alinks.filter(o => o.href.includes('/gcg/'))
results = {}
for (i = 0; i < links.length; i++) {
    link = links[i]
    link_href = link.href.split('/')
    id_num = link_href[link_href.length - 2]
    bottom = link.querySelector('.absolute.bottom-0')
    results[bottom.innerText] = Number(id_num)
}
console.log(results)

/*
used to collect skill descs. combine jsonl with ipynb
*/
VERSION = '4.2'
links = document.querySelectorAll('a')
divs = document.querySelectorAll('div[name=" Skill"]');
res = {}
cname = document.querySelector('h1').innerText
if (document.URL.includes('/en/')) lang = 'en-US'
else if (document.URL.includes('/chs/')) lang = 'zh-CN'
else lang = undefined
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
console.log(JSON.stringify(res))
