<template>
  <!-- shape is expected to be 16:4.5 -->
  <div class="deck-component-container">
    <div class="deck-code-div" v-if="showDeckCodeDiv">
      <div class="input-group">
        <label>{{ $t('Current Deck Code') }}</label>
        <input type="text" v-model="receiveDeckCode" readonly />
      </div>
      <div class="input-group">
        <label>{{ $t('Input Deck Code') }}</label>
        <input type="text" v-model="inputDeckCode" :disabled="!cardModifiable" />
      </div>
      <div class="button-group">
        <button @click="copyDeckCode">{{ $t(copyButtonText) }}</button>
        <button @click="useDeckCode" :disabled="!cardModifiable">{{ $t('Use Code') }}</button>
        <button @click="showDeckCodeDiv = false">{{ $t('Close') }}</button>
      </div>
    </div>
    <div class="overlay" v-if="showDeckCodeDiv"></div>
    <div class="command-div">
      <p>{{ $tc('Player :', playerIdx) }}</p>
      <p>{{ $t('Deck name:') }}<br>{{ deck.name }}</p>
      <div>
        <label for="versionDropdown" style="margin: 0" v-if="cardModifiable">{{ $t('Version for added cards:') }}</label>
        <select id="versionDropdown" v-model="selectedVersion" v-if="cardModifiable">
          <option v-for="version in availableVersions" :value="version">{{ version }}</option>
        </select>
      </div>
      <button id="add-character-button" v-if="cardModifiable" @click="selectionMode = 'CHARACTER'">{{ $t('Add Character') }}</button>
      <button id="add-card-button" v-if="cardModifiable" @click="selectionMode = 'CARD'">{{ $t('Add Card') }}</button>
      <button id="cancel-button" v-if="cardModifiable" @click="selectionMode = null" :disabled="!selectionMode">{{ $t('Back') }}</button>
      <button id="clear-button" v-if="cardModifiable && selectionMode == null" @click="clearCards">{{ $t('Clear') }}</button>
      <button id="clear-card-button" v-if="cardModifiable && selectionMode == 'CARD'" @click="clearCards">{{ $t('Clear') }}</button>
      <button id="clear-character-button" v-if="cardModifiable && selectionMode == 'CHARACTER'" @click="clearCards">{{ $t('Clear') }}</button>
      <button id="upload-deck-button" v-if="cardModifiable" @click="uploadDeck">{{ $t('Upload Deck') }}</button>
      <button id="deck-code-button" @click="showDeckCodeDivFunc">{{ $t('Deck Code') }}</button>
    </div>
    <!-- <div class="images-container-div"> -->
      <div class="select-divs" v-if="selectionMode">
          <div class="select-splitter-div">{{  $t('Current') }} {{ $t(selectionMode == 'CARD' ? 'Cards' : 'Characters') }} * {{ selectionMode == 'CARD' ? cardRealLength : characters.length }}</div>
          <div v-if="selectionMode == 'CHARACTER'" class="images-div images-select-div-left" style="width: 15%">
            <div class="one-image-div" v-for="character, cid in characters" @mousemove="showDetail(character.type, character.name, character.version, character)" :alt="$t(getFullName(character))" @click="removeCard(character)" @contextmenu.prevent="rightClick(character)">
              <img :src="getCardImageUrl({ ...character, scale: '140x' })" @error="imgSrcError($event)"/>
              <div class="card-text">
                <span>{{ $t(getFullName(character)) }}</span>
              </div>
              <span>{{ character.version }}</span>
            </div>
          </div>
          <div v-else class="images-div images-select-div-left" style="width: 40%">
            <div class="one-image-div one-small-image-div" v-for="card, cid in cards" @click="removeCard(card)" @contextmenu.prevent="rightClick(card)" @mousemove="showDetail(card.type, card.name, card.version, card)">
              <img :src="getCardImageUrl({ ...card, scale: '140x' })" :alt="$t(getFullName(card))" @error="imgSrcError($event)" @load="imgLoadSuccess($event)"/>
              <div class="card-text">
                <span>{{ $t(getFullName(card)) }}</span>
              </div>
              <span>{{ card.version }}</span>
            </div>
          </div>
          <div class="select-splitter-div">{{  $t('Available') }} {{ $t(selectionMode == 'CARD' ? 'Cards' : 'Characters') }}</div>
          <div class="images-div images-select-div-right" :style="'width: ' + (selectionMode == 'CARD' ? '50%' : '75%')">
            <div class="one-image-div one-small-image-div" v-for="name, cid in selectCards" @click="selectCard(name)" @mousemove="showDetail(name.split('/')[0], name.split('/')[1])">
              <img :src="getCardImageUrl({ type: name.split('/')[0], name: name.split('/')[1], scale: '140x' })" :alt="$t(name)" @error="imgSrcError($event)"/>
              <div class="card-text">
                <span>{{ $t(name) }}</span>
              </div>
            </div>
          </div>
      </div>
      <div v-else class="images-div">
        <!-- <div class="characters-div"> -->
          <div class="splitter-div">{{  $t('Characters') }} * {{ characters.length }}</div>
          <div class="one-image-div" v-for="character, cid in characters" @click="removeCard(character)" @contextmenu.prevent="rightClick(character)" @mousemove="showDetail(character.type, character.name, character.version, character)">
            <img :src="getCardImageUrl(character)" :alt="$t(getFullName(character))" @error="imgSrcError($event)"/>
            <div class="card-text">
              <span>{{ $t(getFullName(character)) }}</span>
            </div>
            <span>{{ character.version }}</span>
          </div>
        <!-- </div> -->
        <!-- <div class="cards-div"> -->
          <div class="splitter-div">{{  $t('Cards') }} * {{ cardRealLength }}</div>
          <div class="one-image-div" v-for="card, cid in cards" @mousemove="showDetail(card.type, card.name, card.version, card)" @click="removeCard(card)" @contextmenu.prevent="rightClick(card)">
            <img :src="getCardImageUrl(card)" :alt="$t(getFullName(card))" @error="imgSrcError($event)" @load="imgLoadSuccess($event)"/>
            <div class="card-text">
              <span>{{ $t(getFullName(card)) }}</span>
            </div>
            <span>{{ card.version }}</span>
          </div>
        <!-- </div> -->
      </div>
    <!-- </div> -->
  </div>
</template>

<script>
import HTTP from '../http';
export default {
  props: {
    playerIdx: Number,
    cardModifiable: Boolean,
    sortCards: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      selectionMode: null,
      selectedVersion: null,
      receiveDeckCode: '',
      inputDeckCode: '',
      showDeckCodeDiv: false,
      copyButtonText: 'Copy Code',
      cardRealLength: 0,
    }
  },
  created () {
    this.selectedVersion = this.availableVersions[this.availableVersions.length - 1];
  },
  methods: {
    sendNotify(data) {
      // send notify with unlimited time when in backend
      if (document.hidden) {
        data.duration = -1;
        data.title = this.$t('Background message, click to hide')
      }
      this.$notify(data);
    },
    imgSrcError(event) {
      event.target.style.display = 'none';

      let nextElement = event.target.nextElementSibling;
      if (nextElement) {
        nextElement.style.display = 'flex';
      }
    },
    imgLoadSuccess(event) {
      event.target.style.display = 'block';

      let nextElement = event.target.nextElementSibling;
      if (nextElement) {
        nextElement.style.display = 'none';
      }
    },
    getCardImageUrl(obj) {
      return this.$store.getters.getImagePath(obj)
    },
    getFullName(obj) {
      let type = obj.type;
      let name = this.$store.getters.getNameWithDesc(obj);
      if (type == 'TALENT')
        type = type + '_' + obj.character_name;
      return type + '/' + name;
    },
    rightClick(obj) {
      this.removeCard(obj, false);
    },
    removeCard(obj, showWarning = true) {
      if (obj.name == 'Empty' && obj.type == 'CARD') return;
      if (!this.cardModifiable) return;
      let type = obj.type;
      let name = this.$store.getters.getNameWithDesc(obj);
      if (type == 'TALENT')
        type = type + '_' + obj.character_name;
      if (showWarning) {
        let userConfirmation = confirm(
          this.$t('Are you sure to remove ')
          + this.$t(type == 'CHARACTER' ? 'character: ' : 'card: ')
          + this.$t(type + '/' + name)
          + this.$t('?')
          + this.$t('Hint: right click can remove')
        );
        if (!userConfirmation) return;
      }
      if (type != 'CHARACTER') type = 'CARD';
      this.$store.commit('addDeckModifyCounter', null);
      this.$store.commit('removeDeckCard', {
        player_id: this.playerIdx,
        type: type.toLowerCase() + 's',
        id: obj.idx
      })
    },
    selectCard(name) {
      let nearestVersion = this.$store.getters.findNearestVersion(name, this.selectedVersion, this.$i18n.messages['en-US']);
      if (nearestVersion == null) {
        let type = name.split('/')[0];
        this.sendNotify({
          text: (
            this.$t('Version for ', { version: this.selectedVersion })
            + this.$t(type == 'CHARACTER' ? 'character: ' : 'card: ')
            + this.$t(name)
            + this.$t(' not exist!')
          ),
          type: 'error'
        });
        return;
      }
      this.$store.commit('addDeckCard', {
        player_id: this.playerIdx,
        type: this.selectionMode,
        name: name,
        version: nearestVersion
      })
      this.$store.commit('addDeckModifyCounter', null);
      // this.selectionMode = null;
      // scroll to end
      // setTimeout(() => {
      //   let select_left_div = document.getElementsByClassName('images-select-div-left')[0];
      //   select_left_div.scrollLeft = select_left_div.scrollWidth;
      // }, 0)
    },
    showDetail(type, name, version, obj = null) {
      if (type == 'CARD' && name == 'Empty') return;
      if (!version) version = this.$store.getters.findNearestVersion(type + '/' + name, this.selectedVersion, this.$i18n.messages['en-US']);
      if (version == null) {
        this.$store.commit('setSelectedObject', null);
        return;
      }
      let args = {
        type: type,
        name: name,
        version: version
      }
      if (obj) {
        args = { ...args, ...obj };
      }
      if (!args.skills && args.type == 'CHARACTER') {
        // find skill names from descs
        let msg = this.$i18n.messages['en-US'];
        let prefix = 'SKILL_' + args.name + '_';
        let skills = [];
        for (let key in msg)
            if (key.startsWith(prefix)) {
                if (key.split('/').length != 3) continue;
                let split = key.split('/');
                let type = split[0];
                let skill_name = split[1];
                let version = split[2];
                if (version != args.version) continue;
                let skill_type = type.replace(prefix, '');
                skills.push({
                    name: skill_name,
                    version: version,
                    skill_type: skill_type,
                    desc: ''
                });
            }
        skills.sort((a, b) => {
            function get_order(k) {
                if (k == 'NORMAL_ATTACK') return 0;
                else if (k == 'ELEMENTAL_SKILL') return 1;
                else if (k == 'ELEMENTAL_BURST') return 2;
                else if (k == 'PASSIVE') return 3;
                else return 9;
            }
            return get_order(a.skill_type) - get_order(b.skill_type);
        });
        args.skills = skills;
      }
      this.$store.commit('setSelectedObject', args);
    },
    getDeckString(compress = false) {
      let deck_arr = ['default_version:' + this.selectedVersion];
      for (let character of this.deck.characters) {
        deck_arr.push('character:' + character.name + '@' + character.version);
      }
      for (let card of this.cards) {
        if (card.name == 'Empty' && card.type == 'CARD') continue;
        deck_arr.push(card.name + '@' + card.version);
      }
      if (!compress) return deck_arr.join('\n');
      let deck_dict = {};
      for (let i of deck_arr) {
        if (i in deck_dict) deck_dict[i] += 1;
        else deck_dict[i] = 1;
      }
      let deck_str = '';
      for (let i of deck_arr) {
        if (deck_dict[i] == 0) continue;
        if (deck_dict[i] == 1) deck_str += i + '\n';
        else deck_str += i + '*' + deck_dict[i] + '\n';
        deck_dict[i] = 0;
      }
      return deck_str;
    },
    uploadDeck() {
      let deck_str = this.getDeckString(true);
      console.log('DECK STRING', deck_str);
      this.uploadDeckData(deck_str, '/deck');
    },
    useDeckCode() {
      // Use the deck code
      if (this.inputDeckCode.length != 68) {
        this.sendNotify({
          text: this.$t('Deck code length should be 68!'),
          type: 'error'
        });
        return;
      }
      try {
        let deckString = this.$store.getters.deckCodeToDeckStr(
          this.inputDeckCode, this.selectedVersion, true);
        let deckDict = this.$store.getters.deckStrToDeckDict(
          deckString, this.$i18n.messages['en-US'], true);
        let no_version = deckDict.characters.filter((item) => item.version == null).concat(deckDict.cards.filter((item) => item.version == null));
        deckDict.characters = deckDict.characters.filter((item) => item.version != null);
        deckDict.cards = deckDict.cards.filter((item) => item.version != null);
        let decks = JSON.parse(JSON.stringify(this.$store.state.deck));
        decks[this.playerIdx] = deckDict;
        this.$store.commit('setDeck', decks);
        let message = this.$t('Deck code parsed successfully! Currently not uploaded to server, please upload manually.');
        this.sendNotify({
          text: message,
          type: 'success'
        });
        if (no_version.length > 0) {
          this.sendNotify({
            text: this.$t('\n\nWarning: the following cards/characters are not available in selected version, they will be ignored:\n') + no_version.map((item) => this.$t(item.type + '/' + item.name)).join(', '),
            type: 'warn'
          });
        }
        this.showDeckCodeDiv = false;
        this.$store.commit('addDeckModifyCounter', null);
      }
      catch (e) {
        console.log(this.$t('Error in parsing deck code\n\n') + e);
      }
    },
    uploadDeckData(deck_str, target_url, callback) {
      function successFunc(data) {
        // console.log(data);
        if (data == 'error') return;
        this.sendNotify({
          text: this.$t('Deck uploaded successfully!'),
          type: 'success'
        });
        // this.$store.commit('setShowDeckDiv', false);
        this.$store.commit('resetDeckModifyCounter', null);
        if (callback) callback();
      }
      let err_msg = 'Error in uploading deck. ';
      function failFunc(err) {
        this.make_alert(this.$t(err_msg) + err, err);
      }
      function checkFunc(response) {
        // receive response from fetch, return message json if ok, else throw
        // error.
        if (!response.ok) {
          response.json().then(data => {
            throw new Error(this.$t('Network response is not ok with detail ') + data.detail);
          })
          .catch(error => {
            this.make_alert(this.$t(err_msg) + error, error)
          });
          return 'error';
        }
        else return response.json();
      }
      HTTP.postBaseFunc(
        this.$store.state.serverURL + target_url,
        {
          deck_str: deck_str,
          player_idx: this.playerIdx,
        },
        successFunc.bind(this),
        checkFunc.bind(this),
        failFunc.bind(this),
      );
    },
    make_alert(title, data) {
      console.error(data);
      this.sendNotify({
        text: title + this.$t('\n\nFind detail in console.'),
        type: 'error'
      });
    },
    clearCards() {
      if (!this.cardModifiable) return;
      let msg = 'Are you sure to remove all ';
      if (this.selectionMode == 'CHARACTER') msg += 'characters?';
      else if (this.selectionMode == 'CARD') msg += 'cards?';
      else msg += 'characters and cards?';
      let userConfirmation = confirm(this.$t(msg));
      if (!userConfirmation) return;
      this.$store.commit('removeDeckCards', {
        player_id: this.playerIdx,
        area: this.selectionMode ? this.selectionMode : 'ALL'
      })
    },
    copyDeckCode() {
      // Copy the deck code to the clipboard
      navigator.clipboard.writeText(this.receiveDeckCode).then(() => {
        // The deck code was successfully copied
        this.copyButtonText = 'Copied!';
        setTimeout(() => {
          this.copyButtonText = 'Copy Code';
        }, 1000);
      }).catch(error => {
        // The deck code could not be copied
        console.error(error);
      });
    },
    showDeckCodeDivFunc() {
      try {
        let deckString = this.getDeckString();
        console.log(deckString);
        this.receiveDeckCode = this.$store.getters.deckStrToDeckCode(deckString);
        this.showDeckCodeDiv = true;
        this.inputDeckCode = '';
      }
      catch (error) {
        this.sendNotify({
          text: this.$t('Error in getting deck code. ') + error,
          type: 'error'
        });
        throw error;
      }
    },
    receiveDeckCodeFromServer() {
      // receive deck code from server and show div
      if (this.$store.state.deckModifyCounter > 0) {
        this.sendNotify({
          text: this.$t('Current deck is modified and not uploaded, please upload the deck before getting the deck code!'),
          type: 'warn'
        });
        return;
      }
      const xhr = new XMLHttpRequest();
      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            this.receiveDeckCode = JSON.parse(xhr.responseText);
            this.showDeckCodeDiv = true;
            this.inputDeckCode = '';
          }
          else {
            this.sendNotify({
              text: this.$t('Error in getting deck code. ') + xhr.responseText,
              type: 'error'
            });
          }
        }
      };
      xhr.open('GET', this.$store.state.serverURL + '/deck_code/' + this.playerIdx, true);
      xhr.send();
    }
  },
  computed: {
    deck() {
      return this.$store.state.deck[this.playerIdx];
    },
    characters() {
      let ret = [];
      for (let i = 0; i < this.deck.characters.length; i++) {
        let c = JSON.parse(JSON.stringify(this.deck.characters[i]));
        c.idx = i;
        ret.push(c);
      }
      // let state = this.$store.state;
      // ret.sort((a, b) => {
      //   let a_id = state.nameToId[this.getFullName(a)];
      //   let b_id = state.nameToId[this.getFullName(b)];
      //   if (a_id == undefined) a_id = 999999;
      //   if (b_id == undefined) b_id = 999999;
      //   return a_id - b_id;
      // });
      return ret;
    },
    cards() {
      let ret = [];
      for (let i = 0; i < this.deck.cards.length; i++) {
        let c = JSON.parse(JSON.stringify(this.deck.cards[i]));
        c.idx = i;
        ret.push(c);
      }
      if (this.sortCards) {
        let state = this.$store.state;
        ret.sort((a, b) => {
          let a_id = state.nameToId[this.getFullName(a)];
          let b_id = state.nameToId[this.getFullName(b)];
          if (a_id == undefined) a_id = 999999;
          if (b_id == undefined) b_id = 999999;
          return a_id - b_id;
        });
      }
      this.cardRealLength = ret.length;
      while (ret.length < 30) {
        ret.push({
          type: 'CARD',
          name: 'Empty',
          desc: '',
          version: '',
          idx: ret.length,
        });
      }
      return ret;
    },
    deck_name() {
      console.log(this.deck, this.$store.state.deck)
      return this.deck.name;
    },
    allCharacters() {
      return this.$store.getters.getNamesWithType('CHARACTER');
    },
    allCards() {
      let keys = ['WEAPON', 'ARTIFACT', 'SUPPORT', 'ARCANE', 'CARD'];
      // let talents = this.$store.getters.getNamesWithType('TALENT');
      let res = []
      for (let character of this.deck.characters) {
        let talents = this.$store.getters.getNamesWithType('TALENT_' + character.name);
        res = res.concat(talents);
      }
      for (let key of keys) {
        res = res.concat(this.$store.getters.getNamesWithType(key));
      }
      res = res.filter((item, index) => item != 'CARD/Unknown');
      // console.log('TALENTS', talents)
      // for (let talent of talents) {
      //   console.log(talent, this.deck.characters);
      //   for (let character in this.deck.characters)
      //     if (talent.indexOf(character.name) != -1)
      //       res.push(talent);
      // }
      return res;
    },
    selectCards() {
      // console.log(this.allCharacters, this.allCards)
      if (this.selectionMode == 'CHARACTER') {
        return this.allCharacters;
      } else if (this.selectionMode == 'CARD') {
        return this.allCards;
      } else {
        return [];
      }
    },
    availableVersions() {
      return this.$store.state.availableVersions;
    },
  }
}
</script>

<style>
.deck-component-container {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  border: 1px solid black;
  padding: 0.5vw;
}

.command-div, .images-div, .characters-div, .cards-div {
  height: 100%;
}

.command-div {
  width: 10%;
  margin-right: 5%;
}

.images-div {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  flex-wrap: wrap;
}

.select-divs {
  width: 85%;
  height: 100%;
  display: flex;
  flex-direction: row;
}

.images-select-div-left, .images-select-div-right {
  overflow-x: scroll;
}

.select-splitter-div {
  width: 5%;
  height: 100%;
  writing-mode: vertical-rl;
  font-size: 2vw;
}

.characters-div, .cards-div, .command-div {
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
}

.images-div > img {
  height: 23.625%;
  width: 2.95vw;
  padding-bottom: 0.25vw;
  margin-right: 0.25vw;
  /* width: 10%; */
}

.images-div .one-image-div {
  height: 33.33333%;
  width: 3.873vw;
  padding-bottom: 10%;
  margin-right: 0.5vw;
  position: relative
}

.images-select-div-left > .one-image-div {
  padding-bottom: 0.66vw;
}

.images-div .one-small-image-div {
  height: 25%;
  width: 2.9vw;
  padding-bottom: 1%;
  margin-right: 0.25vw;
  position: relative;
  font-size: 0.75vw;
}

.one-image-div img {
  height: auto;
  width: 100%;
}

.one-image-div span {
  position: absolute;
  left: 0;
  background: white;
  border-radius: 0.25vw;
  /* font-size: 0.25vw; */
}

.images-div > .splitter-div {
  height: 100%;
  width: 5vw;
  writing-mode: vertical-rl;
  font-size: 2vw;
}

.command-div {
  justify-content: center;
}

.command-div > * {
  margin-bottom: 0.4vw;
  margin-top: 0;
}

.deck-code-div {
  position: absolute;
  width: 80%;
  height: 50%;
  left: 10%;
  top: 25%;
  border: 1px solid black;
  background-color: white;
  z-index: 999;
  display: flex;
  justify-content: space-around;
  flex-direction: column;
  padding: 1vw;
}

.input-group {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.input-group label {
  margin-right: 10px;
  flex: 2;
}

.input-group input {
  flex: 10;
}

.button-group {
  display: flex;
  justify-content: space-around;
}

.button-group button {
  width: 20%;
  height: 2vw;
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1;
}

button {
  background-color: #4caf50;
  color: #fff;
  border: none;
  border-radius: 3px;
  padding: 0.1vw 1vw;
  font-size: 1em;
  cursor: pointer;
}

@media (max-width: 1200px) {
  button {
    padding: 0.1vw 0.1vw;
  }
}

button:disabled {
  cursor: not-allowed !important;
  background-color: #cccccc !important;
  color: #888888 !important;
}

button:hover {
  background-color: #3e8e41;
}

.card-text {
  display: none;
  align-items: center;
  justify-content: center;
  height: 100%;
  border: 0.1vw;
  border-color: #6B5531;
  border-style: solid;
  border-radius: 0.5vw;
}

.card-text > span {
  background: #0000;
  word-break: break-all;
}

.one-image-div > span {
  position: absolute;
  left: 0;
  top: 0;
}

</style>
