<template>
    <div class="MyDiv">
        <slot/>
    </div>
</template>

<script lang="ts">
    import {Component, Vue} from "vue-property-decorator";

    @Component({})
    export default class MyDiv extends Vue {
    }
</script>

<style scoped lang="scss">

</style>