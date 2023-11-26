<template>
  <div id="app">
    <div class="header-div-container" :style="showDebug ? 'padding-bottom: 16rem' : ''">
      <div class="header-div" v-if="showDebug">
        <div class="interaction-div">
          <div style="height: 60%; padding: 5%;">
            <textarea v-model="interactionInput" @keydown.enter.prevent="sendInteraction" :disabled="processing || !this.displayInJudgeMode"></textarea>
          </div>
          <div class="interaction-button-group">
            <button @click="sendInteraction" :disabled="processing">{{ $t('Send') }}</button>
            <button @click="refreshData" :disabled="processing">{{ $t('Refresh') }}</button>
          </div>
        </div>
        <div class="requests-div">
          <ul v-if="match != null">
            <li v-for="(request, rid) in match.requests.filter(request => request.player_idx === currentRequestPlayerId)" :key="rid" @mouseover="showRequestDetails(request)" @mouseout="hideRequestDetails()" @click="logRequest(request)">
              {{ request.name.replace('Request', '') }}
            </li>
          </ul>
        </div>
        <div class="request-details">
          <RequestDetails :selectedRequest="selectedRequest" />
        </div>
        <div class="text-div">
          <h4>{{ $t('Upload replay file:') }}</h4>
          <input type="file" ref="fileInput" @change="handleFileSelect" :disabled="processing" style="font-size: 0.8vw">
        </div>
        <div>
          <!-- <button @click="stopRefresh()">stopRefresh</button> -->
        </div>
      </div>
      <div class="header-div" :style="showDebug ? 'top: 8rem;' : ''">
        <div class="deck-start-div">
          <button id="check-show-deck" @click="clickCheckShowDeck" :disabled="playerTableOrder == -1 || !serverConnected">{{ $t('Check/Set Deck') }}</button>
          <button id="start-new-match" @click="clickStartNewMatch" :disabled="playerTableOrder == -1 || !serverConnected">{{ $t('Start New Match') }}</button>
          <button @click="resetByIndex()" :disabled="playerTableOrder == -1 || matchData.length === 0 || !serverConnected">{{ $t('Reset Match to This Index') }}</button>
        </div>
        <div class="radios-div">
          <p>{{ $t('Display Mode:') }}</p>
          <div class="judge-mode-div">
            <label>
              <input type="radio" v-model="displayInJudgeMode" :value="true" @click="updateMatch(undefined,true, null)">
              {{ $t('Judge Mode (show information of all players)') }}
            </label>
            <label>
              <input type="radio" v-model="displayInJudgeMode" :value="false" @click="updateMatch(undefined, false, null)">
              {{ $t('Play Mode (show information only current player)') }}
            </label>
          </div>
          <p :style="playerTableOrder == -1 ? 'color: red' : ''">{{ $t('View point:') }}</p>
          <div class="player-table-order" :style="playerTableOrder == -1 ? 'color: red' : ''">
            <label v-for="tnum in [0, 1]">
              <input type="radio" v-model="playerTableOrder" :value="tnum" @click="updateMatch(undefined, null, tnum)">
              {{ $tc('Player :', tnum) }}{{ match ? match.player_tables[tnum].player_name : '' }}
            </label>
          </div>
        </div>
        <div class="main-info-div">
          <div v-if="playerTableOrder == -1">
            <div class="round-div" style="font-weight: bold; font-size: 2vw;">
              {{ $t('Please select view point.') }}
            </div>
          </div>
          <div v-if="playerTableOrder != -1 && !serverConnected">
            <div class="round-div" style="font-weight: bold; font-size: 1.5vw;">
              {{ $t('Please connect server.') }}
            </div>
          </div>
          <div v-if="match == null && playerTableOrder != -1 && serverConnected">
            <div class="round-div" style="font-weight: bold; font-size: 1.5vw;">
              {{ $t('No Match Data.') }}<br>{{ $t('Refresh or load replay in debug.') }}
            </div>
          </div>
          <div v-if="match != null && playerTableOrder != -1">
            <div class="round-div" style="font-weight: bold; font-size: 2vw;">
              {{ $tc('Round ', match.round_number) }}
            </div>
          </div>
          <div v-if="match != null && playerTableOrder != -1">
            <div class="match-state-div">
              {{ $t('Current Match State: ') }}{{ $t('MATCHSTATE/' + match.state) }}
            </div>
          </div>
          <div v-if="match != null && playerTableOrder != -1 && serverConnected" style="font-size: 1vw">
            <div class="your-turn-div" v-if="isYourTurn" style="font-weight: bold;">
              {{ $t('Current is Your Turn') }}
            </div>
            <div class="your-turn-div" v-else>
              {{ $t('Current is Not Your Turn') }}
            </div>
          </div>
        </div>
        <div class="buttons-div">
          <div class="data-navigation">
            <div>
              <div class="step-count">
                <label for="step-count-input">{{ $t('Step count:') }}</label>
                <input id="step-count-input" type="number" v-model="stepCount" min="1" max="1000">
              </div>
              <button @click="showPrevData" :disabled="currentDataIndex === 0 || matchData.length === 0">{{ $t('Prev') }}</button>
              <button @click="showNextData" :disabled="currentDataIndex === matchData.length - 1 || matchData.length === 0">{{ $t('Next') }}</button>
            </div>
            <div>
              <div class="current-step">
                <label for="current-step-input">{{ $t('Current step:') }}</label>
                <input id="current-step-input" type="number" v-model="currentDataIndex" @keydown.enter="jumpToData" min="0" :max="matchData.length - 1">
              </div>
              <button @click="jumpToData" :disabled="matchData.length === 0">{{ $t('Jump') }}</button>
              <button @click="jumpToEndData" :disabled="(!matchData) || (matchData.length === 0) || (currentDataIndex == matchData.length - 1)" style="background-color: #ffa500">{{ $t('Jump to End') }}</button>
            </div>
          </div>
        </div>
        <div class="debug-refresh-freq-div">
          <div class="server-url-div">
            <label for="server-url">{{ $t('Server URL:') }}</label>
            <input id="server-url" type="text" v-model="serverURL">
            <button id="connect-server-button" @click="connectServer" :disabled="playerTableOrder == -1" :style="serverConnected ? '' : 'background-color: #ffa500'">{{ $t(serverConnected ? 'Connected' : 'Connect') }}</button>
          </div>
          <div class="freq-div">
              <label for="refresh-frequency">{{ $t('Auto Refresh frequency (ms):') }}</label>
              <input id="refresh-frequency" type="number" v-model="refreshInterval" min="1">
              <button @click="refreshTimeout ? stopRefresh() : refreshData()" :disabled="processing || playerTableOrder == -1" :style="refreshTimeout ? 'background-color: #ffa500' : ''">{{ $t(refreshTimeout ? 'Stop Refresh' : 'Start Refresh') }}</button>
          </div>
          <div class="refresh-debug-div">
            <button @click="changeLanguage()">Language</button>
            <button @click="showDebug = !showDebug">{{ $t('Toggle Debug') }}</button>
          </div>
        </div>
      </div>
    </div>
    <div v-if="showDeckDiv" class="deck-container">
      <div class="desc-container">
        <div v-for="(desc, did) in descData">
          <h4>{{ $t(desc.type + '/' + $store.getters.getNameWithDesc(desc)) }}</h4>
          <p v-if="desc.version && did == 0">{{ $t('Version: ') }} {{ desc.version }}</p>
          <p v-if="desc.skill_type">{{ $t('SKILL_TYPE/' + desc.skill_type) }}</p>
          <p>{{ $t(desc.type + '/' + $store.getters.getNameWithDesc(desc) + '/' + descData[0].version) }}</p>
        </div>
      </div>
      <div class="deck-container-inner">
        <Deck :player-idx="1 - playerTableOrder" :card-modifiable="displayInJudgeMode"></Deck>
        <Deck :player-idx="playerTableOrder" :card-modifiable="true"></Deck>
      </div>
    </div>
    <div class="match-container" v-if="match != null && !showDeckDiv">
      <div class="desc-container">
        <div v-for="(desc, did) in descData">
          <h4>{{ $t(desc.type + '/' + $store.getters.getNameWithDesc(desc)) }}</h4>
          <p v-if="desc.version && did == 0">{{ $t('Version: ') }} {{ desc.version }}</p>
          <p v-if="desc.skill_type">{{ $t('SKILL_TYPE/' + desc.skill_type) }}</p>
          <p>{{ $t(desc.type + '/' + $store.getters.getNameWithDesc(desc) + '/' + descData[0].version) }}</p>
        </div>
      </div>
      <div v-if="predictMatch" class="player-tables-container prediction-container">
        <div class="player-tables" v-for="(playerTable, pid) in sortedPredictPlayerTables" :key="pid" :style="'top: ' + (pid == 1 ? '50%' : '0')">
          <PlayerTable :class="{'table-current-player': match.current_player == playerTable.player_idx, 'table-current-request': currentRespondingPlayerId == playerTable.player_idx}" :playerTable="playerTable" :is_reverse="pid == 0"/>
        </div>
      </div>
      <div v-else class="player-tables-container">
        <div class="player-tables" v-for="(playerTable, pid) in sortedPlayerTables" :key="pid" :style="'top: ' + (pid == 1 ? '50%' : '0')">
          <PlayerTable :class="{'table-current-player': match.current_player == playerTable.player_idx, 'table-current-request': currentRespondingPlayerId == playerTable.player_idx}" :playerTable="playerTable" :is_reverse="pid == 0"/>
        </div>
      </div>
      <div v-if="switchNotify" :class="{ 'switch-notify-container': true, 'notify-right-part': switchNotify.player_id != playerTableOrder }">
        <div :class="{ 'opponent-shadow-color': switchNotify.player_id != playerTableOrder }">
          <img :src="$store.getters.getImagePath({ type: 'AVATAR', name: switchNotify.charactor_name, desc: switchNotify.charactor_desc })">
          <div>
            <p>{{ $t('Switch to') }} {{ $t('CHARACTOR/' + $store.getters.getNameWithDesc({ name: switchNotify.charactor_name, desc: switchNotify.charactor_desc })) }}</p>
          </div>
        </div>
      </div>
      <div v-if="skillNotify" :class="{ 'skill-notify-container': true, 'notify-right-part': skillNotify.player_id != playerTableOrder }">
        <div :class="{ 'opponent-shadow-color': skillNotify.player_id != playerTableOrder }">
          <img :src="$store.getters.getImagePath({ type: 'AVATAR', name: skillNotify.charactor_name, desc: skillNotify.charactor_desc })">
          <div>
            <p>{{ $t('CHARACTOR/' + $store.getters.getNameWithDesc({ name: skillNotify.charactor_name, desc: skillNotify.charactor_desc })) }} {{ $t('used') }} {{ $t('SKILL_TYPE/' + skillNotify.skill_type) }}</p>
            <p>{{ $t('SKILL_' + $store.getters.getNameWithDesc({ name: skillNotify.charactor_name, desc: skillNotify.charactor_desc }) + '_' + skillNotify.skill_type + '/' + skillNotify.skill_name) }}</p>
          </div>
        </div>
      </div>
      <div v-if="cardNotify" :class="{ 'card-notify-container': true, 'notify-right-part': cardNotify.player_id != playerTableOrder }">
        <img :src="$store.getters.getImagePath(cardNotify)" :class="{ 'opponent-shadow-color': cardNotify.player_id != playerTableOrder }">
      </div>
      <div v-if="roundEndNotify" :class="{ 'center-text-notify-container': true, 'opponent-shadow-color': roundEndNotify.player_id != playerTableOrder }">
        <span>{{ $t((roundEndNotify.player_id != playerTableOrder ? 'Opponent' : 'You') + ' declare round end', ) }}</span>
      </div>
      <div v-if="waitOpponentNotify" :class="{ 'center-text-notify-container': true, 'opponent-shadow-color': true }">
        <span style="font-size: 1.25vw">{{ $t('Waiting for opponent action. Current state is initial state, state will update until both players have done actions.') }}</span>
      </div>
      <div v-if="match.winner != -1" :class="{ 'center-text-notify-container': true, 'opponent-shadow-color': match.winner != playerTableOrder }">
        <span>{{ $t('Game End') }} {{ $t((match.winner != playerTableOrder ? 'Opponent' : 'You') + ' win', ) }}</span>
      </div>
      <div v-if="predictFullMatch" class="prediction-notify-container">
        <div v-for="number in 15">
          <span>{{ $t('Skill Prediction') }}</span>
        </div>
      </div>
      <div class="requests-button-container">
        <div class="prev-buttons">
          <div v-if="key != 'DeclareRoundEnd' && key != 'SwitchCharactor'" v-for="data, key in buttonRequests" :key="key" @click="selectRequest(data)" >
            <RequestButton :title="data.title" :cost="data.cost" :select_class="selectClass(data.title, data.idx)" />
          </div>
        </div>
        <div class="last-buttons">
          <div v-if="buttonRequests.SwitchCharactor" @click="selectRequest(buttonRequests.SwitchCharactor)">
            <RequestButton :title="buttonRequests.SwitchCharactor.title" :cost="buttonRequests.SwitchCharactor.cost" :select_class="selectClass('Switch Charactor', buttonRequests.SwitchCharactor.idx)" />
          </div>
          <div v-if="!buttonRequests.SwitchCharactor && buttonRequests.DeclareRoundEnd" @click="selectRequest(buttonRequests.DeclareRoundEnd)">
            <RequestButton :title="$t('Declare Round End')" :select_class="selectClass('Declare Round End', buttonRequests.DeclareRoundEnd.idx)" />
          </div>
          <div @click="confirmSelection">
            <RequestButton :title="$t('Confirm')" :select_class="selectClass('Confirm')" />
          </div>
          <div @click="cancelSelection">
            <RequestButton :title="$t('Cancel')" :select_class="selectClass('Cancel')" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import PlayerTable from './PlayerTable.vue'
import RequestDetails from './RequestDetails.vue';
import RequestButton from './RequestButton.vue';
import Deck from './Deck.vue';

export default {
  name: 'App',
  components: {
    PlayerTable,
    RequestDetails,
    RequestButton,
    Deck
  },
  data() {
    return {
      dataVersion: null,
      matchDataInput: 'Loading...',
      matchData: [],
      requestData: [],
      currentDataIndex: 0,
      maxPlayedDataIndex: 0,
      fullMatch: null,
      predictFullMatch: null,
      playerTableOrder: -1,
      stepCount: 1,
      processing: false,
      selectedRequest: null,
      commandPOSTData: null,
      interactionInput: '',
      interactionCommands: [[], []],
      commandHistory: [[], []],
      multiCommandTimeout: 100,
      refreshInterval: 1000,
      showDebug: false,
      displayInJudgeMode: false,
      currentLanguage: null,
      refreshTimeout: null,
    }
  },
  created() {
    // if localstorage is empty, save server url to localstorage
    if (localStorage.getItem('serverURL') == null) {
      localStorage.setItem('serverURL', this.$store.state.serverURL);
    }
    // read server url from localstorage
    this.serverURL = localStorage.getItem('serverURL');

    // log data when created
    console.log('APP', this);
    console.log('STORE', this.$store.state);
    // console.log('I18N', this.$root.$i18n, this.$i18n);

    // set current language
    this.currentLanguage = this.$root.$i18n.locale;

    // auto load logs.txt. when debug, it avoids manually loading data.
    // const logFilePath = 'logs.txt';
    // const xhr = new XMLHttpRequest();
    // xhr.onreadystatechange = () => {
    //   if (xhr.readyState === 4) {
    //     this.processing = false;
    //     this.matchDataInput = '';
    //     if (xhr.status === 200) {
    //       this.matchDataInput = xhr.responseText;
    //       this.parseLogFileData();
    //     }
    //   }
    // };
    // xhr.open('GET', logFilePath, true);
    // xhr.send();
    // this.processing = true;
    // this.playerTableOrder = 1;
    // this.displayInJudgeMode = true;
    // this.showDebug = true;
    // this.refreshInterval = 100;
    // this.refreshData();

    // listen to ESC and ENTER key
    window.removeEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keydown', this.handleKeyDown);
  },
  methods: {
    connectServer() {
      if (this.serverConnected) return;
      // try to connect server. will first check version, and send callback
      // that will request patch data.
      function connected_callback() {
        // patch
        let patch_url = this.serverURL + '/patch';
        const xhr = new XMLHttpRequest();
        xhr.onreadystatechange = () => {
          if (xhr.readyState === 4) {
            if (xhr.status === 200) {
              let patch_message = JSON.parse(xhr.responseText);
              console.log('PATCH', patch_message, Object.keys(patch_message.patch).length, 'KEYS');
              this.updateLocales(patch_message);
              this.$store.commit('updateDataByPatch', patch_message);
              alert(this.$t('Connected to server.'));
              this.serverConnected = true;
              // when successfully connected, start auto refreshing immediately.
              this.refreshTimeout = setTimeout(() => this.refreshData(), 0);
              return;
            }
            this.make_alert(this.$t('Error in connecting server.') + xhr.status, xhr);
          }
        };
        xhr.open('GET', patch_url, true);
        xhr.send();

        // deck code data
        let deck_code_url = this.serverURL + '/deck_code_data';
        const xhr2 = new XMLHttpRequest();
        xhr2.onreadystatechange = () => {
          if (xhr2.readyState === 4) {
            if (xhr2.status === 200) {
              let deck_code_data = JSON.parse(xhr2.responseText);
              console.log('DECK CODE DATA', deck_code_data);
              this.$store.commit('setDeckCodeData', deck_code_data);
              return;
            }
            this.make_alert(this.$t('Error in connecting server.') + xhr2.status, xhr2);
          }
        };
        xhr2.open('GET', deck_code_url, true);
        xhr2.send();
      }
      this.checkVersion(connected_callback.bind(this));
    },
    stopServerByError() {
      // error occured, stop connect to server and stop auto refresh.
      // Make confirmation that whether user want to clear all data.
      clearTimeout(this.refreshTimeout);
      this.refreshTimeout = null;
      this.serverConnected = false;
      if (confirm(this.$t('Stop server connection by error, clear all data?'))) {
        this.clearAllData();
        this.connectServer();
      }
    },
    clearAllData() {
        document.activeElement.blur();
        this.$store.commit('setShowDeckDiv', false);
        clearTimeout(this.refreshTimeout);
        this.matchData = [];
        this.fullMatch = null;
        this.predictFullMatch = null;
        this.currentDataIndex = 0;
        this.maxPlayedDataIndex = 0;
        this.interactionCommands = [[], []];
        this.commandHistory = [[], []];
        this.requestData = [];
        alert(this.$t('Game reset successfully!'));
    },
    checkVersion(callback = undefined) {
      let url = this.$store.state.serverURL;
      let xhr = new XMLHttpRequest();
      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            let version = JSON.parse(xhr.responseText).version;
            console.log('SERVER VERSION', version);
            let self_version = require('../../package.json').version;
            if (!(version == undefined || version == 'unknown')) {
              // undefined, old server, no error message.
              // or unknown, debug server, no error message.
              if (version != self_version) {
                let msg = this.$t('Server version is ') + version + this.$t(', but client version is ') + self_version + this.$t('. Client may not work properly.');
                alert(msg);
              }
            }
            if (callback) callback();
            return;
          }
          this.make_alert(this.$t('Error in connecting server.') + xhr.status, xhr);
        }
      };
      xhr.open('GET', url + '/version', true);
      xhr.send();
    },
    updateLocales(patch) {
      let version = patch.version;
      if (version != '1.0') throw new Error('Unknown patch version ' + version);
      patch = patch.patch;
      let new_messages = {};
      for (let full_key in patch) {
        let data = patch[full_key];
        if (data.names) {
          for (let lang in data.names) {
            if (!new_messages[lang]) new_messages[lang] = {};
            let name = data.names[lang];
            if (name[0] == '$') {
              // is reference
              let ref_key = name.slice(1);
              name = this.$i18n.messages[lang][ref_key];
            }
            new_messages[lang][full_key] = name;
          }
        }
        if (data.descs) {
          for (let version in data.descs) {
            for (let lang in data.descs[version]) {
              if (!new_messages[lang]) new_messages[lang] = {};
              let desc = data.descs[version][lang];
              if (desc[0] == '$') {
                // is reference
                let ref_key = desc.slice(1);
                desc = this.$i18n.messages[lang][ref_key];
              }
              new_messages[lang][full_key + '/' + version] = desc
            }
          }
        }
      }
      console.log('NEW MESSAGES', new_messages);
      for (let lang in new_messages)
        this.$i18n.mergeLocaleMessage(lang, new_messages[lang]);
    },
    wrongProtocol() {
      // when from lpsim.zyr17.cn, use http to connect localhost, or use https
      // to connect LAN server, the protocol is wrong.
      // if protocol wrong, give alert and raise error.
      let url = document.URL;
      if (!url.includes('lpsim.zyr17.cn')) return;
      let current_protocol = url.split(':')[0];
      let target = this.$store.state.serverURL;
      let target_protocol = target.split(':')[0];
      if (target_protocol == 'https') {
        // target is https, current must https
        if (current_protocol != 'https') {
          let msg = this.$t('To connect https server, visit https://lpsim.zyr17.cn. Currently you are visiting http page.');
          alert(msg);
          throw new Error(msg);
        }
        return;
      }
      if (target.includes('localhost') || target.includes('127.0.0.1')) {
        if (current_protocol == 'https') return;
        let msg = this.$t('To connect localhost server, visit https://lpsim.zyr17.cn. Currently you are visiting http page.');
        alert(msg);
        throw new Error(msg);
      }
      else {
        if (current_protocol == 'http') return;
        let msg = this.$t('To connect LAN server, visit http://lpsim.zyr17.cn. Currently you are visiting https page.');
        alert(msg);
        throw new Error(msg);
      }
    },
    changeLanguage(lang = null) {
      if (lang == null) {
        // select next language
        let keys = Object.keys(this.$i18n.messages).sort();
        let position = keys.indexOf(this.currentLanguage);
        this.currentLanguage = keys[(position + 1) % keys.length];
        this.$root.$i18n.locale = this.currentLanguage;
        console.log('Change language to ' + this.currentLanguage);
      }
    },
    make_alert(title, data) {
      console.error(data);
      alert(title + this.$t('\nFind detail in console.'));
      this.refreshTimeout = null;
    },
    handleFileSelect() {
      const file = this.$refs.fileInput.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.matchDataInput = reader.result;
        this.parseLogFileData();
      };
      reader.readAsText(file);
    },
    logRequest(request) {
      console.log('REQUEST', JSON.parse(JSON.stringify(request)));
    },
    handleKeyDown(event) {
      let prevent_target = (
        (event.target.tagName == 'INPUT' && event.target.type !== 'radio')
        || event.target.tagName == 'TEXTAREA'
      );
      if (event.keyCode === 27) { // ESC key
        if (!prevent_target) {
          // Perform the desired action for the ESC key
          this.cancelSelection();
        }
      } else if (event.keyCode === 13 || event.keyCode == 32) { // ENTER or SPACE key
        if (!prevent_target) {
          // Perform the desired action for the ENTER key
          this.confirmSelection();
        }
      }
    },
    updateMatch(data, mode = null, player_idx = null) {
      if (data === undefined) data = this.matchData[this.currentDataIndex];
      if (data === undefined) return;
      data = JSON.parse(JSON.stringify(data))
      data.player_tables[0].player_idx = 0
      data.player_tables[1].player_idx = 1
      let requests = data.requests
      // console.log(data, requests, this.currentDataIndex, this.matchData.length - 1)
      if (this.currentDataIndex == this.matchData.length - 1) {
        // in last, parse requests from requestData
        requests = JSON.parse(JSON.stringify(this.requestData))
      }
      for (let i = 0; i < requests.length; i++) {
        let request = requests[i]
        if (request.name == 'UseCardRequest') {
          let player_idx = request.player_idx
          let card_idx = request.card_idx
          let hands = data.player_tables[player_idx].hands
          let card = hands[card_idx]
          if (card) card.cost = request.cost
          else console.error('UseCardRequest, but card not exist', request, hands)
          // console.log(request.name, request, request.cost)
        }
        else if (request.name == 'UseSkillRequest') {
          // console.log(request.name, request.cost)
        }
        else if (request.name == 'SwitchCharactorRequest') {
          // console.log(request.name, request.cost)
        }
        else if (request.name == 'RerollDiceRequest') {
          // if is reroll-dice request, update dice color from request
          let player_idx = request.player_idx
          let colors = request.colors
          data.player_tables[player_idx].dice.colors = colors
        }
        else {
          // console.log(request.name)
        }
      }
      this.fullMatch = data
      this.fullMatch.requests = requests
      let match = this.fullMatch
      // console.log(match.last_action.type)

      // set damage info
      let damage_info = null;
      if (match.last_action.type == 'MAKE_DAMAGE') {
        // console.log(JSON.parse(JSON.stringify(match.last_action)))
        // console.log(JSON.parse(JSON.stringify(match.action_info)))
        damage_info = match.action_info;
        damage_info.position = match.last_action.damage_value_list[0].position;
      }
      this.$store.commit('setDamageNotify', damage_info)

      // update deck in it has deck information
      // let deck = [];
      // for (let i = 0; i < match.player_tables; i ++ )
      //   if (match.player_tables[i].deck)
      //     deck.push(match.player_tables[i].deck);
      // if (deck.length == 0) deck = null;
      // this.$store.commit('setDeck', deck);
      this.commitMatchToStore(mode, player_idx)
    },
    commitMatchToStore(mode = null, player_idx = null) {
      if (player_idx == null) player_idx = this.playerTableOrder;
      if (mode == null) mode = this.displayInJudgeMode;
      if (mode) player_idx = null;
      this.predictFullMatch = null;
      this.$store.commit('setMatch', {
        match: this.fullMatch,
        player_idx: player_idx,
      })
    },
    parseLogFileData() {
      // Parse the character data and update the match object
      let data = this.matchDataInput.trim().split('\n').map(line => JSON.parse(line))
      this.dataVersion = data[0].version
      if (data[0].name == 'Main')
        this.matchData = data.map(d => d.match)
      else this.matchData = data
      this.updateMatch(this.matchData[0])
      this.currentDataIndex = 0
      this.matchDataInput = ''
    },
    showPrevData() {
      let stepCount = parseInt(this.stepCount)
      this.currentDataIndex = Math.max(0, this.currentDataIndex - stepCount);
      this.jumpToData()
    },
    showNextData() {
      let stepCount = parseInt(this.stepCount)
      this.currentDataIndex = Math.min(this.matchData.length - 1, this.currentDataIndex + stepCount);
      if (this.currentDataIndex > this.maxPlayedDataIndex)
        this.maxPlayedDataIndex = this.currentDataIndex;
      this.jumpToData()
    },
    jumpToData() {
      this.currentDataIndex = Math.min(this.matchData.length - 1, Math.max(0, this.currentDataIndex))
      this.updateMatch(this.matchData[this.currentDataIndex])
    },
    jumpToEndData() {
      this.currentDataIndex = this.matchData.length - 1;
      this.maxPlayedDataIndex = this.currentDataIndex;
      this.updateMatch(this.matchData[this.currentDataIndex])
    },
    sendInteraction() {
      let input = this.interactionInput.trim();
      if (input.length == 0) return;
      try {
        input = JSON.parse(input);
        if (Array.isArray(input) && input.length == 2) {
          this.interactionCommands = input;
          if (this.interactionCommands[this.currentRequestPlayerId].length > 1)
            this.processing = true;
          this.realSendInteraction();
          return;
        }
      }
      catch (e) {}
      this.interactionCommands[this.currentRequestPlayerId] = input.split('\n');
      if (this.interactionCommands[this.currentRequestPlayerId].length > 1)
        this.processing = true;
      this.realSendInteraction();
    },
    realSendInteraction() {
      let cid = this.currentRequestPlayerId;
      if (cid == null) {
        // no need response now. maybe network problem, re-run this function
        // later.
        setTimeout(() => this.realSendInteraction(), this.multiCommandTimeout);
        return;
      }
      let test_appear = false;
      while (this.interactionCommands[cid].length > 0 && this.interactionCommands[cid][0].slice(0, 4) == 'TEST') {
        // skip TEST commands, only save them in history.
        this.commandHistory[cid].push(this.interactionCommands[cid][0]);
        this.interactionCommands[cid] = this.interactionCommands[cid].slice(1);
        test_appear = true;
      }
      if (this.interactionCommands[cid].length == 0) {
        this.processing = false;
        if (test_appear) this.interactionInput = '';
        return;
      }
      const data = { player_idx: this.currentRequestPlayerId, command: this.interactionCommands[cid][0] };
      this.commandPOSTData = data;
      this.interactionCommands[cid] = this.interactionCommands[cid].slice(1);
      if (this.refreshTimeout != null) {
        clearTimeout(this.refreshTimeout);
      }
      fetch(this.serverURL + '/respond', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
      })
      .then(response => {
        if (!response.ok) {
          response.json().then(data => {
            throw new Error('Network response is not ok with detail ' + data.detail);
          })
          .catch(error => {
            this.make_alert('Error in sending response. ' + error, error)
            this.stopServerByError();
          });
        }
        else return response.json();
      })
      .then(data => {
        if (!data) return; // error on previous or empty data, no need to update
        console.log('Received Data', data);
        this.commandHistory[this.commandPOSTData.player_idx].push(this.commandPOSTData.command);
        this.interactionInput = '';
        console.log('HISTORY', this.commandHistory);
        if (data.length == 0) {
          // send response successfully, but no updated data. update request data.
          this.updateRequestData();
        }
        // let last_data = this.matchData[this.matchData.length - 1];
        // if (JSON.stringify(last_data) !== JSON.stringify(data))
        //   this.matchData.push(data);
        // this.currentDataIndex = this.matchData.length - 1;
        this.updateMatchData(data);
        this.refreshTimeout = setTimeout(() => this.refreshData(), this.refreshInterval);
        if (this.match.requests.length > 0)
          this.selectedRequest = this.match.requests[0];
        setTimeout(() => this.realSendInteraction(), this.multiCommandTimeout);
      })
      .catch(error => {
        this.make_alert('Error in sending response. ' + error, error);
        this.stopServerByError();
      });
    },
    decodeDiffMatchData(data) {
      let res = [];
      if (data.length == 0) return res;
      for (let i = 0; i < data.length; i ++ ) {
        if (data[i].type == 'FULL') {
          res.push(data[i]);
        }
        else {
          // type is diff
          let diffs = data[i].match_diff;
          let recover_match = JSON.parse(JSON.stringify(data[i - 1].match));
          for (let i = 0; i < diffs.length; i ++ ) {
            let diff = diffs[i];
            let key = diff[1];
            if (typeof key === 'string') key = key.split('.');
            let target = recover_match;
            // leave last key for later use
            for (let k = 0; k < key.length - 1; k ++ ) target = target[key[k]];
            key = key[key.length - 1];

            if (diff[0] == 'change') {
              target[key] = diff[2][1];
            }
            else if (diff[0] == 'add') {
              for (let r of diff[2]) {
                let rkey = r[0];
                target[key][rkey] = r[1];
              }
            }
            else if (diff[0] == 'remove') {
              for (let r of diff[2]) {
                let rkey = r[0];
                delete target[key][rkey];
                if (Array.isArray(target[key])) {
                  // for array, after remove, should delete undefined and null
                  while (target[key].length
                         && (target[key][target[key].length - 1] === undefined
                             || target[key][target[key].length - 1] === null))
                    target[key].pop();
                }
              }
            }
          }
          // var _ = require('lodash');
          // if (!_.isEqual(recover_match, data[i].match)) {
          //   console.log(data[i].match_diff);
          //   console.error('different', recover_match == data[i].match,
          //                 Object.is(recover_match, data[i].match),
          //                 _.isEqual(recover_match, data[i].match),
          //                 recover_match, data[i].match);
          // }
          data[i].match = recover_match;
          res.push(data[i]);
        }
      }
      return res;
    },
    updateMatchData(data) {
      if (data.length == 0) {
        if (this.matchData.length > this.maxPlayedDataIndex + 1) {
          this.maxPlayedDataIndex += 1;
          this.currentDataIndex = this.maxPlayedDataIndex;
          this.updateMatch(this.matchData[this.currentDataIndex]);
        }
        return;
      }
      data = this.decodeDiffMatchData(data);
      for (let i = 0; i < data.length; i ++ ) {
        let d = data[i];
        let idx = d.idx;
        let match = d.match;
        if (idx == this.matchData.length) {
          this.matchData.push(match);
          this.requestData = match.requests;
        }
        else if (idx > this.matchData.length) {
          this.make_alert('Error in update match data. ' + idx + ' is greater than current length ' + this.matchData.length, data);
        }
        else {
          this.matchData[idx] = match;
        }
      }
      this.currentDataIndex = this.matchData.length - 1;
      if (this.currentDataIndex > this.maxPlayedDataIndex) {
        this.maxPlayedDataIndex += 1;
        this.currentDataIndex = this.maxPlayedDataIndex;
      }
      this.updateMatch(this.matchData[this.currentDataIndex]);
    },
    refreshData() {
      this.wrongProtocol();
      if (this.refreshTimeout != null)
        clearTimeout(this.refreshTimeout);
      if (this.matchData.length > this.maxPlayedDataIndex + 1) {
        // in auto play, no need to refresh data
        this.updateMatchData([]);
        this.refreshTimeout = setTimeout(() => this.refreshData(), this.refreshInterval);
        return;
      }
      let next_idx = this.matchData.length;
      fetch(this.serverURL + '/state/after/' + next_idx + '/-1')
        .then(response => {
          if (!response.ok) {
            response.json().then(data => {
              throw new Error('Network response is not ok with detail ' + data.detail);
            })
            .catch(error => {
              this.make_alert('Error in refreshing data. ' + error, error)
              this.stopServerByError();
            });
          }
          else return response.json();
        })
        .then(data => {
          if (!data) return; // error on previous or empty data, no need to update
          // if (data.length > 0) console.log('Refresh data', data);
          // let last_data = this.matchData[this.matchData.length - 1];
          // if (JSON.stringify(last_data) !== JSON.stringify(data))
          //   this.matchData.push(data);
          // this.currentDataIndex = this.matchData.length - 1;
          this.updateMatchData(data);
          // if (this.match.requests.length > 0)
          //   this.selectedRequest = this.match.requests[0];
          this.updateRequestData();
          this.refreshTimeout = setTimeout(() => this.refreshData(), this.refreshInterval);
        })
        .catch(error => {
          this.make_alert('Error in refreshing data: ' + error + '\nAuto refresh stopped.', error)
          this.stopServerByError();
        });
    },
    updateRequestData() {
      fetch(this.serverURL + '/request/-1')
        .then(response => {
          if (!response.ok) {
            response.json().then(data => {
              throw new Error('Network response is not ok with detail ' + data.detail);
            })
            .catch(error => {
              this.make_alert('Error in getting requests. ' + error, error)
              this.stopServerByError();
            });
          }
          else return response.json();
        })
        .then(data => {
          if (!data) return; // error on previous or empty data, no need to update
          if (JSON.stringify(this.requestData) == JSON.stringify(data)) return;
          console.log('Request data', data);
          let old_req_data = this.requestData;
          this.requestData = data;
          let pid = this.currentRequestPlayerId;
          if (pid != null) {
            // if requests related to pid not change, do not update
            let now = old_req_data.filter(r => r.player_idx == pid);
            let receive = data.filter(r => r.player_idx == pid);
            if (JSON.stringify(now) == JSON.stringify(receive)) return;
          }
          this.updateMatch();
          if (this.match.requests.length > 0)
            this.selectedRequest = this.match.requests[0];
        })
        .catch(error => {
          this.make_alert('Error in refreshing data. ' + error, error)
          this.stopServerByError();
        });
    },
    showRequestDetails(request) {
      this.selectedRequest = request;
    },
    hideRequestDetails() {
      // this.selectedRequest = null;
    },
    selectRequest(request) {
      let request_idx = request.idx;
      let req = this.$store.state.requests[request_idx];
      if (req && req.name == 'UseSkillRequest') {
        let table = this.match.player_tables[req.player_idx];
        let char = table.charactors[table.active_charactor_idx];
        let skill = char.skills[req.skill_idx];
        this.$store.commit('setSelectedObject', {
          type: 'SKILL',
          skill_type: skill.skill_type,
          charactor_name: char.name,
          name: skill.name,
          desc: skill.desc,
          version: char.version,
        });
      }
      if (request.prediction) {
        this.predictFullMatch = request.prediction;
      }
      if (request_idx !== null && request_idx !== undefined) this.$store.commit('selectRequest', request_idx);
    },
    selectClass(title, idx) {
      if (title == 'Confirm') {
        // can use when command string is generated
        if (this.$store.state.commandString != '') {
          return 'select-highlight'
        }
        else {
          return 'select-disabled'
        }
      }
      else if (title == 'Cancel') {
        // can use when request selected or in prediction mode
        if (this.$store.state.selectedRequest != null || this.predictFullMatch) {
          return 'select-highlight'
        }
        else {
          return 'select-disabled'
        }
      }
      else {
        if (idx === undefined || idx === null) {
          // no corresponding request
          return 'select-disabled'
        }
        // for others, whether idx matches selectedRequest
        if (this.$store.state.selectedRequest == idx) {
          return 'select-highlight'
        }
        else {
          return 'select-none'
        }
      }
    },
    cancelSelection() {
      this.$store.commit('selectRequest', null);
      this.predictFullMatch = null;
    },
    confirmSelection() {
      this.predictFullMatch = null;
      if (this.$store.state.commandString == '') return
      console.log('Command: ' + this.$store.state.commandString)
      this.interactionInput = this.$store.state.commandString;
      this.sendInteraction();
    },
    clickCheckShowDeck() {
      this.wrongProtocol();
      if (this.showDeckDiv) {
        // is shown, if modified, give confirm
        if (this.$store.state.deckModifyCounter > 0) {
          let userConfirmation = confirm(
            this.$t('Deck is modified, are you sure to close it?')
          );
          if (!userConfirmation) return;
        }
        this.$store.commit('resetDeckModifyCounter', null);
        this.$store.commit('setShowDeckDiv', false);
        return;
      }
      // first receive deck info from server, then show deck div
      this.$store.commit('resetDeckModifyCounter', null);
      fetch(this.serverURL + '/decks')
        .then(response => {
          if (!response.ok) {
            response.json().then(data => {
              throw new Error('Network response is not ok with detail ' + data.detail);
            })
            .catch(error => {
              this.make_alert($t('Error in getting deck. ') + error, error)
            });
          }
          else return response.json();
        })
        .then(data => {
          this.$store.commit('setDeck', data);
          this.$store.commit('setShowDeckDiv', true);
        })
        .catch(error => {
          this.make_alert(this.$t('Error in getting deck. ') + error, error)
        });
    },
    clickStartNewMatch() {
      this.wrongProtocol();
      let userConfirmation = confirm(
        this.$t('Are you sure to start a new match?')
      );
      if (!userConfirmation) return;
      clearTimeout(this.refreshTimeout);
      this.refreshTimeout = null;
      fetch(this.$store.state.serverURL + '/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
        }),
      })
      .then(response => {
        if (!response.ok) {
          response.json().then(data => {
            throw new Error('Network response is not ok with detail ' + data.detail);
          })
          .catch(error => {
            this.make_alert('Error in reset game. ' + error, error);
          });
          throw new Error('Network response is not ok with status ' + response.status);
        }
        else return response.json();
      })
      .then(data => {
        this.clearAllData();
        this.refreshData();
      })
      .catch(error => {
        this.make_alert('Error in reset game. ' + error, error);
      });
    },
    resetByIndex() {
      let current_index = this.currentDataIndex;
      let match = this.matchData[current_index];
      if (match.requests.length == 0) {
        alert(this.$t('No available action at current index! cannot reset to this index.'));
        return;
      }
      let userConfirmation = confirm(
        this.$tc('Are you sure to reset match to current index?', this.currentDataIndex)
      );
      if (!userConfirmation) return;
      clearTimeout(this.refreshTimeout);
      this.refreshTimeout = null;
      fetch(this.$store.state.serverURL + '/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          match_state_idx: current_index,
        }),
      })
      .then(response => {
        if (!response.ok) {
          response.json().then(data => {
            throw new Error('Network response is not ok with detail ' + data.detail);
          })
          .catch(error => {
            this.make_alert('Error in reset game. ' + error, error);
          });
          throw new Error('Network response is not ok with status ' + response.status);
        }
        else return response.json();
      })
      .then(data => {
        this.clearAllData();
        this.refreshData();
      })
      .catch(error => {
        this.make_alert('Error in reset game. ' + error, error);
      });
    },
    stopRefresh() {
      clearTimeout(this.refreshTimeout);
      this.refreshTimeout = null;
    },
  },
  computed: {
    match () {
      if (!this.fullMatch || this.displayInJudgeMode || this.playerTableOrder == -1) return this.fullMatch;
      let match = JSON.parse(JSON.stringify(this.fullMatch));
      let opponent_table = match.player_tables[1 - this.playerTableOrder];
      // console.log(match, this.fullMatch)
      for (let i = 0; i < opponent_table.hands.length; i++) {
        opponent_table.hands[i].name = 'Unknown';
        opponent_table.hands[i].desc = '';
        opponent_table.hands[i].version = 'Unknown';
      }
      for (let i = 0; i < opponent_table.table_deck.length; i++) {
        opponent_table.table_deck[i].name = 'Unknown';
        opponent_table.table_deck[i].desc = '';
        opponent_table.table_deck[i].version = 'Unknown';
      }
      for (let i = 0; i < opponent_table.dice.colors.length; i ++ )
        opponent_table.dice.colors[i] = 'UNKNOWN';
      return match;
    },
    predictMatch() {
      let fm = this.predictFullMatch;
      if (!fm || this.displayInJudgeMode || this.playerTableOrder == -1) return fm;
      let match = JSON.parse(JSON.stringify(fm));
      let opponent_table = match.player_tables[1 - this.playerTableOrder];
      // console.log(match, this.fullMatch)
      for (let i = 0; i < opponent_table.hands.length; i++) {
        opponent_table.hands[i].name = 'Unknown';
        opponent_table.hands[i].desc = '';
        opponent_table.hands[i].version = 'Unknown';
      }
      for (let i = 0; i < opponent_table.table_deck.length; i++) {
        opponent_table.table_deck[i].name = 'Unknown';
        opponent_table.table_deck[i].desc = '';
        opponent_table.table_deck[i].version = 'Unknown';
      }
      for (let i = 0; i < opponent_table.dice.colors.length; i ++ )
        opponent_table.dice.colors[i] = 'UNKNOWN';
      return match;
    },
    sortedPlayerTables() {
      if (this.playerTableOrder == -1) return []
      if (this.playerTableOrder == 1) {
        return this.match.player_tables
      } else {
        return [this.match.player_tables[1], this.match.player_tables[0]]
      }
    },
    sortedPredictPlayerTables() {
      if (this.playerTableOrder == -1) return []
      if (this.playerTableOrder == 1) {
        return this.predictMatch.player_tables
      } else {
        return [this.predictMatch.player_tables[1], this.predictMatch.player_tables[0]]
      }
    },
    currentRequestPlayerId() {
      let match = this.match;
      if (!match || !match.requests || match.requests.length === 0) return null;
      if (!this.displayInJudgeMode) return this.playerTableOrder;
      return match.requests[0].player_idx;
    },
    currentRespondingPlayerId() {
      let match = this.match;
      if (!match || !match.requests || match.requests.length === 0) return null;
      // not in judge mode, and current player has request, return current player
      if (!this.displayInJudgeMode && match.requests.filter(r => r.player_idx == this.playerTableOrder).length > 0) return this.playerTableOrder;
      // otherwise, return first request player
      return match.requests[0].player_idx;
    },
    buttonRequests() {
      // requests that show in right button. current id same, and not card.
      // let res = this.match.requests.filter(request => request.player_idx === this.currentRequestPlayerId);
      let res = this.$store.state.requests;
      res = res.filter(request => request.name !== 'UseCardRequest');
      let finalres = {};
      for (let i = 0; i < this.match.skill_predictions.length; i ++ ) {
        let pred = this.match.skill_predictions[i];
        if (pred.player_idx == this.currentRequestPlayerId) {
          let name = 'UseSkill' + pred.skill_idx;
          let char = this.match.player_tables[pred.player_idx].charactors[pred.charactor_idx];
          let key = 'SKILL_' + this.$store.getters.getNameWithDesc(char) + '_' + char.skills[pred.skill_idx].skill_type + '/' + char.skills[pred.skill_idx].name;
          let diff = pred.diff;
          let fake_datas = [
            {
              type: 'FULL',
              match: this.fullMatch
            },
            {
              type: 'DIFF',
              match_diff: diff,
            }
          ];
          fake_datas = this.decodeDiffMatchData(fake_datas);
          // keep dice, hand in fake data same as original
          let fake_match = fake_datas[1].match;
          for (let i = 0; i < 2; i ++ ) {
            fake_match.player_tables[i].dice = this.fullMatch.player_tables[i].dice;
            fake_match.player_tables[i].hands = this.fullMatch.player_tables[i].hands;
          }
          // for rhodeia summon, when it is newly summoned (not appear in current match), change it to fake summon.
          // TODO: when summon number exceeded max, renew summon info is shown. Not very important, ignore it now.
          let fake_summon = {
            name: 'Oceanic Mimic: Squirrel',
            version: '3.3',
            desc: '',
            usage: '',
            max_usage: '',
            damage_elemental_type: 'HYDRO',
            damage: '',
            icon_type: 'NONE'
          }
          for (let i = 0; i < fake_match.player_tables.length; i ++ ) {
            let table = fake_match.player_tables[i];
            let ori_table = this.fullMatch.player_tables[i];
            for (let j = ori_table.summons.length; j < table.summons.length; j ++ ) {
              // only consider newly summoned
              if (
                table.summons[j].name == 'Oceanic Mimic: Squirrel'
                || table.summons[j].name == 'Oceanic Mimic: Raptor'
                || table.summons[j].name == 'Oceanic Mimic: Frog'
              ) {
                table.summons[j] = fake_summon;
              }
            }
          }
          finalres[name] = {
            title: this.$t(key),
            prediction: fake_match,
            cost: char.skills[pred.skill_idx].cost,
          };
        }
      }
      for (let i = 0; i < res.length; i++) {
        let request = res[i];
        let name = request.name.replace('Request', '');
        if (request.name == 'UseSkillRequest') {
          let skill_idx = request.skill_idx;
          finalres[name + skill_idx] = {...finalres[name + skill_idx], ...request};
          let char = this.match.player_tables[request.player_idx].charactors[request.charactor_idx];
          let key = 'SKILL_' + this.$store.getters.getNameWithDesc(char) + '_' + char.skills[skill_idx].skill_type + '/' + char.skills[skill_idx].name;
          finalres[name + skill_idx].title = this.$t(key);
        }
        else if (request.name == 'SwitchCharactorRequest') {
          let charactor_idx = request.target_charactor_idx;
          let charactors = this.match.player_tables[request.player_idx].charactors;
          let target = charactors[charactor_idx];
          let name = 'SwitchCharactor';
          request.title = this.$t('Switch To ') + this.$t('CHARACTOR/' + target.name);
          if (this.$store.state.selectedRequest !== null) {
            let selectedRequest = this.$store.state.requests[this.$store.state.selectedRequest];
            if (selectedRequest.idx == request.idx) {
              finalres[name] = request;
            }
          }
        }
        else {
          finalres[name] = request;
          request.title = this.$t({
            SwitchCard: 'Switch Card',
            RerollDice: 'Reroll Dice',
            ChooseCharactor: 'Choose Charactor',
            ElementalTuning: 'Elemental Tuning',
            DeclareRoundEnd: 'Declare Round End',
          }[name]);
        }
      }
      return finalres;
    },
    descData() {
      let data = this.$store.state.selectedObject;
      if (data === null)
        return []
      if (data.name == 'Unknown') return []
      if (data.type == 'CHARACTOR') {
        // show skills of charactors
        let res = [
          {
            type: 'CHARACTOR',
            name: data.name,
            desc: data.desc,
            version: data.version,
          }
        ];
        for (let i = 0; i < data.skills.length; i ++ ) {
          let skill = data.skills[i];
          res.push({
            type: 'SKILL_' + data.name + '_' + skill.skill_type,
            skill_type: skill.skill_type,
            name: skill.name,
            desc: skill.desc,
          })
        }
        return res;
      }
      if (data.type == 'TALENT') {
        // add charactor name into type
        let res = [
          {
            type: 'TALENT_' + data.charactor_name,
            name: data.name,
            desc: data.desc,
            version: data.version,
          }
        ];
        return res;
      }
      if (data.type == 'SKILL') {
        // add charactor name and skill type
        let res = [
          {
            type: 'SKILL_' + data.charactor_name + '_' + data.skill_type,
            skill_type: data.skill_type,
            name: data.name,
            desc: data.desc,
            version: data.version,
          }
        ];
        return res;
      }
      return [data]
    },
    isYourTurn() {
      return this.match.current_player == this.playerTableOrder
    },
    skillNotify() {
      if (!this.match) return null;
      if (this.match.last_action.type != 'USE_SKILL') return null;
      let position = this.match.last_action.skill_position;
      let skills = this.match.player_tables[position.player_idx].charactors[position.charactor_idx].skills;
      for (let i = 0; i < skills.length; i ++ ) {
        if (skills[i].id == position.id) {
          let char = this.match.player_tables[position.player_idx].charactors[position.charactor_idx];
          let ret = {
            player_id: position.player_idx,
            charactor_name: char.name,
            charactor_desc: char.desc,
            skill_type: skills[i].skill_type,
            skill_name: skills[i].name,
          };
          this.$store.commit('setSelectedObject', { version: char.version, charactor_name: char.name, ...skills[i] });
          return ret;
        }
      }
      console.error('Cannot find skill');
      return null;
    },
    cardNotify() {
      if (!this.match) return null;
      if (this.match.last_action.type != 'USE_CARD') return null;
      let position = this.match.last_action.card_position;
      let table = this.match.player_tables[position.player_idx];
      let hands = table.hands;
      let ret = {
        player_id: position.player_idx,
      };
      let full_hands = hands.slice();
      if (table.using_hand != null) full_hands.push(table.using_hand);
      for (let i = 0; i < full_hands.length; i ++ ) {
        if (full_hands[i].id == position.id) {
          ret = { ...ret, ...full_hands[i] };
          break;
        }
      }
      if (ret.name == null) {
        console.error('Cannot find card');
        return null;
      }
      this.$store.commit('setSelectedObject', ret);
      return ret;
    },
    switchNotify() {
      if (!this.match) return null;
      if (this.match.last_action.type != 'SWITCH_CHARACTOR') return null;
      let char = this.match.player_tables[this.match.last_action.player_idx].charactors[this.match.last_action.charactor_idx];
      this.$store.commit('setSelectedObject', char);
      return {
        player_id: this.match.last_action.player_idx,
        charactor_name: char.name,
        charactor_desc: char.desc,
      };
    },
    roundEndNotify() {
      if (!this.match) return null;
      if (this.match.last_action.type != 'DECLARE_ROUND_END') return null;
      return { player_id: this.match.last_action.player_idx };
    },
    waitOpponentNotify() {
      if (!this.match) return null;
      let reqs = this.match.requests.filter(
        r => (
          r.name == 'RerollDiceRequest'
          || r.name == 'SwitchCardRequest'
          || r.name == 'ChooseCharactorRequest'
        )
      );
      let self = this.currentRequestPlayerId;
      if (self == null) return null;
      let self_reqs = reqs.filter(r => r.player_idx == self);
      let opponent_reqs = reqs.filter(r => r.player_idx != self);
      if (self_reqs.length == 0 && opponent_reqs.length > 0) return true;
      return null;
    },
    showDeckDiv() {
      return this.$store.state.showDeckDiv;
    },
    serverURL: {
      get () {
        return this.$store.state.serverURL;
      },
      set (value) {
        // if URL changes, stop refreshing.
        clearTimeout(self.refreshTimeout);
        self.refreshTimeout = null;
        localStorage.setItem('serverURL', value);
        this.$store.commit('setServerURL', value);
      }
    },
    serverConnected: {
      get () {
        return this.$store.state.serverConnected;
      },
      set (value) {
        this.$store.commit('setServerConnected', value);
      }
    },
    // match: {
    //   get() {
    //     console.log('get', this._match);
    //     return this._match;
    //   },
    //   set(value) {
    //     value.modified = true;
    //     console.log('set', value);
    //     this._match = value;
    //     this.$forceUpdate();
    //   }
    // }
  },
  // watch: {
  //   buttonRequests(newVal, oldVal) {
  //     let finalres = newVal;
  //     console.log(123)
  //     console.log(finalres, Object.keys(finalres).length);
  //     if (Object.keys(finalres).length == 1) {
  //       let finalres_name = Object.keys(finalres)[0];
  //       this.$store.commit('selectRequest', finalres[finalres_name].idx)
  //     }
  //   }
  // }
}
</script>

<!-- CSS libraries -->
<style src="normalize.css/normalize.css"></style>

<!-- Global CSS -->
<style>

div {
  box-sizing: border-box;
  /* border: 1px solid black; */
}

</style>

<style scoped>

.header-div-container {
  position: relative;
  width: 100%;
  padding-bottom: 5vw;
}

.header-div {
  position: absolute;
  display: flex;
  flex-direction: row;
  justify-content: center;
  top: 0;
  left: 0;
  width: 100%;
  height: 5vw;
}

label {
  display: block;
  margin-bottom: 0.5rem;
}

.text-div {
  display: block;
  width: 20%;
  height: 100%;
  font-size: 1vw;
  /* margin-bottom: 1rem; */
  /* margin-left: 20%; */
}

textarea {
  font-family: monospace;
  font-size: 0.9em;
  border-radius: 3px;
  border: 1px solid #ccc;
  width: 95%;
  height: 100%;
}

.buttons-div, .interaction-div {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
}

.buttons-div {
  width: 13%;
}

.parse-button-container {
  text-align: center;
}

button {
  background-color: #4caf50;
  color: #fff;
  border: none;
  border-radius: 3px;
  padding: 0.25rem 1rem;
  font-size: 1em;
  cursor: pointer;
}

button:disabled {
  cursor: not-allowed !important;
  background-color: #cccccc !important;
  color: #888888 !important;
}

button:hover {
  background-color: #3e8e41;
}

.match-container {
  position: relative;
  width: 90%;
  height: 0;
  padding-bottom: 45%; /* 16:9 aspect ratio */
  /* margin-left: 10%; */
  /* display: flex;
  flex-direction: column; */
}

.desc-container {
  position: absolute;
  width: 11.11111111111%;
  padding: 1%;
  height: 100%;
  font-size: 0.75vw;
  overflow-y: scroll;
}

.player-tables-container {
  position: absolute;
  width: 88.888888888888%;
  left: 11.111111111111%;
  height: 100%;
}

.player-tables {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 50%;
}

.player-tables > * {
  height: 100%;
}

.player-tables-container{
  border: 1px solid #3e8e41;
}

.requests-button-container {
  position: absolute;
  /* left: 88.888888888889%; */
  left: 100%;
  width: 5.555555555555%;
  margin-left: 1%;
  height: 100%;
}

.prev-buttons {
  width: 100%;
  height: 66.6666666667%;
}

.prev-buttons > * {
  width: 100%;
  height: 16.6666666667%;
  padding: 5%;
}

.prev-buttons > * > *, .last-buttons > * > * {
  width: 100%;
  height: 100%;
}

.last-buttons {
  width: 100%;
  height: 33.3333333333%;
  display: flex;
  justify-content: flex-end;
  flex-direction: column;
}

.last-buttons > * {
  width: 100%;
  height: 33.3333333333%;
  padding: 5%;
}

/* styles for the data navigation buttons */
.data-navigation > div, .interaction-button-group {
  display: flex;
  justify-content: center;
  align-items: center;
}

.data-navigation {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  height: 100%;
  align-items: center;
}

.data-navigation label {
  margin: 0.1vw 0;
}

.data-navigation button, .interaction-button-group button {
  background-color: #4caf50;
  color: #fff;
  border: none;
  border-radius: 3px;
  padding: 0.25vw 0.5vw;
  font-size: 1em;
  cursor: pointer;
  margin: 0 0.25vw;
}

.data-navigation button {
  height: 60%;
}

.data-navigation button:hover {
  background-color: #3e8e41;
}

.requests-div {
  position: relative;
  width: 150px;
}

.requests-div ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
  max-height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
}

.requests-div li {
  margin-top: 5px;
  border: 3px solid #ccc;
  border-radius: 5px;
  background: #eee;
}

.request-details {
  position: relative;
  /* position: absolute;
  top: 0;
  left: -300%;
  width: 300%; */
  width: 40%;
  /* padding: 10px; */
  z-index: 9999;
}

/* styles for the player table order input */
.player-table-order {
  display: flex;
  justify-content: center;
  /* flex-direction: column; */
  align-items: center;
}

.player-table-order > label {
  display: flex;
  align-items: center;
  margin: 0vw 0vw;
}

.player-table-order input[type="radio"] {
  margin: 0 0.5vw;
}

.player-tables > * {
  border: 3px solid white;
}

.table-current-player {
  border-color: orange;
}

.table-current-request {
  background-color: aliceblue;
}

.deck-start-div {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-around;
  width: 10%;
}

.radios-div {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-around;
  width: 20%;
}

.radios-div > p {
  margin: 0.0vw 0 0 0;
  font-weight: bold;
}

.radios-div label {
  margin-bottom: 0.00vw;
}

.main-info-div {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-around;
  width: 40%;
}

.debug-refresh-freq-div {
  width: 17%;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
}

.debug-refresh-freq-div > div {
  display: flex;
  justify-content: space-around;
  height: 27.5%;
}
.debug-refresh-freq-div > .server-url-div {
  height: 45%;
}
.debug-refresh-freq-div input {
  margin: 0.2vw;
}

.server-url-div > label {
  width: 15%;
}

.server-url-div > input {
  width: 50%;
}

.server-url-div > button {
  width: 25%;
  margin: 0.2vw 0.05vw;
  padding: 0 0.05vw;
}

.freq-div > label {
  width: 60%;
}

.freq-div > input {
  width: 20%;
}

.freq-div > button {
  width: 20%;
}

.refresh-debug-div > *, .freq-div > button {
  margin: 0.2vw;
  padding: 0 0.25vw;
}

.header-div {
  font-size: 0.8vw;
}

.skill-notify-container, .switch-notify-container {
  position: absolute;
  top: 0;
  left: 11.11111111111%;
  width: 44.44444444444%;
  height: 50%;
  font-size: 1.5vw;
  display: flex;
  justify-content: center;
  align-items: center;
}

.skill-notify-container > div, .switch-notify-container > div {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 33%;
  /* width: 80%; */
  background-color: white;
  box-shadow: 0 0 0.7vw 0.7vw rgb(255, 174, 0);
  border-radius: 1000px;
  padding-right: 5%;
}

.skill-notify-container > div > img, .switch-notify-container > div > img {
  height: 100%;
}

.skill-notify-container > div > div > p, .switch-notify-container > div > div > p {
  white-space: nowrap;
  padding-left: 5%;
}

.card-notify-container {
  position: absolute;
  top: 0;
  left: 11.11111111111%;
  width: 44.44444444444%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.center-text-notify-container {
  position:absolute;
  height: 15%;
  width: 30%;
  left: 40.11111111111%;
  top: 42.5%;
  border-radius: 10000px;
  font-size: 2vw;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  background-color: white;
  box-shadow: 0 0 0.7vw 0.7vw rgb(255, 174, 0);
  padding: 0 5%;
}

.prediction-notify-container {
  opacity: 0.2;
  position: absolute;
  width: 85%;
  left: 11.111111111111%;
  height: 100%;
  font-size: 2vw;
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  pointer-events: none;
}

.prediction-notify-container > div {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 33%;
  width: 19%;
}

.card-notify-container > img {
  height: 50%;
  box-shadow: 0 0 0.7vw 0.7vw rgb(255, 174, 0);
  border-radius: 1.3vw;
}

.notify-right-part {
  left: 55.55555555555%;
}

.opponent-shadow-color {
  box-shadow: 0 0 0.7vw 0.7vw rgb(0, 145, 255) !important;
}

.deck-container {
  position: relative;
  width: 90%;
  height: 0;
  padding-bottom: 45%; /* 16:9 aspect ratio */
  /* margin-left: 10%; */
  /* display: flex;
  flex-direction: column; */
  font-size: 1vw;
}

.deck-container-inner {
  position: absolute;
  width: 88.888888888888%;
  left: 11.111111111111%;
  height: 100%;
  display: flex;
  align-items: left;
  flex-direction: column;
}

.deck-container-inner > * {
  height: 50%;
}

</style>
