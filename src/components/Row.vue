<template>
    <flex :items="items" direction="row"></flex>
</template>

<script lang="ts">
    import {Component, Prop, Vue} from "vue-property-decorator";
    import Flex from "@/components/Flex.vue";

    @Component({
        name: 'Row',
        components: {Flex}
    })
    export default class Row extends Vue {

        @Prop()
        items: any[];

    }
</script>

<style scoped lang="scss">

</style>