<template>
  <div class="request-button-root">
    <div :class="select_class">
      {{ title }}
      <div class="cost-div" v-if="cost != null">
        <Cost :cost="cost" :max_number="3" direction="row" justify="center" />
      </div>
    </div>
  </div>
</template>

<script>
import Cost from "./Cost.vue";
export default {
  name: "RequestDetails",
  components: {
    Cost,
  },
  props: {
    title: {
      type: String,
      required: true,
    },
    cost: {
      type: Object,
      default: null,
    },
    select_class: {
      type: String,
      default: 'select-none',
    }
  }
};
</script>

<style scoped>
.request-button-root > div {
  position: relative;
  border-radius: 5%;
  width: 100%;
  height: 100%;
}

.select-none {
  box-shadow: 0 0 3px 3px rgb(255, 174, 0);
}

.select-disabled {
  box-shadow: 0 0 3px 3px rgb(192, 192, 192);
  opacity: 20%;
}

.select-highlight {
  box-shadow: 0 0 3px 3px rgb(255, 81, 0);
}

.request-button-root > div > .cost-div {
  position: absolute;
  width: 100%;
  height: 33.3333333333%;
  top: 66.6666666667%;
  display: flex;
}

</style>
