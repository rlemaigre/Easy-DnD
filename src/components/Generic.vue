<template>
    <div class="generic">
        <component :is="comp" v-bind="props" class="inner"></component>
        <slot/>
    </div>
</template>

<script lang="ts">
    import {Component, Prop, Vue} from "vue-property-decorator";
    import Row from "@/components/Row.vue";
    import Column from "@/components/Column.vue";
    import Atomic from "@/components/Atomic.vue";

    @Component({
        name: 'Generic',
        components: {Atomic, Row}
    })
    export default class Generic extends Vue {

        @Prop({type: null})
        model;

        get comp() {
            if (typeof this.model === "object") {
                if (this.model.type === 'row') {
                    return Row;
                } else {
                    return Column;
                }
            } else {
                return Atomic;
            }
        }

        get props() {
            if (typeof this.model === "object") {
                return {
                    items: this.model.items
                }
            } else {
                return {
                    data: this.model
                }
            }
        }
    }
</script>

<style scoped lang="scss">

    .generic {
        flex: 1;
        display: flex;
        align-items: stretch;
        margin: 20px;

        .inner {
            width: 100%;
            height: 100%;
        }
    }

</style>