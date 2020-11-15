<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card class="box-card">
      <!-- 搜索与添加区域 -->
      <el-row :gutter="15">
        <el-col :span="9">
          <el-input
            placeholder="请输入内容"
            v-model="queryInfo.query"
            clearable
            @clear="getUserList"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getUserList"
            ></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true"
            >添加用户</el-button
          >
        </el-col>
      </el-row>

      <!-- 用户列表区域 -->
      <el-table :data="userlist" border stripe>
        <!-- 设置表格前面的索引 -->
        <el-table-column type="index"></el-table-column>
        <el-table-column label="姓名" prop="username"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="电话" prop="mobile"></el-table-column>
        <el-table-column label="角色" prop="role_name"></el-table-column>
        <el-table-column label="状态">
          <!-- "当前行数据的获取也会用到插槽,scope相当于一行的数据， scope.row相当于当前行的数据对象,"
          <template v-slot:default="scope"> scope.row
          -->
          <template v-slot:default="{ row }">
            <el-switch v-model="row.mg_state" @change="userStateChange(row)">
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template #default="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditDialong(scope.row.id)"
            ></el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeUserById(scope.row.id)"
            ></el-button>
            <el-tooltip
              effect="dark"
              content="分配角色"
              placement="top"
              :enterable="false"
            >
              <el-button
                type="warning"
                icon="el-icon-setting"
                size="mini"
                @click="setRole(scope.row)"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>
    <!-- 添加用户对话框  visible.sync 控制对话框的显示隐藏-->
    <el-dialog
      title="提示"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClosed"
    >
      <!-- //验证表单区域 model：数据绑定对象 rules：数据验证对象 ref：引用对象  prop：校验规则，在rules内部实现-->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="70px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input type="password" v-model="addForm.password" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email" />
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addForm.mobile" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 添加修改用户对话框 -->
    <el-dialog
      title="修改用户"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialongClose"
    >
      <el-form
        :model="editForm"
        :rules="editFormRules"
        ref="editFormRef"
        label-width="80px"
      >
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email" />
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="editForm.mobile" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUser(editForm.id)"
          >确 定</el-button
        >
      </span>
    </el-dialog>

    <!-- 添加分配角色对话框 -->
    <el-dialog
      title="分配角色"
      :visible.sync="setRoleDialogVisible"
      width="50%"
      @close="setRoleDialogClose"
    >
      <div>
        <p>当前的用户：{{ userInfo.username }}</p>
        <p>当前的角色：{{ userInfo.role_name }}</p>
        <p>
          分配新角色：
          <el-select v-model="selectRoleId" placeholder="请选择">
            <el-option
              v-for="item in rolesList"
              :key="item.id"
              :label="item.roleName"
              :value="item.id"
            >
            </el-option>
          </el-select>
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  name: 'Users',
  data () {
    // 验证邮箱规则
    let checkEmail = (rule, value, cb) => {
      const regEmail = /^[A-Za-z\d]+([-_.][A-Za-z\d]+)*@([A-Za-z\d]+[-.])+[A-Za-z\d]{2,4}$/

      if (regEmail.test(value)) {
        return cb()
      }
      cb(new Error('邮箱不合法'))
    }
    //验证手机号
    let checkMobile = (rule, value, cb) => {
      const regMobile = /^[1][3,4,5,7,8][0-9]{9}$/
      if (regMobile.test(value)) {
        return cb()
      }
      cb(new Error('手机号不合法'))
    }
    return {
      //获取用户列表的参数对象
      queryInfo: {
        query: '',
        //当前的页数
        pagenum: 1,
        //当前每页显示多少条数据
        pagesize: 2
      },
      userlist: [],
      total: 0,
      //控制添加用户对话框显示或隐藏
      addDialogVisible: false,
      //控制修改用户对话框显示或隐藏
      editDialogVisible: false,
      //控制分配用户角色对话框显示或隐藏
      setRoleDialogVisible: false,
      //保存需要被分配角色的用户信息
      userInfo: {},
      // 保存角色列表信息
      rolesList: [],
      //保存已选中的角色id值
      selectRoleId: '',
      //保存修改用户的信息
      editForm: {},
      //数据绑定对象
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      //
      //数据校验规则
      addFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 3, max: 18, message: '长度在 6 到 18 个字符', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },

          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      //用户修改信息验证规则
      editFormRules: {
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      }
    }
  },
  created () {
    this.getUserList()
  },
  mounted () {},
  methods: {
    async getUserList () {
      const { data: res } = await this.$http.get('/users', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) return this.$message.error(res.meta.message)
      // console.log(res)
      this.userlist = res.data.users
      // this.total = res.data.total
    },
    //监听pagesize改变的事件
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      //每页显示多少条数据改变之后需要重新请求
      this.getUserList()
    },
    //监听页码值改变的事件
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.getUserList()
    },
    //监听开关按钮
    async userStateChange (userInfo) {
      const res = await this.$http.put(
        `users/${userInfo.id}/state/${userInfo.mg_state}`
      )
      if (res.status !== 200) {
        //验证失败，立即使用户状态还原
        userInfo.mg_state = !userInfo.mg_state
        return this.$message.error('更新用户状态信息失败')
      }
      this.$message.success('更新用户状态信息成功')
    },
    //监听添加用户对话框关闭并清空内容
    addDialogClosed () {
      this.$refs.addFormRef.resetFields()
    },
    //监听修改用户对话框关闭并清空内容
    editDialongClose () {
      this.$refs.editFormRef.resetFields()
    },
    //添加新用户
    addUser () {
      //拿到表单内容
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        //验证成功，发送请求
        // this.$http.post('user', this.addForm).then(res => {
        //   console.log(res)
        // })
        const { data: res } = await this.$http.post('users', this.addForm)

        if (res.meta.status !== 201) return this.$message.error('添加用户失败')

        this.$message.success('添加用户成功')
        //隐藏对话框
        this.addDialogVisible = false
        //重新刷新页面
        this.getUserList()
      })
    },
    //点击提交修改用户信息
    editUser (id) {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        //发送请求
        const { data: res } = await this.$http.put(`users/${id}`, this.editForm)
        if (res.meta.status !== 200) this.$message.error('用户信息修改失败')
        this.$message.success('用户信息修改成功')
        this.getUserList()
        this.editDialogVisible = false
      })
    },
    //实现用户修改功能
    async showEditDialong (id) {
      const { data: res } = await this.$http.get(`users/${id}`)
      if (res.meta.status !== 200)
        return this.$message.error('查询用户信息失败')
      this.editForm = res.data
      this.editDialogVisible = true
    },
    //根据id实现用户删除功能
    async removeUserById (id) {
      const removeConfirm = await this.$confirm(
        '此操作将永久删除该用户, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      //如果用户取消删除，返回字符串 cancel
      //如果用户确认删除，返回字符串 confirm
      if (removeConfirm !== 'confirm') return this.$message.info('已取消删除')
      const { data: res } = await this.$http.delete(`users/${id}`)
      if (res.meta.status !== 200) return this.$message.error('删除用户失败')
      this.$message.success('删除用户成功')
      this.getUserList()
    },
    //展示分配用户角色对话框
    async setRole (userInfo) {
      this.userInfo = userInfo
      //展开分配用户角色对话前，获取所有角色的列表
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200)
        return this.$message.error('分配用户角色失败')
      this.rolesList = res.data
      this.setRoleDialogVisible = true
    },
    //点击确定按钮，分配角色
    async saveRoleInfo () {
      if (!this.selectRoleId) {
        return this.$message.error('请选择要分配的角色！')
      }
      const { data: res } = await this.$http.put(
        `users/${this.userInfo.id}/role`,
        { rid: this.selectRoleId }
      )
      if (res.meta.status !== 200) return this.$message.error('更新角色失败')
      this.$message.success('更新用户角色成功')
      this.getUserList()
      this.setRoleDialogVisible = false
    },
    //分配角色对话框关闭后重置内容
    setRoleDialogClose () {
      this.selectRoleId = ''
      this.userInfo = {}
    }
  }
}
</script>
<style lang="" scoped></style>
