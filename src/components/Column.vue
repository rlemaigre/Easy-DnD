<template>
    <flex :items="items" direction="column"></flex>
</template>

<script lang="ts">
    import {Component, Prop, Vue} from "vue-property-decorator";
    import Flex from "@/components/Flex.vue";

    @Component({
        name: 'Column',
        components: {Flex}
    })
    export default class Column extends Vue {

        @Prop()
        items: any[];

    }
</script>

<style scoped lang="scss">

</style>