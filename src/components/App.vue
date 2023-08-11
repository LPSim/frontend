<template>
  <div id="app">
    <div>
      <label for="charactorDataInput">Enter character data:</label>
      <textarea id="charactorDataInput" v-model="matchDataInput"></textarea>
      <button @click="parseCharactorData">Parse</button>
    </div>
    <div>
      <label>
        <input type="radio" v-model="playerTableOrder" value="0"> Player Table 0 First
      </label>
      <label>
        <input type="radio" v-model="playerTableOrder" value="1"> Player Table 1 First
      </label>
    </div>
    <!-- <div class="player-tables" v-if="match != null">
      <h3>Player Tables</h3>
      <div v-for="(playerTable, pid) in sortedPlayerTables" :key="pid">
        <PlayerTable :playerTable="playerTable" :is_reverse="pid == 0"/>
      </div>
    </div> -->
    <div class="player-tables-container" v-if="match != null">
      <!-- <h3>Player Tables</h3> -->
      <div class="player-tables" v-for="(playerTable, pid) in sortedPlayerTables" :key="pid" :style="'top: ' + (pid == 1 ? '50%' : '0')">
        <PlayerTable :playerTable="playerTable" :is_reverse="pid == 0"/>
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
      match: null,
      playerTableOrder: '0'
    }
  },
  methods: {
    parseCharactorData() {
      // Parse the character data and update the match object
      let data = JSON.parse(this.matchDataInput)
      this.dataVersion = data.version
      this.match = data.match
      console.log('version', this.dataVersion)
      console.log('match', this.match)
    },
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
  border: 1px solid black;
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

.blablabla, .player-tables, .player-tables-container{
  border: 1px solid #3e8e41;
}

</style>
