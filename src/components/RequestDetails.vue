<template>
  <div class="request-details-root" @click="log_data">
    <div v-if="selectedRequest != null">
      <span>Player {{ selectedRequest.player_idx }}: </span>
      <span>{{ selectedRequest.name.replace("Request", "") }}</span>
      <div class="cost-div">
        <Cost :cost="selectedRequest.cost" :max_number="4" direction="row" justify="center" :cost_font_size="1"/>
      </div>
    </div>
    <!-- <p>{{ selectedRequest }}</p> -->
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
    selectedRequest: {
      type: Object,
      default: null,
    },
  },
  methods: {
    log_data () {
      console.log('REQUEST', JSON.parse(JSON.stringify(this.selectedRequest)))
    }
  }
};
</script>

<style scoped>
.request-details-root {
  position: absolute;
  padding: 5px;
  background-color: white;
  border: 1px solid black;
  border-radius: 5px;
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.3);
  width: 97%;
  height: 97%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  justify-content: left;
  align-items: center;
}

.request-details-root > p {
  background-color: rgba(255, 255, 255, 0.5);
}

.request-details-root > div {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 100%;
  box-sizing: border-box;
  align-items: center;
}

.request-details-root > div > .cost-div {
  width: 100px;
  height: 25px;
  margin-left: 10px;
}

p {
    margin: 0;
    margin-top: 5px;
}

</style>
