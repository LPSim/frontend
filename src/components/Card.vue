<template>
  <div :class="{ 'active-card': card.is_active }">
    <p>{{ card.name }}</p>
    <p>Cost: {{ card.cost }}</p>
  </div>
</template>

<script>
export default {
  name: 'Card',
  props: {
    card: {
      type: Object,
      required: true,
      validator: (value) => {
        return 'name' in value && 'cost' in value && 'is_active' in value
      }
    }
  }
}
</script>

<style>
.active-card {
  border: 2px solid red;
}
</style>
