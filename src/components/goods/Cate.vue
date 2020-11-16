<template>
  <div>
    <!-- 头部面包屑区域 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 添加分类区域 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateList"
            >添加分类</el-button
          >
        </el-col>
      </el-row>
      <!-- 商品列表区域 -->
      <tree-table
        :data="catesList"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        show-index
        index-text="#"
        border
      >
        <!-- 是否有效模板 -->
        <template slot="isok" slot-scope="scope">
          <i
            class="el-icon-success"
            v-if="scope.row.cat_deleted === false"
            style="color:lightgreen"
          ></i>
          <i class="el-icon-error" style="color:red" v-else></i>
        </template>

        <!--排序模板 -->
        <template slot="order" slot-scope="scope">
          <el-tag v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag type="success" v-else-if="scope.row.cat_level === 1"
            >二级</el-tag
          >
          <el-tag type="warning" v-else>三级</el-tag>
        </template>

        <!--  操作模板-->
        <template slot="opt" slot-scope="scope">
          <el-button
            type="primary"
            icon="el-icon-edit"
            size="mini"
            @click="showEditDialog(scope.row)"
            >编辑</el-button
          ><el-button
            type="danger"
            icon="el-icon-delete"
            size="mini"
            @click="removeEditCate(scope.row.cat_id)"
            >删除</el-button
          >
        </template>
      </tree-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>

    <!-- 添加分类对话框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addCateDialogVisible"
      width="50%"
      @close="addCateDialogClosed"
    >
      <el-form
        :model="addCateForm"
        :rules="addCateFormRoles"
        ref="addCateFormRef"
        label-width="100px"
      >
        <el-form-item label="分类名称：" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
          <!-- options 指定数据源 -->
          <!-- props 指定配置对象 -->
          <!--  v-model 双向绑定了选中的数据的ID值 -->
          <el-cascader
            v-model="selectedKeys"
            :options="parentCateList"
            :props="cascaderProps"
            @change="parentCateChanged"
            clearable
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑分类对话框 -->
    <el-dialog
      title="编辑分类"
      :visible.sync="editCateDialogVisible"
      width="50%"
      @close="editCateDialogClosed"
    >
      <el-form
        ref="editCateFormRef"
        :model="editCateForm"
        :rules="editCateFormRoles"
        label-width="100px"
      >
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="editCateForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="editCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCate(editCateForm.cat_id)"
          >确 定</el-button
        >
      </div>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data () {
    return {
      //获取商品分类列表的参数对象
      queryInfo: {
        type: 3,
        //当前页码值
        pagenum: 1,
        //每页显示多少条数据
        pagesize: 5
      },
      //存储商品分类数据
      catesList: [],
      //存储新增父级分类的数据
      parentCateList: [],
      //指定级联选择器的配置对象
      cascaderProps: {
        expandTrigger: 'hover',
        value: 'cat_id', //选中哪个值
        label: 'cat_name', //看到的是哪个属性
        children: 'children', //父子嵌套是哪个属性
        checkStrictly: true
      },
      //选中的父级分类的数组，也就是选择哪一个数据对应的id，以数据形式保存起来
      selectedKeys: [],
      //存储分类表单的数据对象的数据
      addCateForm: {
        // 将要添加的分类名称
        cat_name: '',
        // 父级分类的id
        cat_pid: 0,
        // 分类的等级，默认是1级分类
        cat_level: 0
      },
      //添加分类表单的验证规则
      addCateFormRoles: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      },
      //编辑分类验证规则
      editCateFormRoles: {
        cat_name: {
          required: true,
          message: '请输入分类名称',
          trigger: 'blur'
        }
      },
      //总数据条数
      total: 0,
      //控制添加分类对话框显示隐藏
      addCateDialogVisible: false,
      //控制编辑分类对话框显示隐藏
      editCateDialogVisible: false,
      //保存编辑分类的信息
      editCateForm: {},
      // 为table指定列的定义
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          //表示当前列定义为模板列
          type: 'template',
          //表示当前列使用的模板名称
          template: 'isok'
        },
        {
          label: '排序',
          type: 'template',
          template: 'order'
        },
        {
          label: '操作',
          type: 'template',
          template: 'opt'
        }
      ]
    }
  },
  created () {
    this.getCatesList()
  },
  methods: {
    async getCatesList () {
      const { data: res } = await this.$http.get('categories', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200)
        return this.$message.error('请求商品分类数据失败')
      //数据列表赋值给catesList
      this.catesList = res.data.result
      this.total = res.data.total
    },
    //监听每页显示多少条数据变化 pagesize
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getCatesList()
    },
    //监听页码值改变的事件
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.getCatesList()
    },
    //监听添加分类按钮
    async showAddCateList () {
      //获取前两级分类的数据
      const { data: res } = await this.$http.get('categories', {
        params: { type: [2] }
      })
      if (res.meta.status !== 200)
        return this.$message.error('请求父级分类数据失败')
      this.parentCateList = res.data
      this.addCateDialogVisible = true
    },
    //选择项发生变化触发函数
    parentCateChanged () {
      //如果selectedKeys长度大于0，表明选中了父级分类 反之则没选中
      //选中了父级分类，代表添加的分类为选中父级分类的子分类，反之则为父级分类
      if (this.selectedKeys.length > 0) {
        //父级分类的id
        this.addCateForm.cat_pid = this.selectedKeys[
          this.selectedKeys.length - 1
        ]
        //当前分类的等级等于当前数组的长度
        this.addCateForm.cat_level = this.selectedKeys.length
        return
      } else {
        this.addCateForm.cat_pid = 0
        this.addCateForm.cat_level = 0
      }
    },
    // 点击确定，添加新的分类
    async addCate () {
      this.$refs.addCateFormRef.validate(async valid => {
        if (!valid) {
          return
        }
        const { data: res } = await this.$http.post(
          'categories',
          this.addCateForm
        )
        if (res.meta.status !== 201) return this.$message.error('添加分类失败')
        this.$message.success('添加分类成功')
        this.getCatesList()
        this.addCateDialogVisible = false
      })
    },
    //对话框关闭，重置表单数据
    addCateDialogClosed () {
      this.$refs.addCateFormRef.resetFields()
      this.selectedKeys = []
      this.addCateForm.cat_pid = 0
      this.addCateForm.cat_level = 0
    },
    //编辑分类
    showEditDialog (val) {
      this.editCateForm = val
      this.editCateDialogVisible = true
    },
    //修改分类
    editCate (id) {
      this.$refs.editCateFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put(
          `categories/${id}`,
          this.editCateForm
        )
        if (res.meta.status !== 200) return this.$message.error('修改分类失败')
        this.$message.success('修改分类成功')
        this.getCatesList()
        this.editCateDialogVisible = false
      })
    },
    //修改分类对话框关闭，重置页面
    editCateDialogClosed () {
      this.$refs.editCateFormRef.resetFields()
    },
    //删除分类按钮
    async removeEditCate (id) {
      const removeCateForm = await this.$confirm(
        '此操作将永久删除该分类, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      if (removeCateForm !== 'confirm') return this.$message.info('已取消删除')

      const { data: res } = await this.$http.delete(`categories/${id}`)
      if (res.meta.status !== 200) return this.$message.error('删除分类失败')
      this.$message.success('删除分类成功')
      this.getCatesList()
    }
  }
}
</script>
<style lang="less" scoped>
.el-button {
  margin-bottom: 15px;
}
.el-cascader {
  width: 100%;
}
</style>
