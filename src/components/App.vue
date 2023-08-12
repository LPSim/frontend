<template>
  <div id="app">
    <div>
      <label for="DataInput">Enter data:</label>
      <textarea id="DataInput" v-model="matchDataInput"></textarea>
      <div class="parse-button-container">
        <button @click="parseCharactorData">Parse</button>
      </div>
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
      <button @click="showPrevData" :disabled="currentDataIndex === 0">Prev</button>
      <button @click="showNextData" :disabled="currentDataIndex === matchData.length - 1">Next</button>
    </div>
    <div v-if="match != null">
      <div class="base-info-div">
        Round number: {{ match.round_number }}. Current status: {{ match.match_state }}
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
      playerTableOrder: '0'
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
      if (this.currentDataIndex > 0) {
        this.currentDataIndex--
        this.match = this.matchData[this.currentDataIndex]
      }
    },
    showNextData() {
      if (this.currentDataIndex < this.matchData.length - 1) {
        this.currentDataIndex++
        this.match = this.matchData[this.currentDataIndex]
      }
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

label {
  display: block;
  margin-bottom: 0.5rem;
}

textarea {
  display: block;
  width: 100%;
  height: 6rem;
  margin-bottom: 1rem;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 3px;
  font-family: monospace;
  font-size: 0.9em;
}

.parse-button-container {
  text-align: center;
  margin-bottom: 1rem;
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
  width: 100%;
  height: 0;
  padding-bottom: 56.25%; /* 16:9 aspect ratio */
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
  margin-bottom: 1rem;
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
  margin-bottom: 1rem;
}

/* styles for the player table order input */
.player-table-order {
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
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
