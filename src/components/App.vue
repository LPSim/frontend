<template>
  <div id="app">
    <div class="header-div-container" :style="showDebug ? 'padding-bottom: 16rem' : ''">
      <div class="header-div" v-if="showDebug">
        <div class="interaction-div">
          <div style="height: 60%; padding: 5%;">
            <textarea v-model="interactionInput" @keydown.enter.prevent="sendInteraction" :disabled="processing"></textarea>
          </div>
          <div class="interaction-button-group">
            <button @click="sendInteraction" :disabled="processing">Send</button>
            <button @click="refreshData" :disabled="processing">Refresh</button>
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
          <h4>Upload replay file:</h4>
          <input type="file" ref="fileInput" @change="handleFileSelect" :disabled="processing">
        </div>
      </div>
      <div class="header-div" :style="showDebug ? 'top: 8rem;' : ''">
        <div class="radios-div">
          <p>Display Mode:</p>
          <div class="judge-mode-div">
            <label>
              <input type="radio" v-model="displayInJudgeMode" :value="true" @click="commitMatchToStore(true, null)">
              Judge Mode (show information of all players)
            </label>
            <label>
              <input type="radio" v-model="displayInJudgeMode" :value="false" @click="commitMatchToStore(false, null)">
              Play Mode (show information only current player)
            </label>
          </div>
          <p>View point:</p>
          <div class="player-table-order" v-if="match != null">
            <label v-for="table, tnum in match.player_tables">
              <input type="radio" v-model="playerTableOrder" :value="tnum" @click="commitMatchToStore(null, tnum)">
              Player {{ tnum }}: {{ table.player_name }}
            </label>
          </div>
        </div>
        <div class="main-info-div">
          <div v-if="match == null && playerTableOrder == -1">
            <div class="round-div" style="font-weight: bold; font-size: 2rem;">
              No Match Data. <br>Refresh or load replay in debug.
            </div>
          </div>
          <div v-if="match != null && playerTableOrder == -1">
            <div class="round-div" style="font-weight: bold; font-size: 2rem;">
              Please select view point.
            </div>
          </div>
          <div v-if="match != null && playerTableOrder != -1">
            <div class="round-div" style="font-weight: bold; font-size: 2rem;">
              Round {{ match.round_number }}
            </div>
          </div>
          <div v-if="match != null && playerTableOrder != -1">
            <div class="match-state-div">
              Current Match State: {{ match.state }}
            </div>
          </div>
          <div v-if="match != null && playerTableOrder != -1">
            <div class="your-turn-div">
              Current is {{ isYourTurn ? '' : 'Not ' }} Your Turn
            </div>
          </div>
        </div>
        <div class="buttons-div">
          <div class="data-navigation">
            <div>
              <div class="step-count">
                <label for="step-count-input">Step count:</label>
                <input id="step-count-input" type="number" v-model="stepCount" min="1" max="1000">
              </div>
              <button @click="showPrevData" :disabled="currentDataIndex === 0">Prev</button>
              <button @click="showNextData" :disabled="currentDataIndex === matchData.length - 1">Next</button>
            </div>
            <div>
              <div class="current-step">
                <label for="current-step-input">Current step:</label>
                <input id="current-step-input" type="number" v-model="currentDataIndex" @keydown.enter="jumpToData" min="0" :max="matchData.length - 1">
              </div>
              <button @click="jumpToData">Jump</button>
            </div>
          </div>
        </div>
        <div class="debug-refresh-freq-div">
          <div class="freq-div">
                <label for="refresh-frequency">Refresh frequency:</label>
                <input id="refresh-frequency" type="number" v-model="multiCommandTimeout" min="1">
          </div>
          <div class="refresh-debug-div">
            <button @click="refreshData" :disabled="processing">Refresh</button>
            <button @click="showDebug = !showDebug">Toggle Debug</button>
          </div>
        </div>
      </div>
    </div>
    <div class="match-container" v-if="match != null">
      <div class="desc-container">
        <div v-for="desc in descData">
          <h4>{{ desc.name }}</h4>
          <p v-if="desc.version">Version: {{ desc.version }}</p>
          <p>{{ desc.desc }}</p>
        </div>
      </div>
      <div class="player-tables-container">
        <div class="player-tables" v-for="(playerTable, pid) in sortedPlayerTables" :key="pid" :style="'top: ' + (pid == 1 ? '50%' : '0')">
          <PlayerTable :class="{'table-current-player': match.current_player == playerTable.player_idx, 'table-current-request': currentRequestPlayerId == playerTable.player_idx}" :playerTable="playerTable" :is_reverse="pid == 0"/>
        </div>
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
            <RequestButton title="Declare Round End" :select_class="selectClass('Declare Round End', buttonRequests.DeclareRoundEnd.idx)" />
          </div>
          <div @click="confirmSelection">
            <RequestButton title="Confirm" :select_class="selectClass('Confirm')" />
          </div>
          <div @click="cancelSelection">
            <RequestButton title="Cancel" :select_class="selectClass('Cancel')" />
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

export default {
  name: 'App',
  components: {
    PlayerTable,
    RequestDetails,
    RequestButton
},
  data() {
    return {
      dataVersion: null,
      matchDataInput: 'Loading...',
      matchData: [],
      currentDataIndex: 0,
      fullMatch: null,
      playerTableOrder: -1,
      stepCount: 1,
      processing: false,
      selectedRequest: null,
      commandPOSTData: null,
      interactionInput: '',
      interactionCommands: [[], []],
      commandHistory: [[], []],
      multiCommandTimeout: 200,
      showDebug: false,
      displayInJudgeMode: false,
    }
  },
  created() {
    console.log('APP', this);
    console.log('STORE', this.$store.state);

    // auto load logs.txt. when debug, it avoids manually loading data.
    // const logFilePath = 'logs.txt';
    // const xhr = new XMLHttpRequest();
    // xhr.onreadystatechange = () => {
    //   if (xhr.readyState === 4) {
    //     this.processing = false;
    //     this.matchDataInput = '';
    //     if (xhr.status === 200) {
    //       this.matchDataInput = xhr.responseText;
    //       this.parseCharactorData();
    //     }
    //   }
    // };
    // xhr.open('GET', logFilePath, true);
    // xhr.send();
    // this.processing = true;

    // listen to ESC and ENTER key
    window.removeEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keydown', this.handleKeyDown);
  },
  methods: {
    handleFileSelect() {
      const file = this.$refs.fileInput.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.matchDataInput = reader.result;
        this.parseCharactorData();
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
      data = JSON.parse(JSON.stringify(data))
      data.player_tables[0].player_idx = 0
      data.player_tables[1].player_idx = 1
      let requests = data.requests
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
    parseCharactorData() {
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
      catch (e) { }
      this.interactionCommands[this.currentRequestPlayerId] = input.split('\n');
      if (this.interactionCommands[this.currentRequestPlayerId].length > 1)
        this.processing = true;
      this.realSendInteraction();
    },
    realSendInteraction() {
      let cid = this.currentRequestPlayerId;
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
      fetch('http://localhost:8000/respond', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
      })
      .then(response => {
        if (!response.ok) {
          response.json().then(json => console.log(json));
          throw new Error('HTTP error ' + response.status);
        }
        return response.json();
      })
      .then(data => {
        console.log('Received Data', data);
        this.commandHistory[this.commandPOSTData.player_idx].push(this.commandPOSTData.command);
        this.interactionInput = '';
        console.log(this.commandHistory);
        let last_data = this.matchData[this.matchData.length - 1];
        if (JSON.stringify(last_data) !== JSON.stringify(data))
          this.matchData.push(data);
        this.currentDataIndex = this.matchData.length - 1;
        this.updateMatch(data);
        if (this.match.requests.length > 0)
          this.selectedRequest = this.match.requests[0];
        setTimeout(() => this.realSendInteraction(), this.multiCommandTimeout);
      })
      .catch(error => {
        console.error(error);
      });
    },
    refreshData() {
      fetch('http://localhost:8000/state/1')
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(data => {
          console.log(data);
          let last_data = this.matchData[this.matchData.length - 1];
          if (JSON.stringify(last_data) !== JSON.stringify(data))
            this.matchData.push(data);
          this.currentDataIndex = this.matchData.length - 1;
          this.updateMatch(data);
          if (this.match.requests.length > 0)
            this.selectedRequest = this.match.requests[0];
        })
        .catch(error => {
          console.error(error);
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
        this.$store.commit('setSelectedObject', skill);
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
    }
  },
  computed: {
    match () {
      if (!this.fullMatch || this.displayInJudgeMode || this.playerTableOrder == -1) return this.fullMatch;
      let match = JSON.parse(JSON.stringify(this.fullMatch));
      let opponent_table = match.player_tables[1 - this.playerTableOrder];
      for (let i = 0; i < opponent_table.hands.length; i++) {
        opponent_table.hands[i].name = 'Unknown';
        opponent_table.hands[i].desc = 'Unknown';
        opponent_table.hands[i].version = 'Unknown';
      }
      for (let i = 0; i < opponent_table.table_deck.length; i++) {
        opponent_table.hands[i].name = 'Unknown';
        opponent_table.hands[i].desc = 'Unknown';
        opponent_table.hands[i].version = 'Unknown';
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
          finalres[name + skill_idx].title = this.match.player_tables[request.player_idx].charactors[request.charactor_idx].skills[skill_idx].name;
        }
        else if (request.name == 'SwitchCharactorRequest') {
          let charactor_idx = request.target_charactor_idx;
          let charactors = this.match.player_tables[request.player_idx].charactors;
          let target = charactors[charactor_idx];
          let name = 'SwitchCharactor';
          request.title = 'Switch To ' + target.name;
          if (this.$store.state.selectedRequest !== null) {
            let selectedRequest = this.$store.state.requests[this.$store.state.selectedRequest];
            if (selectedRequest.idx == request.idx) {
              finalres[name] = request;
            }
          }
        }
        else {
          finalres[name] = request;
          request.title = {
            SwitchCard: 'Switch Card',
            RerollDice: 'Reroll Dice',
            ChooseCharactor: 'Choose Charactor',
            ElementalTuning: 'Elemental Tuning',
            DeclareRoundEnd: 'Declare Round End',
          }[name];
        }
      }
      return finalres;
    },
    descData() {
      let data = this.$store.state.selectedObject;
      if (data === null)
        return [{ name: '', version: '', desc: ''}]
      if (data.name.indexOf('\n') != -1) {
        let res = []
        let names = data.name.split('\n')
        let descs = data.desc.split('\n')
        for (let i = 0; i < names.length; i++) {
          res.push({ name: names[i], desc: descs[i] })
        }
        res[0].version = data.version
        return res
      }
      return [data]
    },
    isYourTurn() {
      return this.match.current_player == this.playerTableOrder
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
  padding-bottom: 8rem;
}

.header-div {
  position: absolute;
  display: flex;
  flex-direction: row;
  justify-content: center;
  top: 0;
  left: 0;
  width: 100%;
  height: 8rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
}

.text-div {
  display: block;
  width: 20%;
  height: 100%;
  padding: 1rem;
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
  width: 17%;
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
  font-size: 1vw;
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
}

.data-navigation {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  height: 100%;
}

.data-navigation label {
  margin: 0.25rem 0rem;
}

.data-navigation button, .interaction-button-group button {
  background-color: #4caf50;
  color: #fff;
  border: none;
  border-radius: 3px;
  padding: 0.5rem 1rem;
  font-size: 1em;
  cursor: pointer;
  margin: 0 0.5rem;
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
  margin: 0.25rem 0rem;
}

.player-table-order input[type="radio"] {
  margin: 0.5rem;
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

.radios-div {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-around;
  width: 30%;
}

.radios-div > p {
  margin: 0.5rem 0 0 0;
  font-weight: bold;
}

.radios-div label {
  margin-bottom: 0.25rem;
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
  width: 13%;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
}

.debug-refresh-freq-div > div {
  display: flex;
  justify-content: space-around;
}

.freq-div > * {
  width: 50%;
}

.refresh-debug-div > * {
  margin: 0.5rem;
}

</style>
