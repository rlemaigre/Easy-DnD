<template>
    <span class="Atomic">{{data}}</span>
</template>

<script>
export default {
  name: 'Atomic',
  props: {
    data: {
      type: Number
    }
  }
}
</script>

<style scoped lang="scss">

    .Atomic {
        background-color: deepskyblue;
        display: flex;
        padding: 20px;
        align-items: center;
        justify-content: center;
    }

</style>
