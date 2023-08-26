<template>
  <div id="app">
    <div class="header-div-container">
      <div class="header-div">
        <div class="text-div">
          <textarea id="DataInput" v-model="matchDataInput" :disabled="processing"></textarea>
        </div>
        <div class="buttons-div">
          <div class="parse-button-container">
            <button @click="parseCharactorData">Parse</button>
          </div>
          <div class="player-table-order">
            <label>
              <input type="radio" v-model="playerTableOrder" value="0"> Player Table 0 First
            </label>
            <label>
              <input type="radio" v-model="playerTableOrder" value="1"> Player Table 1 First
            </label>
          </div>
          <div class="data-navigation">
            <div class="step-count">
              <label for="step-count-input">Step count:</label>
              <input id="step-count-input" type="number" v-model="stepCount" min="1" max="1000">
            </div>
            <button @click="showPrevData" :disabled="currentDataIndex === 0">Prev</button>
            <button @click="showNextData" :disabled="currentDataIndex === matchData.length - 1">Next</button>
            <div class="current-step">
              <label for="current-step-input">Current step:</label>
              <input id="current-step-input" type="number" v-model="currentDataIndex" @keydown.enter="jumpToData" min="0" :max="matchData.length - 1">
            </div>
            <button @click="jumpToData">Jump</button>
          </div>
          <div v-if="match != null">
            <div class="base-info-div">
              Round number: {{ match.round_number }}. Current status: {{ match.match_state }}
            </div>
          </div>
        </div>
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
            <li v-for="(request, rid) in match.requests.filter(request => request.player_id === 1)" :key="rid" @mouseover="showRequestDetails(request)" @mouseout="hideRequestDetails()">
              {{ request.name.replace('Request', '') }}
            </li>
          </ul>
        </div>
        <div class="request-details">
          <RequestDetails :selectedRequest="selectedRequest" />
        </div>
      </div>
    </div>
    <div class="player-tables-container" v-if="match != null">
      <div class="player-tables" v-for="(playerTable, pid) in sortedPlayerTables" :key="pid" :style="'top: ' + (pid == 1 ? '50%' : '0')">
        <PlayerTable :class="{'table-current-player': match.current_player == pid}" :playerTable="playerTable" :is_reverse="pid == 0"/>
      </div>
    </div>
  </div>
</template>

<script>
import PlayerTable from './PlayerTable.vue'
import RequestDetails from './RequestDetails.vue';

export default {
  name: 'App',
  components: {
    PlayerTable,
    RequestDetails
},
  data() {
    return {
      dataVersion: null,
      matchDataInput: 'Loading...',
      matchData: [],
      currentDataIndex: 0,
      match: null,
      playerTableOrder: '0',
      stepCount: 1,
      processing: false,
      selectedRequest: null,
      commandPOSTData: null,
      interactionInput: '',
      interactionCommands: [],
      commandHistory: [],
    }
  },
  created() {
    const logFilePath = 'logs.txt';
    const xhr = new XMLHttpRequest();

    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        this.processing = false;
        this.matchDataInput = '';
        if (xhr.status === 200) {
          this.matchDataInput = xhr.responseText;
          this.parseCharactorData();
        }
      }
    };

    xhr.open('GET', logFilePath, true);
    xhr.send();
    this.processing = true;
  },
  methods: {
    updateMatch(data) {
      data = JSON.parse(JSON.stringify(data))
      let requests = data.requests
      for (let i = 0; i < requests.length; i++) {
        let request = requests[i]
        if (request.name == 'UseCardRequest') {
          let player_id = request.player_id
          let card_id = request.card_id
          let hands = data.player_tables[player_id].hands
          let card = hands[card_id]
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
      this.match = data
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
      this.interactionCommands = input.split('\n');
      if (this.interactionCommands.length > 1)
        this.processing = true;
      this.realSendInteraction();
    },
    realSendInteraction() {
      if (this.interactionCommands.length == 0) {
        this.processing = false;
        return;
      }
      const data = { player_id: 1, command: this.interactionCommands[0] };
      this.commandPOSTData = data;
      this.interactionCommands = this.interactionCommands.slice(1);
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
        console.log(data);
        this.commandHistory.push(this.commandPOSTData.command);
        this.interactionInput = '';
        console.log(this.commandHistory);
        let last_data = this.matchData[this.matchData.length - 1];
        if (JSON.stringify(last_data) !== JSON.stringify(data))
          this.matchData.push(data);
        this.updateMatch(data);
        if (this.match.requests.length > 0)
          this.selectedRequest = this.match.requests[0];
        setTimeout(() => this.realSendInteraction(), 1000);
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
    }
  },
  computed: {
    sortedPlayerTables() {
      if (this.playerTableOrder === '0') {
        return this.match.player_tables
      } else {
        return [this.match.player_tables[1], this.match.player_tables[0]]
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
  }
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
  height: 100%;
}

label {
  display: block;
  margin-bottom: 0.5rem;
}

.text-div {
  display: block;
  width: 10%;
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

.player-tables-container {
  position: relative;
  width: 80%;
  height: 0;
  padding-bottom: 45%; /* 16:9 aspect ratio */
  margin-left: 10%;
  /* display: flex;
  flex-direction: column; */
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

/* styles for the data navigation buttons */
.data-navigation, .interaction-button-group {
  display: flex;
  justify-content: center;
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

.base-info-div {
  text-align: center;
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
}

.player-table-order label {
  display: flex;
  align-items: center;
  margin: 0 1rem;
}

.player-table-order input[type="radio"] {
  margin-right: 0.5rem;
}

.player-tables > * {
  border: 3px solid white;
}

.table-current-player {
  border-color: orange;
}

</style>
