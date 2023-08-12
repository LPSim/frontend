<template>
  <div :class="tableClass">
    <div class="supports-charactors-summons">
      <div class="supports">
        <!-- <h3>Supports</h3> -->
        <div v-for="support in playerTable.supports" :key="support.id">
          <Support :support="support" />
        </div>
      </div>

      <div class="charactors">
        <!-- <h3>Characters</h3> -->
        <div :class="{'charactor-div': true, 'charactor-div-active': cid == playerTable.active_charactor_id}" v-for="(charactor, cid) in playerTable.charactors" :key="charactor.id">
          <div class="active-div" v-if="(playerTable.active_charactor_id != cid) != is_reverse"></div>
          <Charactor class="charactor-inner" :charactor="charactor" />
          <div class="team-status" v-if="playerTable.active_charactor_id == cid">
            <!-- <h3>Team Status</h3> -->
            <div v-for="status in playerTable.team_status" :key="status">{{ status }}</div>
          </div>
        </div>
      </div>

      <div class="summons">
        <!-- <h3>Summons</h3> -->
        <div v-for="summon in playerTable.summons" :key="summon.id">
          <Summon :summon="summon" />
        </div>
      </div>
      <div class="dice">
        <div v-for="(die, did) in playerTable.dice" :key="did">
          <img class="cost-img" :src="'collector/icon/COST_' + die.color + '.png'" :alt="die" />
          <img class="element-img" v-if="die.color != 'OMNI'" :src="'collector/icon/ELEMENT_' + die.color + '.png'" :alt="die" />
        </div>
      </div>
    </div>
    <div class="player-info">
      <div class="player-name">{{ playerTable.player_name }}</div>

      <div class="round-ended" v-if="playerTable.has_round_ended">Round has ended</div>
      <div class="round-ended" v-else>Round has not ended</div>
      <div class="table-deck" v-if="show_table_deck">
        <!-- <h3>Table Deck</h3> -->
        <div v-for="card in playerTable.table_deck" :key="card.id">
          <Card :card="card" />
        </div>
      </div>
      <div class="table-deck" v-else>Table Deck: {{ playerTable.table_deck.length }} cards</div>

      <div class="hands">
        <!-- <h3>Hands</h3> -->
        <div v-for="card in playerTable.hands" :key="card.id">
          <Card :card="card" />
        </div>
      </div>
    </div>
  </div>
</template>
  
<script>
import Charactor from './Charactor.vue'
import Summon from './Summon.vue'
import Card from './Card.vue'
import Support from './Support.vue'

export default {
  name: 'PlayerTable',
  props: {
    playerTable: {
      type: Object,
      required: true,
      validator: (value) => {
        return 'name' in value && 'player_name' in value && 'player_icon' in value && 'active_charactor_id' in value && 'has_round_ended' in value && 'dice' in value && 'team_status' in value && 'charactors' in value && 'summons' in value && 'supports' in value && 'hands' in value && 'table_deck' in value
      }
    },
    show_table_deck: {
      type: Boolean,
      default: false
    },
    is_reverse: {
      type: Boolean,
      default: false
    }
  },
  components: {
    Charactor,
    Summon,
    Card,
    Support
  },
  computed: {
    tableClass() {
      return this.is_reverse ? 'player-table-reverse' : 'player-table-normal';
    }
  }
}
</script>

<style scoped>

.player-table-normal, .player-table-reverse {
  display: flex;
  flex-direction: column;
}

.player-table-reverse {
  flex-direction: column-reverse;
}

.player-info {
  display: flex;
  flex-direction: row;
  justify-content: left;
  align-items: center;
  height: 33%;
}

.player-name, .round-ended, .table-deck {
  width: 10%;
  /* height: 100%; */
}

.table-deck {
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 10%;
}

.hands {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
  width: 70%;
  height: 100%;
}

.hands > * {
  width: 7.7%;
  height: 100%;
}

.supports-charactors-summons {
  display: flex;
  flex-direction: row;
  justify-content: left;
  align-items: flex-start;
  height: 67%;
}

.supports {
  display: flex;
  flex-direction: row;
  width: 17.5%;
  height: 100%;
}

.charactors {
  display: flex;
  flex-direction: row;
  justify-content:space-around;
  width: 60%;
  height: 100%;
}

.charactors > * {
  width: 13.5%;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.charactors > * > .team-status {
  height: 8.64%;
}

.charactors > * > .active-div {
  height: 8.64%;
}

.charactors > * > .charactor-inner {
  height: 82.72%;
}

.charactor-div-active > .charactor-inner {
  border: 0px solid goldenrod;
  /* background-color: goldenrod; */
}

.summons {
  display: flex;
  flex-direction: row;
  width: 17.5%;
  height: 100%;
}

.team-status {
  display: flex;
  flex-direction: row;
}

.dice {
  /* position: absolute; */
  /* left: 95.7%; */
  display: flex;
  flex-direction: column;
  width: 4.35%;
  margin-left: 0.65%;
  height: 100%;
  flex-wrap: wrap;
}

.dice > * {
  width: 50%;
  height: 12.5%;
  position: relative;
}

.dice > * > img {
  position: absolute;
  width: 100%;
  height: 100%;
}

.dice > * > .element-img {
  width: 80%;
  height: 80%;
  top: 10%;
  left: 10%;
}

</style>
