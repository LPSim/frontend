<template>
  <div :class="{ 'card': true, 'active-card': card.is_active }" @click.stop="log_data">
    <img :src="'static/images/' + card.name + '.png'" :alt="card.name" width="100%" height="100%" />
    <!-- <p>{{ card.name }}</p> -->
    <!-- <p>Cost: {{ card.cost }}</p> -->
    <div class="cost-outer-div">
      <Cost :cost="cost" :max_number="4.5" :offset_left="10" :offset_top="10" direction="column"/>
    </div>
  </div>
</template>

<script>
import Cost from './Cost.vue';
export default {
  name: 'Card',
  components: {
    Cost
  },
  props: {
    card: {
      type: Object,
      required: true,
      validator: (value) => {
        // return 'name' in value && 'cost' in value && 'is_active' in value
        // TODO
        return true
      }
    }
  },
  methods: {
    log_data() {
      console.log(JSON.parse(JSON.stringify(this.card)))
    }
  },
  computed: {
    cost() {
      let now_cost = this.card.cost
      let ori_cost = this.card.cost.original_value
      if (!ori_cost) ori_cost = now_cost  //cannot use this card, and no original cost
      let res = []
      if (ori_cost.elemental_dice_number > 0)
        res.push({ 
          type: ori_cost.elemental_dice_color, 
          value: ori_cost.elemental_dice_number,
          is_higher: now_cost.elemental_dice_number > ori_cost.elemental_dice_number,
          is_lower: now_cost.elemental_dice_number < ori_cost.elemental_dice_number
        })
      if (ori_cost.same_dice_number > 0)
        res.push({
          type: 'MATCHING', 
          value: ori_cost.same_dice_number,
          is_higher: now_cost.same_dice_number > ori_cost.same_dice_number,
          is_lower: now_cost.same_dice_number < ori_cost.same_dice_number
        })
      if (ori_cost.any_dice_number > 0)
        res.push({ 
          type: 'UNALIGNED', 
          value: ori_cost.any_dice_number,
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
}
</script>

<style scoped>

.card {
  position: relative;
  width: 100%;
  height: 100%;
}

.active-card {
  border: 2px solid red;
}

img {
  position: absolute;
}

.cost-outer-div {
  /* position: absolute; */
  position: relative;
  flex-direction: column;
  width: 38%;
  height: 100%;
}


</style>
