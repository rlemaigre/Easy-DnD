<template>
    <div class="DragFeedback">
        <slot></slot>
    </div>
</template>

<script lang="ts">
    import {Component, Vue} from "vue-property-decorator";

    @Component({})
    export default class DragFeedback extends Vue {
    }
</script>

<style scoped lang="scss">

</style>