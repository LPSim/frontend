// create forbid word trie
class TrieNode {
    constructor() {
        this.children = {};
        this.isEndOfWord = false;
    }
}

class Trie {
    constructor() {
        this.root = new TrieNode();
    }

    insert(word) {
        let node = this.root;
        for (let char of word) {
            if (!(char in node.children)) {
                node.children[char] = new TrieNode();
            }
            node = node.children[char];
        }
        node.isEndOfWord = true;
    }

    match(word) {
        // test if word start with any word in trie
        let node = this.root;
        for (let char of word) {
            if (!(char in node.children)) {
                return false;
            }
            node = node.children[char];
            if (node.isEndOfWord) {
                return true;
            }
        }
        return false;
    }

    search(word) {
        // test if word contains any word in trie
        for (let i = 0; i < word.length; i++) {
            if (this.match(word.slice(i))) {
                return true;
            }
        }
        return false;
    }
}

let nameMap = [];
let forbidList = [];
let nameToId = {};
let forbiddenTrie = new Trie();


function init(data, nti) {
    nameMap = data.name_map;
    forbidList = data.forbid_list;
    nameToId = {};
    for (let key in nti) {
        let id = nti[key];
        let name = key.split('/')[1];
        if (id < 100000) name = 'charactor:' + name;
        nameToId[name] = id;
    }
    // console.log(data, nti, nameMap, forbidList, nameToId)
    for (let i in forbidList)
        forbiddenTrie.insert(forbidList[i]);
}


// mark charactors, if in the list, it is a charactor card.
let charactorsIdx = Array.from({length: 60}, (_, i) => i);

function deckCodeToDeckStr(deckCode, version = null, sort = true) {
    // Convert the base64 deck code to deck str. If version is set, add default_version.
    let binary = Buffer.from(deckCode, 'base64');
    let bb = [];
    for (let b of binary) {
        bb.push((256 + b - binary[binary.length - 1]) % 256);
    }
    bb = bb.slice(0, -1);
    binary = bb.filter((_, i) => i % 2 === 0).concat(bb.filter((_, i) => i % 2 !== 0));
    let res = '';
    for (let i of binary) {
        res += i.toString(2).padStart(8, '0') + ' ';
    }
    res = res.replace(/ /g, '');
    let decode = [];
    for (let i = 0; i < res.length; i += 12) {
        decode.push(parseInt(res.slice(i, i + 12), 2));
    }
    decode = decode.slice(0, -1);
    let results_charactor = [];
    let results_card = [];
    let results = [];
    if (version !== null) {
        results.push(`default_version:${version}`);
    }
    for (let x of decode) {
        if (x > 0 && x <= nameMap.length) {
            if (charactorsIdx.includes(x - 1)) {
                results_charactor.push(`charactor:${nameMap[x - 1]}`);
            } else {
                results_card.push(nameMap[x - 1]);
            }
        }
    }
    if (sort) {
        results_card = results_card.sort((a, b) => {
            return nameToId[a] - nameToId[b];
        });
    }
    results.push(...results_charactor);
    results.push(...results_card);
    return results.join('\n');
}

function deckStrToDeckCodeOne(nameList, checksum) {
    let binary = '';
    for (let i of nameList) {
        if (!nameMap.includes(i)) {
            // not found, use 0
            binary += (0).toString(2).padStart(12, '0') + ' ';
        } else {
            let idx = nameMap.indexOf(i);
            binary += (idx + 1).toString(2).padStart(12, '0') + ' ';
        }
    }
    binary = binary.replace(/ /g, '');
    let b8 = [];
    for (let i = 0; i < binary.length; i += 8) {
        b8.push(parseInt(binary.slice(i, i + 8), 2));
    }
    b8[b8.length - 1] = b8[b8.length - 1] * 16; // 4 zeros
    let uint = [];
    for (let i = 0; i < 25; i++) {
        uint.push([b8[i], b8[i + 25]]);
    }
    uint = uint.flat();
    uint.push(0);
    uint = uint.map(x => (x + checksum) % 256);
    let res = Buffer.from(uint).toString('base64');
    return res;
}

function deckStrToDeckCode(deckStr, maxRetryTime = 10000) {
    let deckStrList = deckStr.trim().split('\n').map(x => x.trim());
    // remove empty line and comment
    deckStrList = deckStrList.filter(x => x !== '' && x[0] !== '#');
    // remove default version
    deckStrList = deckStrList.filter(x => !x.startsWith('default_version:'));
    // remove version mark
    deckStrList = deckStrList.map(x => x.split('@')[0]);
    let charactorStrL = deckStrList.filter(x => x.startsWith('charactor:')).map(x => x.slice(10));
    let cardStrL = deckStrList.filter(x => !x.startsWith('charactor:'));
    let charactorStr = [];
    let cardStr = [];

    for (let i of charactorStrL) {
        let number = 1;
        let numberStr = '';
        if (i.includes('*')) {
            [i, numberStr] = i.split('*');
            number = parseInt(numberStr);
        }
        charactorStr = charactorStr.concat(Array(number).fill(i));
    }

    for (let i of cardStrL) {
        let number = 1;
        let numberStr = '';
        if (i.includes('*')) {
            [i, numberStr] = i.split('*');
            number = parseInt(numberStr);
        }
        cardStr = cardStr.concat(Array(number).fill(i));
    }

    if (charactorStr.length > 3 || cardStr.length > 30) {
        throw new Error('Too many characters or cards');
    }

    for (let _ = 0; _ < maxRetryTime; _++) {
        let checksum = Math.floor(Math.random() * 256);
        cardStr = cardStr.sort(() => Math.random() - 0.5);
        let nameList = charactorStr.concat(Array(3 - charactorStr.length).fill('')).concat(cardStr).concat(Array(30 - cardStr.length).fill(''));
        let deckCode = deckStrToDeckCodeOne(nameList, checksum);
        if (!forbiddenTrie.search(deckCode)) {
            return deckCode;
        }
    }

    throw new Error('In generating deck code: retry time exceeded');
}


export {init, deckCodeToDeckStr, deckStrToDeckCode};

