<template>
    <div class="Flex">
        <drop-list :items="items" class="dl" :style="{flexDirection: direction}" @insert="onInsert"
                   @reorder="onReorder" mode="cut" :row="direction === 'row'" :column="direction === 'column'"
                   :tag="root" no-animations>
            <template v-slot:item="{item}">
                <drag tag="generic" :model="item" :key="key(item)" :data="item"
                      @cut="remove(item)">
                    <template v-slot:drag-image>
                        <div class="drag-image">DRAG</div>
                    </template>
                </drag>
            </template>
            <template v-slot:feedback="{data}">
                <div class="feedback" :key="key(data)"/>
            </template>
            <template v-slot:reordering-feedback="{item}">
                <div class="reordering-feedback" key="feedback"/>
            </template>
        </drop-list>
    </div>
</template>

<script lang="ts">
    import DropList from "../../lib/src/components/DropList.vue";
    import Drag from "../../lib/src/components/Drag.vue";
    import {Component, Prop, Vue} from "vue-property-decorator";
    import {InsertEvent, ReorderEvent} from "../../lib/src/ts/events";
    import MyDiv from "@/components/MyDiv.vue";

    @Component({
        name: 'Flex',
        components: {Drag, DropList}
    })
    export default class Flex extends Vue {

        @Prop()
        items: any[];

        @Prop()
        direction: string;

        get root() {
            return MyDiv;
        }

        key(item) {
            if (typeof item === "object") {
                return item.key
            } else {
                return item;
            }
        }

        onInsert(event: InsertEvent) {
            this.items.splice(event.index, 0, event.data);
        }

        onReorder(event: ReorderEvent) {
            event.apply(this.items);
        }

        remove(item) {
            let index = this.items.indexOf(item);
            this.items.splice(index, 1);
        }

    }
</script>

<style scoped lang="scss">
    .Flex {
        border: 1px dashed black;

        .dl {
            display: flex;
            align-items: stretch;
        }

        .drag-image {
            background-color: orangered;
            width: 75px;
            height: 75px;
            transform: translate(-50%, -50%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .reordering-feedback, .feedback {
            flex: 0 0 0;
            outline: 1px solid blue;
            align-self: stretch;
        }

        .drag-source {
            outline: 2px dashed black;
        }
    }
</style>