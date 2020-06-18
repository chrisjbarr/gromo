import Vue from 'vue';
import Vuex from 'vuex';

import { v4 as uuidv4 } from 'uuid';

import createPersistedState from 'vuex-persistedstate';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    gromoers: [],
    gromoer: null,
    activity: null,
    bodyPart: null,
    exercise: null,
    history: [],
    activities: [
      {
        name: 'Strength Training',
        bodyParts: [
          {
            name: 'Shoulders',
            exercises: [
              { name: 'Barbell Overhead Shoulder Press' },
              { name: 'Seated Dumbbell Shoulder Press' },
              { name: 'Dumbbell Front Raise' },
              { name: 'Bent-Over Dumbbell Lateral Raise' },
              { name: 'Dumbbell Lateral Raise' },
              { name: 'Standing Barbell Shrugs' }
            ]
          },
          {
            name: 'Arms',
            exercises: [
              { name: 'Standing Barbell Curl' },
              { name: 'Contentration Curl' },
              { name: 'Standing Dumbbell Curl' },
              { name: 'Hammer Curl' },
              { name: 'Incline Dumbbell Curl' },
              { name: 'Rope Tricep Pushdown' },
              { name: 'Overhead Triceps Extension' },
              { name: 'Skullcrushers (Lying Triceps Extensions)' },
              { name: 'Bench Dip' }
            ]
          },
          {
            name: 'Chest',
            exercises: [
              { name: 'Bench Press - Flat' },
              { name: 'Bench Press - Incline' },
              { name: 'Bench Press - Decline' }
            ]
          },
          { name: 'Legs', exercises: [] },
          { name: 'Back', exercises: [] }
        ]
      },
      {
        name: 'Cardio',
        bodyParts: [{ name: 'Walking' }, { name: 'Running' }]
      }
    ]
  },
  mutations: {
    reset: state => {
      state.gromoer = null;
      state.activity = null;
      state.bodyPart = null;
      state.exercise = null;
    },
    'add-gromoer': (state, name) => {
      state.gromoers.push({
        id: uuidv4(),
        name: name,
        workouts: []
      });
    },
    'gromo-login': (state, gromoerId) => {
      state.gromoer = state.gromoers.find(g => g.id === gromoerId);
    },
    'set-activity': (state, name) => {
      state.activity = state.activities.find(a => a.name === name);
    },
    'set-body-part': (state, name) => {
      state.bodyPart = state.activity.bodyParts.find(a => a.name === name);
    },
    'set-exercise': (state, name) => {
      state.exercise = state.bodyPart.exercises.find(a => a.name === name);
    },
    'add-set': (state, payload) => {
      state.history.push({
        id: uuidv4(),
        reps: payload.reps,
        weight: payload.weight,
        gromoer: state.gromoer.name,
        activity: state.activity.name,
        bodyPart: state.bodyPart.name,
        exercise: state.exercise.name,
        completedOn: new Date()
      });
    }
  },
  getters: {
    exerciseHistory: state => name => {
      return state.history.filter(h => h.exercise === name).sort((a, b) => a.completedOn - b.completedOn);
    }
  },
  actions: {},
  modules: {},
  plugins: [
    createPersistedState({
      key: 'gromo'
    })
  ]
});
