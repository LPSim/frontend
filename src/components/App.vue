<template>
  <div id="app">
    <div class="header-div-container">
      <div class="header-div">
        <div class="text-div">
          <textarea id="DataInput" v-model="matchDataInput"></textarea>
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
              <input id="current-step-input" type="number" v-model="currentDataIndex" @keyup.enter="jumpToData" min="0" :max="matchData.length - 1">
            </div>
            <button @click="jumpToData">Jump</button>
          </div>
          <div v-if="match != null">
            <div class="base-info-div">
              Round number: {{ match.round_number }}. Current status: {{ match.match_state }}
            </div>
          </div>
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

export default {
  name: 'App',
  components: {
    PlayerTable
  },
  data() {
    return {
      dataVersion: null,
      matchDataInput: '',
      matchData: [],
      currentDataIndex: 0,
      match: null,
      playerTableOrder: '0',
      stepCount: 1
    }
  },
  methods: {
    parseCharactorData() {
      // Parse the character data and update the match object
      let data = this.matchDataInput.trim().split('\n').map(line => JSON.parse(line))
      this.dataVersion = data[0].version
      this.matchData = data.map(d => d.match)
      this.match = this.matchData[0]
      this.currentDataIndex = 0
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
      this.match = this.matchData[this.currentDataIndex]
    }
  },
  computed: {
    sortedPlayerTables() {
      if (this.playerTableOrder === '0') {
        return this.match.player_tables
      } else {
        return [this.match.player_tables[1], this.match.player_tables[0]]
      }
    }
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
  width: 60%;
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

.buttons-div {
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
.data-navigation {
  display: flex;
  justify-content: center;
}

.data-navigation button {
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
