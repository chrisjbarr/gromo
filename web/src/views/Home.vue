<template>
  <div>
    <div v-if="gromoers.length > 0">
      <label>Hello, who is going to <span class="font-semibold italic">gromo</span> today?</label>
      <ul class="my-4 divide-y divide-blue-500">
        <li class="py-2" v-for="gromoer in gromoers" :key="gromoer.name">{{ gromoer.name }}</li>
      </ul>
    </div>

    <div v-if="gromoers.length > 0">
      Not listed? Get started quickly:
    </div>

    <span v-if="gromoers.length === 0" class="text-xl block">Let's get started!</span>

    <div class="mt-5">
      <label class="block text-gray-700 text-sm font-bold mb-2" for="name">
        What do you go by?
      </label>
      <input
        type="text"
        v-model="name"
        value="text"
        class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
      />
    </div>
    <div class="mt-5">
      <button class="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded" @click="addGromoer()">Submit</button>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'Home',
  data() {
    return {
      name: ''
    };
  },
  methods: {
    addGromoer() {
      this.$store.commit('add-gromoer', this.name);
    }
  },
  computed: {
    ...mapState(['count', 'gromoers'])
  }
};
</script>
