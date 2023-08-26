<template>
  <div class="cost-div" :style="'flex-direction: ' + direction" v-if="cost">
    <div v-for="(c, cid) in cost_computed" :key="cid" :style="costDivStyle()">
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
      required: true,
      default: null
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
      return style
    }
  },
  computed: {
    cost_computed() {
      let now_cost = this.cost
      let ori_cost = this.cost.original_value
      if (!ori_cost) ori_cost = now_cost  //cannot use this card, and no original cost
      let res = []
      if (ori_cost.elemental_dice_number > 0)
        res.push({
          type: now_cost.elemental_dice_color,
          value: now_cost.elemental_dice_number,
          is_higher: now_cost.elemental_dice_number > ori_cost.elemental_dice_number,
          is_lower: now_cost.elemental_dice_number < ori_cost.elemental_dice_number
        })
      if (ori_cost.same_dice_number > 0)
        res.push({
          type: 'MATCHING',
          value: now_cost.same_dice_number,
          is_higher: now_cost.same_dice_number > ori_cost.same_dice_number,
          is_lower: now_cost.same_dice_number < ori_cost.same_dice_number
        })
      if (ori_cost.any_dice_number > 0)
        res.push({
          type: 'UNALIGNED',
          value: now_cost.any_dice_number,
          is_higher: now_cost.any_dice_number > ori_cost.any_dice_number,
          is_lower: now_cost.any_dice_number < ori_cost.any_dice_number
        })
      if (res.length == 0)
        res.push({
          type: 'MATCHING',
          value: 0,
          is_higher: false,
          is_lower: false
        })
      return res
      // let res = [
      //   { type: 'GEO', value: 2, is_higher: true, is_lower: false},
      //   { type: 'UNALIGNED', value: 1, is_higher: false, is_lower: true},
      //   { type: 'MATCHING', value: 3, is_higher: false, is_lower: false},
      //   { type: 'CHARGE', value: 2, is_higher: false, is_lower: false},
      // ]

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
  color: rgb(58, 243, 58);
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