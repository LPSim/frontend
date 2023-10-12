<template>
  <div :class="'summon ' + selectClass" @click="log_data">
    <img :src="image_path('summon', summon.name)" :alt="summon.name"/>
    <!-- <p>{{ card.name }}</p> -->
    <!-- <p>Cost: {{ card.cost }}</p> -->
    <div class="summon-usage-div">
      <div>
        <img :src="image_path('icon', summon.icon_type)" :alt="summon.damage_elemental_type" width="100%" height="100%" />
        <div class="span-div">
          <span>{{ summon.usage }}</span>
        </div>
      </div>
    </div>
    <div class="damage-div">
      <div>
        <img :src="image_path('element', summon.damage_elemental_type)" :alt="summon.damage_elemental_type" width="100%" height="100%" />
        <div class="span-div">
          <span>{{ summon.damage }}</span>
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
    image_path(type, name) {
      return this.$store.getters.getImagePath({
        type: type,
        name: name
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
  top: 0;
  left: 70%;
  width: 30%;
  height: 30%;
}

.damage-div {
  position: absolute;
  top: 70%;
  left: 0;
  width: 30%;
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
  opacity: 20%;
}

.select-highlight {
  box-shadow: 0 0 0.25vw 0.25vw rgb(255, 174, 0);
}

.select-selected {
  box-shadow: 0 0 0.25vw 0.25vw rgb(255, 81, 0);
}
</style>
