<template>
  <div class="flex flex-col">
    <h3 class="text-2xl font-semibold">{{ bodyPart.name }}</h3>
    <h4 class="font-semibold">{{ exercise.name }}</h4>

    <div class="my-4">
      <label class="block text-gray-700 text-sm font-bold mb-2" for="reps">
        Repetitions:
      </label>
      <input
        class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        type="number"
        v-model.number="reps"
      />
    </div>

    <div class="flex flex-col my-4">
      <div class="mb-4">
        <label class="block text-gray-700 text-sm font-bold mb-2" for="weight">
          Weight:
        </label>
        <input
          class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          type="number"
          v-model.number="weight"
        />
      </div>
    </div>

    <div v-if="history.length > 0">
      <h4 class="font-semibold">Previous workouts</h4>
      <ul class="my-4 divide-y divide-gray-500 w-full h-48 overflow-auto">
        <li v-for="set in history" :key="set.completedOn.toString()">
          <div class="flex justify-between py-1">
            <label>{{ set.completedOn | formatDateTime }}</label>
            <span>{{ set.reps }} x {{ set.weight }}lbs</span>
          </div>
        </li>
      </ul>
    </div>

    <div v-if="history.length === 0" class="w-full my-4">
      <p>When you add a set it will show up here.</p>
    </div>

    <div class="mt-5">
      <button class="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded" @click="addSet()">Add Set</button>
    </div>

    <div class="mt-5">
      <button class="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded" @click="back()">Back</button>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'Workout',
  data() {
    return {
      reps: 0,
      weight: 0
    };
  },
  methods: {
    addSet() {
      this.$store.commit('add-set', { reps: this.reps, weight: this.weight });
    },
    back() {
      this.$store.commit('reset');
      this.$router.push({ name: `home` });
    }
  },
  computed: {
    ...mapState(['activity', 'bodyPart', 'exercise', 'history']),
    blah() {
      return this.$store.getters.exerciseHistory(this.exercise.name);
    }
  }
};
</script>
