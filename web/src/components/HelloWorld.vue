<template>
  <div class="flex flex-col">
    <label>{{ count }}</label>
    <button @click="increment()">Increment</button>
    <button @click="decrement()">Decrement</button>
  </div>
</template>

<script>
export default {
  name: 'HelloWorld',
  props: {
    msg: String
  },
  methods: {
    increment() {
      this.$store.commit('increment');
    },
    decrement() {
      this.$store.commit('decrement');
    }
  },
  computed: {
    count() {
      return this.$store.state.count;
    }
  }
};
</script>

<style scoped></style>
