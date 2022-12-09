<template>
    <Page class="wrapper">
        <drop-zone class="drop-zone drop-zone1 even" :accept="acceptEven">
            <template v-slot:image="{data}">
                <div class="circle">
                    <div class="txt">{{ data }}</div>
                </div>
            </template>
            <drop-mask class="palette">
                <drag class="drag" type="number" :data="1" go-back>1</drag>
                <drag class="drag" type="number" :data="2">2</drag>
                <drag class="drag" type="number" :data="3">3</drag>
                <drag class="drag" type="number" :data="4">4
                    <template v-slot:drag-image>
                        4
                    </template>
                </drag>
            </drop-mask>
            <drop-zone class="drop-zone drop-zone2 odd" :accept="acceptOdd">
                <template v-slot:image="{data}">
                    <div class="triangle">
                        <div class="txt">{{ data }}</div>
                    </div>
                </template>
                <drop-mask class="mask">
                    <drop-zone class="drop-zone drop-zone3 even" :accept="acceptEven">
                        <template v-slot:imaAge="{data}">
                            <div class="circle">
                                <div class="txt">{{ data }}</div>
                            </div>
                        </template>
                    </drop-zone>
                    <drop-zone class="drop-zone drop-zone4 odd" :accept="acceptOdd">
                        <template v-slot:image="{data}">
                            <div class="triangle">
                                <div class="txt">{{ data }}</div>
                            </div>
                        </template>
                    </drop-zone>
                </drop-mask>
            </drop-zone>
        </drop-zone>
    </Page>
</template>

<script>
import Page from './components/scaffold/Page'

import Drag from "../lib/src/components/Drag";
import DropMask from "../lib/src/components/DropMask";
import DropZone from "./components/DropZone";
import "../lib/src/js/DragImagesManager.js";

export default {
  components: { Page, DropMask, DropZone, Drag },
  data () {
    return {
      items: ['a', 'b', 'c', 'd', 'e']
    }
  },
  methods: {
    acceptEven (data) {
      return data % 2 === 0
    },
    acceptOdd (data) {
      return data % 2 === 1
    }
  }
}
</script>

<style lang="scss">
.drop-in {
  box-shadow: 0 0 10px rgba(0, 0, 255, 0.3);
}
</style>

<style scoped lang="scss">
.wrapper {
  .palette {
    position: absolute;
    left: 40px;
    top: 40px;
    bottom: 40px;
    width: 200px;
    border: 1px solid black;
    display: flex;
    flex-direction: column;
    background-color: rgb(255, 200, 120);
    overflow: hidden !important;

    .drag {
      background-color: rgb(120, 120, 120);
      color: white;
      margin: 10px;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 5px;
    }
  }

  .mask {
    position: absolute;
    left: 100px;
    top: 100px;
    bottom: 100px;
    width: 250px;
    background-color: rgb(255, 200, 120);
    display: flex;
    flex-direction: column;
    border: 1px solid black;
  }

  .drop-zone {
    background-color: rgb(240, 240, 255);
    border: 1px solid black;

    &.even::before, &.odd::before {
      position: absolute;
      top: -32px;
      left: 50%;
      transform: translate(-50%, 0);
      color: black;
      font-weight: bold;
      font-size: 18px;
      white-space: nowrap;
      pointer-events: none;
    }

    &.even::before {
      content: "Accepte pairs";
    }

    &.odd::before {
      content: "Accepte impairs";
    }

    &.drop-zone1 {
      margin-top: 1000px;
      width: 1500px;
      height: 1500px;
      margin-left: auto;
      margin-right: auto;
      position: relative;
    }

    &.drop-zone2 {
      position: absolute;
      top: 200px;
      left: 500px;
      right: 200px;
      bottom: 200px;
    }

    &.drop-zone3, &.drop-zone4 {
      flex: 1;
      margin: 30px;
      position: relative;
    }

    &.drop-allowed {
      background-color: rgb(200, 255, 200);
    }

    &.drop-forbidden {
      background-color: rgb(255, 200, 200);
    }
  }

  .circle, .triangle {
    color: black;
    font-weight: bold;
    position: relative;
    transform: translate(-50%, -50%);

    .txt {
      position: absolute;
      top: -30px;
      left: 50%;
      transform: translate(-50%, 0);
    }
  }

  .circle {
    border-radius: 50%;
    background-color: blue;
    width: 100px;
    height: 100px;
  }

  .triangle {
    width: 0;
    height: 0;
    border-style: solid;
    border-width: 0 50px 100px 50px;
    border-color: transparent transparent green transparent;
  }
}
</style>
