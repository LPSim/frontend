<template>
  <div :class="'support ' + selectClass" @click="log_data">
    <img :src="'static/images/' + support.name + '.png'" :alt="support.name"/>
    <!-- <p>{{ card.name }}</p> -->
    <!-- <p>Cost: {{ card.cost }}</p> -->
    <div class="support-usage-div">
      <div>
        <span>{{ support.usage }}</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Support',
  props: {
    support: {
      type: Object,
      required: true,
      validator: (value) => {
        // return 'name' in value && 'counter' in value && 'is_active' in value && 'counterType' in value
        return true;
      }
    },
    selectClass: {
      type: String,
      default: 'select-none'
    }
  },
  methods: {
    log_data() {
      console.log('SUPPORT', JSON.parse(JSON.stringify(this.support)))
      this.$store.commit('setSelectedObject', this.support);
    }
  }
}
</script>

<style scoped>
.support {
  position: relative;
  width: 90%;
  height: 90%;
  top: 5%;
  left: 5%;
  /* top: 10.44%; */
  /* text-shadow: 2px 2px 0px  #fff, -2px -2px 0px  #fff, 2px -2px 0px  #fff, -2px 2px 0px  #fff; */
  color: black;
  font-weight: bolder;
  -webkit-text-stroke-width: 1px;
  -webkit-text-stroke-color: white;
  font-size: 2vw;
}

.support > img {
  /* position: absolute; */
  width: 100%;
  /* height: 160%; */
  height: 100%;
  top: -30%;
}

.support-usage-div {
  position: absolute;
  top: 0;
  left: 70%;
  width: 30%;
  height: 30%;
}

.select-none {
  border-radius: 5%;
}

.select-disabled {
  border-radius: 5%;
  box-shadow: 0 0 3px 3px rgb(192, 192, 192);
  opacity: 20%;
}

.select-highlight {
  border-radius: 5%;
  box-shadow: 0 0 3px 3px rgb(255, 174, 0);
}

.select-selected {
  box-shadow: 0 0 3px 3px rgb(255, 81, 0);
  border-radius: 5%;
}
</style>
