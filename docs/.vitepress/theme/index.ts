import DefaultTheme from 'vitepress/theme';
import type { Theme } from 'vitepress';
import CardTransferDemo from '../../demos/CardTransferDemo.vue';
import CustomDragImageDemo from '../../demos/CustomDragImageDemo.vue';
import DashboardBuilderDemo from '../../demos/DashboardBuilderDemo.vue';
import DataAcceptanceDemo from '../../demos/DataAcceptanceDemo.vue';
import DragGoBackDemo from '../../demos/DragGoBackDemo.vue';
import DragStateDemo from '../../demos/DragStateDemo.vue';
import DropListTransferDemo from '../../demos/DropListTransferDemo.vue';
import DropMaskDemo from '../../demos/DropMaskDemo.vue';
import DropModesDemo from '../../demos/DropModesDemo.vue';
import NestedDropListDemo from '../../demos/NestedDropListDemo.vue';
import TableToListDemo from '../../demos/TableToListDemo.vue';
import TypeAcceptanceDemo from '../../demos/TypeAcceptanceDemo.vue';
import './style.scss';

export default {
  extends: DefaultTheme,
  enhanceApp ({ app }) {
    app.component('CardTransferDemo', CardTransferDemo);
    app.component('CustomDragImageDemo', CustomDragImageDemo);
    app.component('DashboardBuilderDemo', DashboardBuilderDemo);
    app.component('DataAcceptanceDemo', DataAcceptanceDemo);
    app.component('DragGoBackDemo', DragGoBackDemo);
    app.component('DragStateDemo', DragStateDemo);
    app.component('DropListTransferDemo', DropListTransferDemo);
    app.component('DropMaskDemo', DropMaskDemo);
    app.component('DropModesDemo', DropModesDemo);
    app.component('NestedDropListDemo', NestedDropListDemo);
    app.component('TableToListDemo', TableToListDemo);
    app.component('TypeAcceptanceDemo', TypeAcceptanceDemo);
  }
} satisfies Theme;
