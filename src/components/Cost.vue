<template>
  <div class="cost-div" :style="'flex-direction: ' + direction">
    <div v-for="(c, cid) in cost" :key="cid" :style="costDivStyle()">
      <img
        :src="'static/images/COST_' + c.type + '.png'"
        :alt="c.type"
        width="100%"
        height="100%"
      />
      <div class="cost-span-div">
        <span
          :class="{ 'cost-higher': c.is_higher, 'cost-lower': c.is_lower }"
          >{{ c.value }}</span
        >
      </div>
    </div>
  </div>
</template>
  
  <script>
export default {
  name: "Cost",
  props: {
    cost: {
      type: Array,
      required: true,
      default: () => [],
    },
    max_number: {
      type: Number,
      default: 5
    },
    offset_left: {
      type: Number,
      default: 0
    },
    offset_top: {
      type: Number,
      default: 0
    },
    direction: {
      type: String,
      default: 'column'
    }
  },
  methods: {
    costDivStyle () {
      let style = {
        width: `${100 / this.max_number}%`,
        height: `${100 / this.max_number}%`,
        marginLeft: `-${this.offset_left}%`,
        marginTop: `-${this.offset_top}%`,
        marginBottom: `${this.offset_top}%`,
        marginRight: `${this.offset_left}%`,
      }
      if (this.direction == 'column') style.width = '100%'
      else style.height = '100%'
      console.log(style)
      return style
    }
  }
};
</script>

<style scoped>

.cost-div {
  width: 100%;
  height: 100%;
  display: flex;
}
.cost-div > div {
  position: relative;
}

.cost-higher {
  color: red;
}

.cost-lower {
  color: green;
}

.cost-span-div {
  position: absolute;
  font-size: 1.25vw;
  font-weight: bolder;
  text-align: center;
  left: 0;
  top: 0;
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
</style>