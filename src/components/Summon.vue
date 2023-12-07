<template>
  <div :class="'summon ' + selectClass" @click="log_data">
    <img class="main-img" :src="image_path('SUMMON', summon.name, summon.desc)" :alt="$t('SUMMON/' + summon.name)"/>
    <div class="summon-usage-div">
      <div>
        <img v-if="summon.icon_type != 'NONE'" :src="image_path('ICON', summon.icon_type)" :alt="summon.icon_type" width="100%" height="100%" />
        <div class="span-div">
          <span>{{ summon.usage }}</span>
        </div>
      </div>
    </div>
    <div class="damage-div">
      <div>
        <img :src="image_path('ELEMENT', summon.damage_elemental_type)" :alt="summon.damage_elemental_type" width="100%" height="100%" />
        <div class="span-div">
          <span>{{ summon.damage_elemental_type == 'HEAL' ? - summon.damage : summon.damage }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Summon',
  props: {
    summon: {
      type: Object,
      required: true,
      validator: (value) => {
        return true
        // return 'name' in value && 'elementalType' in value && 'counter' in value && 'counterType' in value
      }
    },
    selectClass: {
      type: String,
      default: 'select-none'
    }
  },
  methods: {
    log_data() {
      console.log('SUMMON', JSON.parse(JSON.stringify(this.summon)))
      this.$store.commit('setSelectedObject', this.summon);
    },
    image_path(type, name, desc) {
      return this.$store.getters.getImagePath({
        type: type,
        name: name,
        desc: desc,
        small_card: true
      })
    }
  }
}
</script>

<style scoped>
.summon {
  position: relative;
  width: 90%;
  height: 90%;
  left: 5%;
  top: 5%;
  /* top: 10.44%; */
  /* text-shadow: 2px 2px 0px  #fff, -2px -2px 0px  #fff, 2px -2px 0px  #fff, -2px 2px 0px  #fff; */
  color: black;
  font-weight: bolder;
  -webkit-text-stroke-width: 1px;
  -webkit-text-stroke-color: white;
  font-size: 2vw;
}

.summon > img {
  /* position: absolute; */
  width: 100%;
  /* height: 160%; */
  height: 100%;
  top: -30%;
}

.summon-usage-div {
  position: absolute;
  top: -10%;
  left: 82.05%;
  width: 35.9%;
  height: 30%;
}

.damage-div {
  position: absolute;
  top: 70%;
  left: 0;
  width: 33.75%;
  height: 30%;
}

.damage-div > * {
  position: relative;
  width: 100%;
  height: 100%;
}

.damage-div > * > * {
  position: absolute;
}

.span-div, .summon-usage-div > div {
  position: absolute;
  font-size: 1.5vw;
  font-weight: bolder;
  text-align: center;
  width: 100%;
  height: 100%;
  -webkit-text-stroke-width: 1px;
  -webkit-text-stroke-color: black;
  /* line-height: 130%; */
  color: white;
  /* z-index: 999; */
  display: flex;
  justify-content: center;
  align-items: center;
}

.select-none, .select-disabled, .select-highlight, .select-selected {
  border-radius: 0.6vw;
}

.select-disabled {
  box-shadow: 0 0 0.25vw 0.25vw rgb(192, 192, 192);
  opacity: 0.2;
}

.select-highlight {
  box-shadow: 0 0 0.25vw 0.25vw rgb(255, 174, 0);
}

.select-selected {
  box-shadow: 0 0 0.25vw 0.25vw rgb(255, 81, 0);
}

.main-img {
  font-size: 50%;
  -webkit-text-stroke-width: 0;
}
</style>
