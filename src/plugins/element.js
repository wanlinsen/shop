import {
  Aside,
  Breadcrumb,
  BreadcrumbItem,
  Button,
  Card,
  Cascader,
  Col,
  Container,
  Dialog,
  Form,
  FormItem,
  Header,
  Input,
  Main,
  Menu,
  MenuItem,
  MenuItemGroup,
  Message,
  MessageBox,
  Option,
  Pagination,
  Row,
  Select,
  Submenu,
  Switch,
  Table,
  TableColumn,
  Tag,
  Tooltip,
  Tree
} from 'element-ui'
import Vue from 'vue'

//message需要挂载到vue的全局作用下,用于提示信息，弹框组件
Vue.prototype.$message = Message
//全局配置confirm
Vue.prototype.$confirm = MessageBox.confirm

Vue.use(Button)
  .use(Select)
  .use(Option)
  .use(Form)
  .use(FormItem)
  .use(Input)
  .use(Container)
  .use(Header)
  .use(Aside)
  .use(Main)
  .use(Menu)
  .use(Submenu)
  .use(MenuItemGroup)
  .use(MenuItem)
  .use(Breadcrumb)
  .use(BreadcrumbItem)
  .use(Card)
  .use(Col)
  .use(Row)
  .use(Table)
  .use(TableColumn)
  .use(Switch)
  .use(Tooltip)
  .use(Pagination)
  .use(Dialog)
  .use(Tag)
  .use(Tree)
  .use(Cascader)
