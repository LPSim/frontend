<template>
  <div>
    <h2>{{ summon.name }}</h2>
    <p>Elemental Type: {{ summon.elementalType }}</p>
    <p>Counter Type: {{ summon.counterType }}</p>
    <p>Counter: {{ summon.counter }}</p>
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
        return 'name' in value && 'elementalType' in value && 'counter' in value && 'counterType' in value
      }
    }
  },
}
</script>
