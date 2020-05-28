<template>
  <div class="flex h-screen w-screen">
    <div class="flex flex-col items-center w-full">
      <div class="w-full h-12 bg-blue-600 justify-center items-center flex shadow-md">
        <span class="text-xl text-white font-semibold">Gromo</span>
      </div>
      <div class="h-full w-full flex">
        <div class="w-full p-4">
          <router-view />
        </div>
      </div>
    </div>
  </div>
</template>
