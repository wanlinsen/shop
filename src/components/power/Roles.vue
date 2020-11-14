<template>
  <div>
    <!-- 头部面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <el-row>
        <el-col>
          <!-- 添加角色列表区 -->
          <el-button type="primary" @click="addDialogVisible = true"
            >添加角色</el-button
          >
        </el-col>
      </el-row>
      <!-- 权限列表 -->
      <el-table :data="rolesList" border stripe>
        <el-table-column type="expand">
          <template v-slot:default="scope">
            <el-row
              v-for="(item1, i1) in scope.row.children"
              :key="i1"
              :class="['bdbottom', i1 === 0 ? 'bdtop' : '', 'vcenter']"
            >
              <!-- 渲染一级权限页面 -->
              <el-col :span="5">
                <el-tag
                  closable
                  @close="removeRightById(scope.row, item1.id)"
                  >{{ item1.authName }}</el-tag
                >
                <i class="el-icon-caret-right"></i>
              </el-col>

              <!-- 渲染二三级权限页面 -->
              <el-col :span="19">
                <!-- 二次for循环渲染二级权限 -->
                <el-row
                  :class="[i2 === 0 ? '' : 'bdtop', 'vcenter']"
                  v-for="(item2, i2) in item1.children"
                  :key="i2"
                >
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removeRightById(scope.row, item2.id)"
                      >{{ item2.authName }}</el-tag
                    >
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <!-- 渲染三级权限 -->
                    <el-tag
                      type="warning"
                      v-for="(item3, i3) in item2.children"
                      :key="i3"
                      closable
                      @close="removeRightById(scope.row, item3.id)"
                      >{{ item3.authName }}</el-tag
                    >
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index" label="#" />
        <el-table-column prop="roleName" label="角色名称"> </el-table-column>
        <el-table-column prop="roleDesc" label="角色描述"> </el-table-column>
        <el-table-column label="操作" width="300px">
          <template #default="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showRolesListDialong(scope.row.id)"
              >编辑</el-button
            ><el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeFormRoles(scope.row.id)"
              >删除</el-button
            ><el-button
              type="warning"
              icon="el-icon-setting"
              size="mini"
              @click="showSetRightDialog(scope.row)"
              >分配权限</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加修改用户对话框 -->
    <el-dialog
      title="修改用户信息"
      :visible.sync="resetDialogVisible"
      width="50%"
    >
      <el-form
        :model="resetForm"
        :rules="resetRules"
        ref="resetFormRef"
        label-width="80px"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="resetForm.roleName" />
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="resetForm.roleDesc" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="resetDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="resetFormRoles(resetForm.roleId)"
          >确 定</el-button
        >
      </span>
    </el-dialog>

    <!-- 添加用户对话框  visible.sync 控制对话框的显示隐藏-->
    <el-dialog
      title="添加用户"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addRolesDialogClosed"
    >
      <!-- //验证表单区域 model：数据绑定对象 rules：数据验证对象 ref：引用对象  prop：校验规则，在rules内部实现-->
      <el-form
        :model="addRolesForm"
        :rules="addRolesFormRules"
        ref="addRolesFormRef"
        label-width="70px"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addRolesForm.roleName" />
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addRolesForm.roleDesc" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addFormRoles">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 添加分配权限对话框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="setRightDialogVisible"
      width="50%"
      @close="setRightDialogClosed"
    >
      <!-- 添加树形控件 -->
      <el-tree
        :data="rightsList"
        show-checkbox
        node-key="id"
        :default-checked-keys="defKeys"
        :props="treeProps"
        default-expand-all
        ref="treeRef"
      >
      </el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data () {
    return {
      //所有角色列表数据
      rolesList: [],
      //保存修改用户状态的信息
      resetForm: {},
      //修改用户信息验证规则
      resetRules: {},
      resetDialogVisible: false,
      //控制用户添加对话框是否显示
      addDialogVisible: false,
      //存放用户添加信息
      addRolesForm: {},
      addRolesFormRules: {},
      //控制分配权限对话框的显示隐藏
      setRightDialogVisible: false,
      //保存权限列表
      rightsList: [],
      //树形控件的属性绑定对象
      treeProps: {
        //父子节点通过children属性进行嵌套
        children: 'children',
        //看到的属性对应的值
        label: 'authName'
      },
      //页面加载时默认显示的权限节点,根据id选中
      defKeys: [],
      //定义分配权限时对应的id数据
      roleID: ''
    }
  },
  created () {
    this.getRolesList()
  },
  methods: {
    //获取所有角色列表
    async getRolesList () {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200)
        return this.$message.error('获取用户角色失败')
      this.rolesList = res.data
    },
    //编辑用户权限
    async showRolesListDialong (id) {
      const { data: res } = await this.$http.get(`roles/${id}`)
      if (res.meta.status !== 200) return this.$message.error('请求失败')
      this.resetForm = res.data
      this.resetDialogVisible = true
    },
    //点击确定修改用户权限信息
    resetFormRoles (id) {
      this.$refs.resetFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put(
          `roles/${id}`,
          this.resetForm
        )
        this.$message.success('用户信息修改成功')

        this.resetDialogVisible = false

        this.getRolesList()
      })
    },
    //点击确定删除用户信息
    async removeFormRoles (id) {
      const removeRoles = await this.$confirm(
        '此操作将永久删除该用户, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      if (removeRoles !== 'confirm') return this.$message.info('取消删除用户')
      const { data: res } = await this.$http.delete(`roles/${id}`)
      if (res.meta.status !== 200) return this.$message.error('删除用户失败')
      this.$message.success('删除用户成功')
      this.getRolesList()
    },

    //添加用户
    addFormRoles () {
      this.$refs.addRolesFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('roles', this.addRolesForm)
        if (res.meta.status !== 201) return this.$message.error('用户添加失败')

        this.$message.success('添加用户成功')

        this.addDialogVisible = false

        this.getRolesList()
      })
    },
    //对话框关闭后重新刷新页面
    addRolesDialogClosed () {
      this.$refs.addRolesFormRef.resetFields()
    },
    //根据id删除用户对应的权限标签
    async removeRightById (role, rightId) {
      const result = await this.$confirm(
        '此操作将永久删除该权限, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      if (result !== 'confirm') return this.$message.info('取消删除成功')

      const { data: res } = await this.$http.delete(
        `roles/${role.id}/rights/${rightId}`
      )
      if (res.meta.status !== 200) return this.$message.error('删除权限失败')
      this.$message.success('该权限已删除')
      //把服务器返回的最新权限赋值给role.children，这样页面里面的数据就会自动更新，且不会退出当前界面，防止整个页面再次刷新
      role.children = res.data
    },
    //控制分配权限按钮
    async showSetRightDialog (role) {
      this.roleID = role.id
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200)
        return this.$message.error('获取用户权限失败！')
      //包获取到的权限保存在rigthsList中
      this.rightsList = res.data
      this.getLeafKeys(role, this.defKeys)
      this.setRightDialogVisible = true
    },
    //通过递归将所有三级权限的id获取，并保存在defKeys中
    getLeafKeys (node, arr) {
      //先判断当前这行权限内部是否还包含children属性，如果不包含，则是三级权限，那么就可以把id push到数组中
      //深度优先搜索算法(Depth-First-Search)

      //先给一个终止条件
      if (!node.children) {
        return arr.push(node.id)
      }
      //如果包含children，则继续遍历该数组，并采取递归的方法继续进行判断
      node.children.forEach(item => {
        this.getLeafKeys(item, arr)
      })
    },
    //每次添加分配权限对话框关闭之后，重置之前的权限列表
    setRightDialogClosed () {
      this.defKeys = []
    },
    //点击确定按钮，分配修改后的权限
    async allotRights () {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      //请求参数需要转换为以,分割的字符串
      const idStr = keys.join(',')
      //发送网络请求
      const { data: res } = await this.$http.post(
        `roles/${this.roleID}/rights`,
        { rids: idStr }
      )
      if (res.meta.status !== 200) return this.$message.error('分配权限失败！')
      this.$message.success('分配权限成功！')
      this.getRolesList()
      this.setRightDialogVisible = false
    }
  }
}
</script>
<style lang="less" scoped>
.el-tag {
  margin: 7px;
}
.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>
