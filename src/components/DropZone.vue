<template>
    <drop @drop="drop" accepts-type="number" :accepts-data="accept">
        <slot name="default"></slot>
        <template v-slot:drag-image="{type, data}">
            <slot name="image" :type="type" :data="data"></slot>
        </template>
        <div class="dropped">
            <div v-for="n in numbers">Dropped : {{n}}</div>
        </div>
    </drop>
</template>

<script lang="ts">
    import {Component, Prop, Vue} from "vue-property-decorator";
    import Drop from "../../lib/src/components/Drop.vue";
    import {dnd} from "../../lib/src/ts/utils";

    @Component({
        components: {Drop}
    })
    export default class DropZone extends Vue {

        @Prop({type: Function})
        accept: { (data: any): boolean };

        numbers: number[] = [];

        drop() {
            this.numbers.push(dnd.data);
        }

        dropImage() {
            return this.$refs['shadow'];
        }

    }
</script>

<style scoped lang="scss">
    .dropped {
        position: absolute;
        top: 20px;
        right: 20px;
    }
</style>