<template>
  <div>
    <h2>{{ support.name }}</h2>
    <p>Counter Type: {{ support.counterType }}</p>
    <p>Counter: {{ support.counter }}</p>
    <p v-if="support.is_active">Active</p>
    <p v-else>Inactive</p>
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
        return 'name' in value && 'counter' in value && 'is_active' in value && 'counterType' in value
      }
    }
  },
}
</script>
