<template>
  <div :class="'support ' + selectClass" @click="log_data">
    <img class="main-img" :src="image_path('SUPPORT', support.name, support.desc)" :alt="$t('SUPPORT/' + support.name)" @error="imgSrcError($event)"/>
    <div class="support-text">
      <span>{{ $t('SUPPORT/' + support.name) }}</span>
    </div>
    <div class="support-usage-div">
      <div>
        <img v-if="support.icon_type != 'NONE'" :src="image_path('ICON', support.icon_type)" :alt="support.icon_type" width="100%" height="100%" @error="$event.target.style.display='none'"/>
        <div class="span-div">
          <span>{{ support.usage }}</span>
        </div>
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
    imgSrcError(event) {
      event.target.style.display = 'none';

      let nextElement = event.target.nextElementSibling;
      if (nextElement) {
        nextElement.style.display = 'flex';
      }
    },
    log_data() {
      console.log('SUPPORT', JSON.parse(JSON.stringify(this.support)))
      this.$store.commit('setSelectedObject', this.support);
    },
    image_path(type, name, desc) {
      return this.$store.getters.getImagePath({
        type: type,
        name: name,
        desc: desc,
        small_card: true,
      })
    }
  },
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
  -webkit-text-stroke-width: 0.05vw;
  -webkit-text-stroke-color: white;
  font-size: 2vw;
}

.support > img {
  /* position: absolute; */
  width: 100%;
  /* height: 160%; */
  height: 100%;
  top: -30%;
  border-radius: 0.5vw;
}

.support-usage-div {
  position: absolute;
  top: -10%;
  left: 82.05%;
  width: 35.9%;
  height: 30%;
}

.span-div, .support-usage-div > div {
  position: absolute;
  font-size: 1.5vw;
  font-weight: bolder;
  text-align: center;
  width: 100%;
  height: 100%;
  -webkit-text-stroke-width: 0.05vw;
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

.support-text {
  display: none;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  border: 0.1vw;
  border-color: #6B5531;
  border-style: solid;
  border-radius: 0.5vw;
  font-size: 1vw;
}

.support-text > span {
  word-break: break-all;
  -webkit-text-stroke-width: 0vw;
}

</style>
