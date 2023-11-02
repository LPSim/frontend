<template>
  <!-- shape is expected to be 16:4.5 -->
  <div class="deck-component-container">
    <div class="command-div">
      <p>{{ $tc('Player :', playerIdx) }}</p>
      <p>{{ $t('Deck name:') }}<br>{{ deck.name }}</p>
      <div>
        <label for="versionDropdown" style="margin: 0" v-if="cardModifiable">{{ $t('Version for added cards:') }}</label>
        <select id="versionDropdown" v-model="selectedVersion" v-if="cardModifiable">
          <option v-for="version in availableVersions" :value="version">{{ version }}</option>
        </select>
      </div>
      <button id="add-charactor-button" v-if="cardModifiable" @click="selectionMode = 'CHARACTOR'">{{ $t('Add Charactor') }}</button>
      <button id="add-card-button" v-if="cardModifiable" @click="selectionMode = 'CARD'">{{ $t('Add Card') }}</button>
      <button id="cancel-button" v-if="cardModifiable && selectionMode" @click="selectionMode = null">{{ $t('Back') }}</button>
      <button id="clear-button" v-if="cardModifiable && !selectionMode" @click="clearAllCards">{{ $t('Clear') }}</button>
      <button id="upload-deck-button" v-if="cardModifiable" @click="uploadDeck">{{ $t('Upload Deck') }}</button>
    </div>
    <!-- <div class="images-container-div"> -->
      <div class="select-divs" v-if="selectionMode">
          <div class="select-splitter-div">{{  $t('Current') }} {{ $t(selectionMode == 'CARD' ? 'Cards' : 'Charactors') }} * {{ selectionMode == 'CARD' ? cards.length : charactors.length }}</div>
          <div v-if="selectionMode == 'CHARACTOR'" class="images-div images-select-div-left" style="width: 15%">
            <div class="one-image-div" v-for="charactor, cid in charactors">
              <img @click="removeCard(charactor, cid)" :src="getCardImageUrl(charactor)" @mousemove="showDetail(charactor.type, charactor.name, charactor.version, charactor)" :alt="charactor.name" />
              <span>{{ charactor.version }}</span>
            </div>
          </div>
          <div v-else class="images-div images-select-div-left" style="width: 30%">
            <div class="one-image-div" v-for="card, cid in cards">
              <img @click="removeCard(card, cid)" :src="getCardImageUrl(card)" @mousemove="showDetail(card.type, card.name, card.version, card)" :alt="card.name" />
              <span>{{ card.version }}</span>
            </div>
          </div>
          <div class="select-splitter-div">{{  $t('Available') }} {{ $t(selectionMode == 'CARD' ? 'Cards' : 'Charactors') }}</div>
          <div class="images-div images-select-div-right" :style="'width: ' + (selectionMode == 'CARD' ? '60%' : '75%')">
            <img v-for="name, cid in selectCards" @click="selectCard(name)" @mousemove="showDetail(name.split('/')[0], name.split('/')[1])" :src="getCardImageUrl({ type: name.split('/')[0], name: name.split('/')[1] })" :alt="name" />
          </div>
      </div>
      <div v-else class="images-div">
        <!-- <div class="charactors-div"> -->
          <div class="splitter-div">{{  $t('Charactors') }} * {{ charactors.length }}</div>
          <div class="one-image-div" v-for="charactor, cid in charactors">
            <img @click="removeCard(charactor, cid)" :src="getCardImageUrl(charactor)" @mousemove="showDetail(charactor.type, charactor.name, charactor.version, charactor)" :alt="charactor.name" />
            <span>{{ charactor.version }}</span>
          </div>
        <!-- </div> -->
        <!-- <div class="cards-div"> -->
          <div class="splitter-div">{{  $t('Cards') }} * {{ cards.length }}</div>
          <div class="one-image-div" v-for="card, cid in cards">
            <img @click="removeCard(card, cid)" :src="getCardImageUrl(card)" @mousemove="showDetail(card.type, card.name, card.version, card)" :alt="card.name" />
            <span>{{ card.version }}</span>
          </div>
        <!-- </div> -->
      </div>
    <!-- </div> -->
  </div>
</template>

<script>
export default {
  props: {
    playerIdx: Number,
    cardModifiable: Boolean,
  },
  data() {
    return {
      selectionMode: null,
      selectedVersion: null,
    }
  },
  created () {
    this.selectedVersion = this.availableVersions[this.availableVersions.length - 1];
  },
  methods: {
    getCardImageUrl(obj) {
      return this.$store.getters.getImagePath(obj)
    },
    removeCard(obj, id) {
      if (!this.cardModifiable) return;
      let type = obj.type;
      let name = obj.name;
      if (type == 'TALENT')
        type = type + '_' + obj.charactor_name;
      let userConfirmation = confirm(
        this.$t('Are you sure to remove ')
        + this.$t(type == 'CHARACTOR' ? 'charactor: ' : 'card: ')
        + this.$t(type + '/' + name)
        + this.$t('?')
      );
      if (!userConfirmation) return;
      if (type != 'CHARACTOR') type = 'CARD';
      this.$store.commit('removeDeckCard', {
        player_id: this.playerIdx,
        type: type.toLowerCase() + 's',
        id: id
      })
    },
    selectCard(name) {
      let nearestVersion = this.$store.getters.findNearestVersion(name, this.selectedVersion, this.$i18n.messages['en-US']);
      if (nearestVersion == null) {
        let type = name.split('/')[0];
        alert(
          this.$t('Version for ', { version: this.selectedVersion })
          + this.$t(type == 'CHARACTOR' ? 'charactor: ' : 'card: ')
          + this.$t(name)
          + this.$t(' not exist!')
        );
        return;
      }
      this.$store.commit('addDeckCard', {
        player_id: this.playerIdx,
        type: this.selectionMode,
        name: name,
        version: nearestVersion
      })
      // this.selectionMode = null;
      setTimeout(() => {
        let select_left_div = document.getElementsByClassName('images-select-div-left')[0];
        select_left_div.scrollLeft = select_left_div.scrollWidth;
      }, 0)
    },
    showDetail(type, name, version, obj = null) {
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
      if (!args.skills) args.skills = [];
      this.$store.commit('setSelectedObject', args);
    },
    uploadDeck() {
      let deck_str = '';
      for (let charactor of this.deck.charactors) {
        deck_str += 'charactor:' + charactor.name + '@' + charactor.version + '\n';
      }
      for (let card of this.deck.cards) {
        deck_str += card.name + '@' + card.version + '\n';
      }
      console.log(deck_str);

      fetch(this.$store.state.serverURL + '/deck', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          deck_str: deck_str,
          player_idx: this.playerIdx,
        }),
      })
      .then(response => {
        if (!response.ok) {
          response.json().then(data => {
            throw new Error('Network response is not ok with detail ' + data.detail);
          })
          .catch(error => {
            this.make_alert('Error in uploading deck. ' + error, error);
          });
          throw new Error('Network response is not ok');
        }
        else return response.json();
      })
      .then(data => {
        // console.log(data);
        alert(this.$t('Deck uploaded successfully!'));
        // this.$store.commit('setShowDeckDiv', false);
      })
      .catch(error => {
        this.make_alert('Error in uploading deck. ' + error, error);
      });
    },
    make_alert(title, data) {
      console.error(data);
      alert(title + '\nFind detail in console.');
    },
    clearAllCards() {
      if (!this.cardModifiable) return;
      let userConfirmation = confirm(
        this.$t('Are you sure to remove all cards?')
      );
      if (!userConfirmation) return;
      this.$store.commit('removeAllDeckCards', {
        player_id: this.playerIdx,
      })
    }
  },
  computed: {
    deck() {
      return this.$store.state.deck[this.playerIdx];
    },
    charactors() {
      return this.deck.charactors;
    },
    cards() {
      return this.deck.cards;
    },
    deck_name() {
      console.log(this.deck, this.$store.state.deck)
      return this.deck.name;
    },
    allCharactors() {
      return this.$store.getters.getNamesWithType('CHARACTOR');
    },
    allCards() {
      let keys = ['WEAPON', 'ARTIFACT', 'SUPPORT', 'ARCANE', 'CARD'];
      // let talents = this.$store.getters.getNamesWithType('TALENT');
      let res = []
      for (let charactor of this.deck.charactors) {
        let talents = this.$store.getters.getNamesWithType('TALENT_' + charactor.name);
        res = res.concat(talents);
      }
      for (let key of keys) {
        res = res.concat(this.$store.getters.getNamesWithType(key));
      }
      res = res.filter((item, index) => item != 'CARD/Unknown');
      // console.log('TALENTS', talents)
      // for (let talent of talents) {
      //   console.log(talent, this.deck.charactors);
      //   for (let charactor in this.deck.charactors)
      //     if (talent.indexOf(charactor.name) != -1)
      //       res.push(talent);
      // }
      return res;
    },
    selectCards() {
      // console.log(this.allCharactors, this.allCards)
      if (this.selectionMode == 'CHARACTOR') {
        return this.allCharactors;
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

.command-div, .images-div, .charactors-div, .cards-div {
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
  width: 100%;
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

.charactors-div, .cards-div, .command-div {
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
}

.images-div > img {
  height: 30%;
  width: 3.74748vw;
  padding-bottom: 0.66vw;
  margin-right: 0.5vw;
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

.one-image-div img {
  width: 100%;
  height: 100%;
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
  margin-bottom: 0.5vw;
}

</style>
