[Card List](https://genshin-impact.fandom.com/wiki/Genius_Invokation_TCG/Card_List)

```javascript
// crawl charactors (include unobtainable)
function func(table_index = 0) {
    let tables = document.querySelectorAll('table');
    let table = tables[table_index];
    let trs = table.querySelector('tbody').children;
    let data = [];
    for (let i = 0; i < trs.length; i++) {
        let tr = trs[i];
        let tds = tr.children;
        let obj = {};
        obj.image = tds[0].querySelector('img').src;
        obj.image = /^(.*)\/revision\/latest\/scale-to-width-down\/.*$/.exec(obj.image)[1];
        obj.url = tds[0].querySelector('a').href;
        obj.name = tds[1].innerText.trim();
        obj.hp = tds[2].innerText.trim();
        obj.element = tds[3].innerText.trim();
        obj.weapon = tds[4].innerText.trim();
        let faction = tds[5].innerText.split('\n');
        obj.faction = [];
        for (let j = 0; j < faction.length; j++) {
            obj.faction.push(faction[j].trim());
        }
        data.push(obj);
    }
    return data;
}

obtainable_charactors = func(0);
unobtainable_charactors = func(1);
console.log('obtainable:', obtainable_charactors.length);
console.log('unobtainable:', unobtainable_charactors.length);
console.log(obtainable_charactors);
console.log(unobtainable_charactors);
```

```javascript
// crawl equipments

function get_cost(td) {
    let costs = td.querySelectorAll('.tcg-cost');
    let res = [];
    for (let i = 0; i < costs.length; i++) {
        let cost = costs[i];
        let color = cost.title;
        let number = cost.innerText;
        obj = {
            color: color,
            number: number
        }
        res.push(obj);
    }
    return res;
}

function func(table_index = 2) {
    let tables = document.querySelectorAll('table');
    let table = tables[table_index];
    let trs = table.querySelector('tbody').children;
    let data = [];
    for (let i = 0; i < trs.length; i++) {
        let tr = trs[i];
        let tds = tr.children;
        let obj = {};
        obj.image = tds[0].querySelector('img').src;
        obj.image = /^(.*)\/revision\/latest\/scale-to-width-down\/.*$/.exec(obj.image)[1];
        obj.url = tds[0].querySelector('a').href;
        obj.name = tds[1].innerText.trim();
        let group = tds[2].innerText.split('\n');
        obj.group = [];
        for (let j = 0; j < group.length; j++) {
            obj.group.push(group[j].trim());
        }
        obj.costs = get_cost(tds[3]);
        obj.effect = tds[4].innerText.trim();
        data.push(obj);
    }
    return data;
}

equipments = func(2);
console.log('equipments:', equipments.length);
console.log(equipments);
```
    
```javascript
// crawl supports and event cards
function get_cost(td) {
    let costs = td.querySelectorAll('.tcg-cost');
    let res = [];
    for (let i = 0; i < costs.length; i++) {
        let cost = costs[i];
        let color = cost.title;
        let number = cost.innerText;
        obj = {
            color: color,
            number: number
        }
        res.push(obj);
    }
    return res;
}

function func(table_index = 3) {
    let tables = document.querySelectorAll('table');
    let table = tables[table_index];
    let trs = table.querySelector('tbody').children;
    let data = [];
    for (let i = 0; i < trs.length; i++) {
        let tr = trs[i];
        let tds = tr.children;
        let obj = {};
        obj.image = tds[0].querySelector('img').src;
        obj.image = /^(.*)\/revision\/latest\/scale-to-width-down\/.*$/.exec(obj.image)[1];
        obj.url = tds[0].querySelector('a').href;
        obj.name = tds[1].innerText.trim();
        if (table_index == 4) {
            obj.costs = get_cost(tds[2]);
            obj.usage = tds[3].innerText.trim();
            obj.effect = tds[4].innerText.trim();
            data.push(obj);
            continue;
        }
        let group = tds[2].innerText.split('\n');
        obj.group = [];
        if (!(group.length == 1 && group[0] == '')) {
            for (let j = 0; j < group.length; j++) {
                obj.group.push(group[j].trim());
            }
        }
        obj.costs = get_cost(tds[3]);
        if (table_index == 3) {
            obj.usage = tds[4].innerText.trim();
            obj.effect = tds[5].innerText.trim();
        }
        else{
            obj.effect = tds[4].innerText.trim();
        }
        data.push(obj);
    }
    return data;
}

o_supports = func(3);
u_supports = func(4);
events = func(5);
console.log('obtainable supports:', o_supports.length);
console.log('unobtainable supports:', u_supports.length);
console.log('events:', events.length);
console.log(o_supports);
console.log(u_supports);
console.log(events);
```

```javascript
// crawl summons
function func(table_index = 6) {
    let tables = document.querySelectorAll('table');
    let table = tables[table_index];
    let trs = table.querySelector('tbody').children;
    let data = [];
    for (let i = 0; i < trs.length; i++) {
        let tr = trs[i];
        let tds = tr.children;
        let obj = {};
        obj.image = tds[0].querySelector('img').src;
        obj.image = /^(.*)\/revision\/latest\/scale-to-width-down\/.*$/.exec(obj.image)[1];
        obj.url = tds[0].querySelector('a').href;
        obj.name = tds[1].innerText.trim();
        obj.usage = tds[2].innerText.trim();
        obj.effect = tds[3].innerText.trim();
        data.push(obj);
    }
    return data;
}

o_summons = func(6);
u_summons = func(7);
console.log('obtainable summons:', o_summons.length);
console.log('unobtainable summons:', u_summons.length);
console.log(o_summons);
console.log(u_summons);
```

```javascript
// crawl skills for one charactor page
function get_cost(td) {
    let costs = td.querySelectorAll('.tcg-cost');
    let res = [];
    for (let i = 0; i < costs.length; i++) {
        let cost = costs[i];
        let color = cost.title;
        let number = cost.innerText;
        obj = {
            color: color,
            number: number
        }
        res.push(obj);
    }
    return res;
}

function talent_table(table) {
    let trs = table.querySelector('tbody').children;
    let res = [];
    for (let i = 1; i < trs.length; i += 2) {
        let tr = trs[i];
        let effect_tr = trs[i + 1];
        let tds = tr.children;
        let obj = {};
        try{
            obj.image = tds[0].querySelector('img').src;
            if (obj.image.indexOf('data:image') == -1) {
                obj.image = /^(.*)\/revision\/latest\/scale-to-width-down\/.*$/.exec(obj.image)[1];
            }
            else{
                delete obj.image;
            }
        }
        catch {
            delete obj.image;
        }
        obj.name = tds[1].innerText.trim();
        obj.type = tds[2].innerText.trim();
        obj.cost = get_cost(tds[3]);
        obj.effect = effect_tr.innerText.trim();
        res.push(obj);
    }
    return res;
}

console.log(talent_table(document.querySelectorAll('.talent-table')[0]));
```

```javascript
// crawl skills for all charactors, based on above functions
function func(charactors) {
    let res = {}
    for (let i = 0; i < charactors.length; i++) {
        let charactor = charactors[i];
        let url = charactor.url;
        let name = charactor.name;
        console.log(name);
        let xhr = new XMLHttpRequest();
        xhr.open('GET', url, false);
        xhr.send();
        let html = xhr.responseText;
        try{
            let parser = new DOMParser();
            let doc = parser.parseFromString(html, 'text/html');
            console.log(doc, doc.querySelectorAll('body'))
            let skills = doc.querySelectorAll('.talent-table')[0];
            let skill_list = talent_table(skills);
            res[name] = skill_list;
        }
        catch {
            console.error(name + ' parse failed')
        }
    }
    return res;
}
```