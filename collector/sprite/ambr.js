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
