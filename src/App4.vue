<template>
    <v-app>
        <v-content>
            <v-container fluid>
                <v-row align-content="stretch">
                    <v-col>
                        <drag :data="selected" go-back :vibration="10">
                            <v-data-table
                                    v-model="selected"
                                    :headers="headers"
                                    :items="desserts"
                                    item-key="name"
                                    show-select
                            >
                            </v-data-table>
                            <template v-slot:drag-image>
                                <v-badge color="red" style="transform: translate(10px, 5px)">
                                    <template v-slot:badge>{{selected.length}}</template>
                                    <v-icon large color="primary">mdi-food-variant</v-icon>
                                </v-badge>
                            </template>
                        </drag>
                    </v-col>
                    <v-col>
                        <drop @drop="onDrop" style="height:100%" tag="v-list" three-line class="my-list">
                            <template v-for="(list, index) in lists">
                                <v-list-item :key="index" @click="">
                                    <v-list-item-avatar color="primary" size="48">
                                        <span class="white--text">{{list.length}}</span>
                                    </v-list-item-avatar>
                                    <v-list-item-content>
                                        <v-list-item-title>List {{index}}</v-list-item-title>
                                        <v-list-item-subtitle>
                                            {{list.map(l => l.name).join(", ")}}<br/>
                                            {{list.map(l => l.calories).join(", ")}}
                                        </v-list-item-subtitle>
                                    </v-list-item-content>
                                </v-list-item>
                                <v-divider/>
                            </template>
                        </drop>
                    </v-col>
                </v-row>
            </v-container>
        </v-content>
    </v-app>
</template>

<script>
import Drag from "../lib/src/components/Drag";
import Drop from "../lib/src/components/Drop";
import DropList from "../lib/src/components/DropList";

export default {
    name: "App",
    components: {
        Drag,
        DropList,
        Drop
    },
    data: function () {
        return {
            headers: [
                {text: 'Dessert (100g serving)', value: 'name'},
                {text: 'Calories', value: 'calories'},
                {text: 'Fat (g)', value: 'fat'}
            ],
            desserts: [
                {
                    name: 'Frozen Yogurt',
                    calories: 159,
                    fat: 6.0
                },
                {
                    name: 'Ice cream sandwich',
                    calories: 237,
                    fat: 9.0
                },
                {
                    name: 'Eclair',
                    calories: 262,
                    fat: 16.0
                },
                {
                    name: 'Cupcake',
                    calories: 305,
                    fat: 3.7
                },
                {
                    name: 'Gingerbread',
                    calories: 356,
                    fat: 16.0
                },
                {
                    name: 'Jelly bean',
                    calories: 375,
                    fat: 0.0
                },
                {
                    name: 'Lollipop',
                    calories: 392,
                    fat: 0.2
                },
                {
                    name: 'Honeycomb',
                    calories: 408,
                    fat: 3.2
                },
                {
                    name: 'Donut',
                    calories: 452,
                    fat: 25.0
                },
                {
                    name: 'KitKat',
                    calories: 518,
                    fat: 26.0
                },
            ],
            selected: [],
            lists: []
        };
    },
    methods: {
        onDrop(event) {
            this.lists.push(event.data);
        }
    }
};
</script>

<style>
    html,
    body {
        height: 100%;
        font-family: "Roboto";
    }

    .my-list.drop-allowed {
        outline: 1px dashed green;
    }

</style>
