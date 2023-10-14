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
          <button @click="resetByIndex()">ResetToThisIndex</button>
          <button @click="stopRefresh()">stopRefresh</button>
        </div>
      </div>
      <div class="header-div" :style="showDebug ? 'top: 8rem;' : ''">
        <div class="deck-start-div">
          <button id="check-show-deck" @click="clickCheckShowDeck" :disabled="playerTableOrder == -1">{{ $t('Check/Set Deck') }}</button>
          <button id="start-new-match" @click="clickStartNewMatch" :disabled="playerTableOrder == -1">{{ $t('Start New Match') }}</button>
        </div>
        <div class="radios-div">
          <p>{{ $t('Display Mode:') }}</p>
          <div class="judge-mode-div">
            <label>
              <input type="radio" v-model="displayInJudgeMode" :value="true" @click="commitMatchToStore(true, null)">
              {{ $t('Judge Mode (show information of all players)') }}
            </label>
            <label>
              <input type="radio" v-model="displayInJudgeMode" :value="false" @click="commitMatchToStore(false, null)">
              {{ $t('Play Mode (show information only current player)') }}
            </label>
          </div>
          <p>{{ $t('View point:') }}</p>
          <div class="player-table-order">
            <label v-for="tnum in [0, 1]">
              <input type="radio" v-model="playerTableOrder" :value="tnum" @click="commitMatchToStore(null, tnum)">
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
          <div v-if="match == null && playerTableOrder != -1">
            <div class="round-div" style="font-weight: bold; font-size: 2vw;">
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
          <div v-if="match != null && playerTableOrder != -1" style="font-size: 1vw">
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
            </div>
          </div>
        </div>
        <div class="debug-refresh-freq-div">
          <div class="server-url-div">
            <label for="server-url">{{ $t('Server URL:') }}</label>
            <input id="server-url" type="text" v-model="serverURL">
          </div>
          <div class="freq-div">
                <label for="refresh-frequency">{{ $t('Auto Refresh frequency (ms):') }}</label>
                <input id="refresh-frequency" type="number" v-model="refreshInterval" min="1">
          </div>
          <div class="refresh-debug-div">
            <button @click="changeLanguage()">Language</button>
            <button @click="refreshData" :disabled="processing || playerTableOrder == -1">{{ $t('Refresh') }}</button>
            <button @click="showDebug = !showDebug">{{ $t('Toggle Debug') }}</button>
          </div>
        </div>
      </div>
    </div>
    <div v-if="showDeckDiv" class="deck-container">
      <div class="desc-container">
        <div v-for="(desc, did) in descData">
          <h4>{{ $t(desc.type + '/' + desc.name) }}</h4>
          <p v-if="desc.version && did == 0">{{ $t('Version: ') }} {{ desc.version }}</p>
          <p v-if="desc.skill_type">{{ $t('SKILL_TYPE/' + desc.skill_type) }}</p>
          <p>{{ $t(desc.type + '/' + desc.name + '/' + descData[0].version) }}</p>
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
          <h4>{{ $t(desc.type + '/' + desc.name) }}</h4>
          <p v-if="desc.version && did == 0">{{ $t('Version: ') }} {{ desc.version }}</p>
          <p v-if="desc.skill_type">{{ $t('SKILL_TYPE/' + desc.skill_type) }}</p>
          <p>{{ $t(desc.type + '/' + desc.name + '/' + descData[0].version) }}</p>
        </div>
      </div>
      <div class="player-tables-container">
        <div class="player-tables" v-for="(playerTable, pid) in sortedPlayerTables" :key="pid" :style="'top: ' + (pid == 1 ? '50%' : '0')">
          <PlayerTable :class="{'table-current-player': match.current_player == playerTable.player_idx, 'table-current-request': currentRequestPlayerId == playerTable.player_idx}" :playerTable="playerTable" :is_reverse="pid == 0"/>
        </div>
      </div>
      <div v-if="switchNotify" :class="{ 'switch-notify-container': true, 'notify-right-part': switchNotify.player_id != playerTableOrder }">
        <div :class="{ 'opponent-shadow-color': switchNotify.player_id != playerTableOrder }">
          <img :src="$store.getters.getImagePath({ type: 'AVATAR', name: switchNotify.charactor_name })">
          <div>
            <p>{{ $t('Switch to') }} {{ $t('CHARACTOR/' + switchNotify.charactor_name) }}</p>
          </div>
        </div>
      </div>
      <div v-if="skillNotify" :class="{ 'skill-notify-container': true, 'notify-right-part': skillNotify.player_id != playerTableOrder }">
        <div :class="{ 'opponent-shadow-color': skillNotify.player_id != playerTableOrder }">
          <img :src="$store.getters.getImagePath({ type: 'AVATAR', name: skillNotify.charactor_name })">
          <div>
            <p>{{ $t('CHARACTOR/' + skillNotify.charactor_name) }} {{ $t('used') }} {{ $t('SKILL_TYPE/' + skillNotify.skill_type) }}</p>
            <p>{{ $t('SKILL_' + skillNotify.charactor_name + '_' + skillNotify.skill_type + '/' + skillNotify.skill_name) }}</p>
          </div>
        </div>
      </div>
      <div v-if="cardNotify" :class="{ 'card-notify-container': true, 'notify-right-part': cardNotify.player_id != playerTableOrder }">
        <img :src="$store.getters.getImagePath(cardNotify)" :class="{ 'opponent-shadow-color': cardNotify.player_id != playerTableOrder }">
      </div>
      <div v-if="roundEndNotify" :class="{ 'round-end-notify-container': true, 'opponent-shadow-color': roundEndNotify.player_id != playerTableOrder }">
        <span>{{ $tc((roundEndNotify.player_id != playerTableOrder ? 'Opponent' : 'You') + ' declare round end', ) }}</span>
      </div>
      <div class="requests-button-container">
        <div class="prev-buttons">
          <div v-if="key != 'DeclareRoundEnd' && key != 'SwitchCharactor'" v-for="data, key in buttonRequests" :key="key" @click="selectRequest(data.idx)" >
            <RequestButton :title="data.title" :cost="data.cost" :select_class="selectClass(data.title, data.idx)" />
          </div>
        </div>
        <div class="last-buttons">
          <div v-if="buttonRequests.SwitchCharactor" @click="selectRequest(buttonRequests.SwitchCharactor.idx)">
            <RequestButton :title="buttonRequests.SwitchCharactor.title" :cost="buttonRequests.SwitchCharactor.cost" :select_class="selectClass('Switch Charactor', buttonRequests.SwitchCharactor.idx)" />
          </div>
          <div v-if="!buttonRequests.SwitchCharactor && buttonRequests.DeclareRoundEnd" @click="selectRequest(buttonRequests.DeclareRoundEnd.idx)">
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

    // listen to ESC and ENTER key
    window.removeEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keydown', this.handleKeyDown);
  },
  methods: {
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
      alert(title + '\nFind detail in console.');
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
    updateMatch(data) {
      if (data === undefined) data = this.matchData[this.currentDataIndex];
      data = JSON.parse(JSON.stringify(data))
      data.player_tables[0].player_idx = 0
      data.player_tables[1].player_idx = 1
      let requests = data.requests
      // console.log(data, requests, this.currentDataIndex, this.matchData.length - 1)
      if (this.currentDataIndex == this.matchData.length - 1) {
        // not in last, parse requests from match
        requests = JSON.parse(JSON.stringify(this.requestData))
      }
      for (let i = 0; i < requests.length; i++) {
        let request = requests[i]
        request.idx = i
        if (request.name == 'UseCardRequest') {
          let player_idx = request.player_idx
          let card_idx = request.card_idx
          let hands = data.player_tables[player_idx].hands
          let card = hands[card_idx]
          card.cost = request.cost
          // console.log(request.name, request, request.cost)
        }
        else if (request.name == 'UseSkillRequest') {
          // console.log(request.name, request.cost)
        }
        else if (request.name == 'SwitchCharactorRequest') {
          // console.log(request.name, request.cost)
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
      this.commitMatchToStore()
    },
    commitMatchToStore(mode = null, player_idx = null) {
      if (player_idx == null) player_idx = this.playerTableOrder;
      if (mode == null) mode = this.displayInJudgeMode;
      if (mode) player_idx = null;
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
      this.jumpToData()
    },
    jumpToData() {
      this.currentDataIndex = Math.min(this.matchData.length - 1, Math.max(0, this.currentDataIndex))
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
          });
        }
        else return response.json();
      })
      .then(data => {
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
        if (this.refreshTimeout != null) {
          clearTimeout(this.refreshTimeout);
          this.refreshTimeout = setInterval(() => this.refreshData(), this.refreshInterval);
        }
        if (this.match.requests.length > 0)
          this.selectedRequest = this.match.requests[0];
        setTimeout(() => this.realSendInteraction(), this.multiCommandTimeout);
      })
      .catch(error => {
        this.make_alert('Error in sending response. ' + error, error);
      });
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
      if (this.refreshTimeout != null)
        clearTimeout(this.refreshTimeout);
      this.refreshTimeout = null;
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
            });
          }
          else return response.json();
        })
        .then(data => {
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
            });
          }
          else return response.json();
        })
        .then(data => {
          if (JSON.stringify(this.requestData) == JSON.stringify(data)) return;
          console.log('Request data', data);
          this.requestData = data;
          this.updateMatch();
          if (this.match.requests.length > 0)
            this.selectedRequest = this.match.requests[0];
        })
        .catch(error => {
          this.make_alert('Error in refreshing data. ' + error, error)
        });
    },
    showRequestDetails(request) {
      this.selectedRequest = request;
    },
    hideRequestDetails() {
      // this.selectedRequest = null;
    },
    selectRequest(request_idx) {
      let req = this.$store.state.requests[request_idx];
      if (req.name == 'UseSkillRequest') {
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
      this.$store.commit('selectRequest', request_idx);
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
        // can use when request selected
        if (this.$store.state.selectedRequest != null) {
          return 'select-highlight'
        }
        else {
          return 'select-disabled'
        }
      }
      else {
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
    },
    confirmSelection() {
      if (this.$store.state.commandString == '') return
      console.log('Command: ' + this.$store.state.commandString)
      this.interactionInput = this.$store.state.commandString;
      this.sendInteraction();
    },
    clickCheckShowDeck() {
      // first receive deck info from server, then show deck div
      if (this.showDeckDiv) {
        this.$store.commit('setShowDeckDiv', false);
        return;
      }
      fetch(this.serverURL + '/decks')
        .then(response => {
          if (!response.ok) {
            response.json().then(data => {
              throw new Error('Network response is not ok with detail ' + data.detail);
            })
            .catch(error => {
              this.make_alert('Error in getting deck. ' + error, error)
            });
          }
          else return response.json();
        })
        .then(data => {
          // console.log('Deck data', data);
          // let res = [];
          // for (let i = 0; i < data.length; i ++ ) {
          //   res.push({
          //     player_idx: i,
          //     deck: data[i],
          //   });
          // }
          // if (this.playerTableOrder == 0) {
          //   res.reverse();
          // }
          this.$store.commit('setDeck', data);
          this.$store.commit('setShowDeckDiv', true);
        })
        .catch(error => {
          this.make_alert('Error in getting deck. ' + error, error)
        });
    },
    clickStartNewMatch() {
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
        document.activeElement.blur();
        this.$store.commit('setShowDeckDiv', false);
        clearTimeout(this.refreshTimeout);
        this.matchData = [];
        this.currentDataIndex = 0;
        this.maxPlayedDataIndex = 0;
        this.interactionCommands = [[], []];
        this.commandHistory = [[], []];
        alert(this.$t('Game reset successfully!'));
        this.refreshData();
      })
      .catch(error => {
        this.make_alert('Error in reset game. ' + error, error);
      });
    },
    resetByIndex() {
      let current_index = this.currentDataIndex;
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
        document.activeElement.blur();
        this.$store.commit('setShowDeckDiv', false);
        clearTimeout(this.refreshTimeout);
        this.matchData = [];
        this.currentDataIndex = 0;
        this.maxPlayedDataIndex = 0;
        this.interactionCommands = [[], []];
        this.commandHistory = [[], []];
        alert(this.$t('Game reset successfully!'));
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
        opponent_table.hands[i].desc = 'Unknown';
        opponent_table.hands[i].version = 'Unknown';
      }
      for (let i = 0; i < opponent_table.table_deck.length; i++) {
        opponent_table.table_deck[i].name = 'Unknown';
        opponent_table.table_deck[i].desc = 'Unknown';
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
    currentRequestPlayerId() {
      let match = this.match;
      if (!match || !match.requests || match.requests.length === 0) return null;
      if (!this.displayInJudgeMode) return this.playerTableOrder;
      return match.requests[0].player_idx;
    },
    buttonRequests() {
      // requests that show in right button. current id same, and not card.
      let res = this.match.requests.filter(request => request.player_idx === this.currentRequestPlayerId);
      res = res.filter(request => request.name !== 'UseCardRequest');
      let finalres = {};
      for (let i = 0; i < res.length; i++) {
        let request = res[i];
        let name = request.name.replace('Request', '');
        if (request.name == 'UseSkillRequest') {
          let skill_idx = request.skill_idx;
          finalres[name + skill_idx] = request;
          let char = this.match.player_tables[request.player_idx].charactors[request.charactor_idx];
          let key = 'SKILL_' + char.name + '_' + char.skills[skill_idx].skill_type + '/' + char.skills[skill_idx].name;
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
          let ret = {
            player_id: position.player_idx,
            charactor_name: this.match.player_tables[position.player_idx].charactors[position.charactor_idx].name,
            skill_type: skills[i].skill_type,
            skill_name: skills[i].name,
          };
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
      let hands = this.fullMatch.player_tables[position.player_idx].hands;
      let ret = {
        player_id: position.player_idx,
      };
      for (let i = 0; i < hands.length; i ++ ) {
        if (hands[i].id == position.id) {
          ret = { ...ret, ...hands[i] };
          break;
        }
      }
      if (ret.name == null) {
        console.error('Cannot find card');
        return null;
      }
      return ret;
    },
    switchNotify() {
      if (!this.match) return null;
      if (this.match.last_action.type != 'SWITCH_CHARACTOR') return null;
      let char = this.match.player_tables[this.match.last_action.player_idx].charactors[this.match.last_action.charactor_idx];
      return { player_id: this.match.last_action.player_idx, charactor_name: char.name };
    },
    roundEndNotify() {
      if (!this.match) return null;
      if (this.match.last_action.type != 'DECLARE_ROUND_END') return null;
      return { player_id: this.match.last_action.player_idx };
    },
    showDeckDiv() {
      return this.$store.state.showDeckDiv;
    },
    serverURL: {
      get () {
        return this.$store.state.serverURL;
      },
      set (value) {
        this.$store.commit('setServerURL', value);
      }
    }
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
  width: 15%;
}

.parse-button-container {
  text-align: center;
}

button {
  background-color: #4caf50;
  color: #fff;
  border: none;
  border-radius: 3px;
  padding: 0.5rem 1rem;
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
  width: 15%;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
}

.debug-refresh-freq-div > div {
  display: flex;
  justify-content: space-around;
  height: 30%;
}
.debug-refresh-freq-div input {
  margin: 0.2vw;
}

.freq-div > * {
  width: 50%;
}

.refresh-debug-div > * {
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

.round-end-notify-container {
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
