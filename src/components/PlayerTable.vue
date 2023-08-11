<template>
  <div :class="tableClass">
    <div class="dice">
      <div v-for="die in playerTable.dice" :key="die">{{ die.color }}</div>
    </div>
    <div class="supports-charactors-summons">
      <div class="supports">
        <!-- <h3>Supports</h3> -->
        <div v-for="support in playerTable.supports" :key="support.id">
          <Support :support="support" />
        </div>
      </div>

      <div class="charactors">
        <!-- <h3>Characters</h3> -->
        <div class="charactor-div" v-for="(charactor, cid) in playerTable.charactors" :key="charactor.id">
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
  width: 65%;
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

.charactors > * > .charactor-inner {
  height: 82.72%;
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
  position: absolute;
  left: 95%;
  display: flex;
  flex-direction: column;
  width: 5%;
}
</style>
