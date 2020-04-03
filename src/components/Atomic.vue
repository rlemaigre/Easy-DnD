<template>
    <span class="Atomic">{{data}}</span>
</template>

<script lang="ts">
    import {Component, Prop, Vue} from "vue-property-decorator";

    @Component({
        name: 'Atomic'
    })
    export default class Atomic extends Vue {

        @Prop()
        data: number;

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