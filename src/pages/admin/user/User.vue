<template>
  <a-layout>
    <a-layout-header :style="{background:'transparent',height:'10px'}">

    </a-layout-header>
    <a-layout-content :style="{padding: '24px', background: '#fff', minHeight: '280px' }">
      <div style="width: 100%;height: 50px">
        <a-button type="primary" @click="showModal" v-auth="`create`" style="float: left">新增</a-button>

        <div style="float: right;">
          <a-tree-select
              v-model="search.role_id"
              style="width: 160px;margin-right: 10px"
              :treeData="roleData"
              placeholder="请选择角色组搜索"
              :replaceFields="{children:'children', title:'name', key:'id', value: 'id'}"
              :allowClear="true"
              @change="searchTree"
          />
          <a-input-search v-model="search.keyword" style="width: 250px" placeholder="名称/电话搜索" enter-button
                          @search="onSearch"/>
        </div>
      </div>

      <a-modal
          :title="modal.title"
          :visible="modal.visible"
          :confirmLoading="modal.loading"
          @ok="handleOk"
          @cancel="handleCancel"
      >
        <a-form-model ref="ruleForm" :model="form" :label-col="{span: 4}" :wrapper-col="{span: 16}"
                      :rules="rules">
          <a-form-model-item label="名称" prop="name">
            <a-input v-model="form.name" placeholder="请输入名称"/>
          </a-form-model-item>

          <a-form-model-item label="电话" prop="phone">
            <a-input v-model="form.phone" placeholder="请输入电话"/>
          </a-form-model-item>

          <a-form-model-item label="角色组" prop="role_id">
            <a-tree-select
                v-model="form.role_id"
                :treeData="roleData"
                placeholder="请选择"
                :replaceFields="{children:'children', title:'name', key:'id', value: 'id'}"
            />
          </a-form-model-item>

          <a-form-model-item label="密码" v-if="id > 0">
            <a-input-password v-model="form.password" placeholder="不填默认不修改密码"/>
          </a-form-model-item>

          <a-form-model-item label="状态" prop="status">
            <a-radio-group name="radioGroup" v-model="form.status">
              <a-radio :value="1">正常</a-radio>
              <a-radio :value="2">禁用</a-radio>
            </a-radio-group>
          </a-form-model-item>

        </a-form-model>
      </a-modal>

      <a-table
          :columns="columns"
          :data-source="data"
          rowKey="id"
          :pagination="pagination"
          @change="tableChange"
          :loading="loading"
      >

                <span slot="status" slot-scope="text, record">
                    <a-badge v-if="record.status === 1" status="success" text="正常"/>
                    <a-badge v-else status="error" text="禁用"/>
                </span>

        <span slot="action" slot-scope="text, record">
                  <a @click="edit(record)" v-if="record.id === 1" :disabled="true">修改</a>
                  <a @click="edit(record)" v-else v-auth="`update`">修改</a>
                  <a-divider type="vertical"/>
                  <a-popconfirm
                      title="确定删除吗？"
                      ok-text="确认"
                      cancel-text="取消"
                      @confirm="delConfirm(record)"
                  >
                    <a href="#" v-if="record.id === 1" :disabled="true">删除</a>
                    <a href="#" v-else v-auth="`delete`">删除</a>
                  </a-popconfirm>
                </span>

      </a-table>

    </a-layout-content>
  </a-layout>
</template>

<script>
import {request, METHOD} from "@/utils/request";
import {USER, SUB} from '@/services/api'

const columns = [
  {
    title: '名称',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: '电话',
    dataIndex: 'phone',
    key: 'phone',
    align: 'center',
  },
  {
    title: '所属角色',
    dataIndex: 'role.name',
    key: 'role',
    align: 'center',
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    scopedSlots: {customRender: 'status'},
    align: 'center',
  },
  {
    title: '操作',
    key: 'action',
    scopedSlots: {customRender: 'action'},
    align: 'center',
  },
]
export default {
  data() {
    return {
      id: 0,

      columns,
      data: [],
      pagination: {
        current: 1,
        pageSize: 10,
        size: "small",
        showSizeChanger: true,
        pageSizeOptions: ["10", "20", "30"],
        showTotal: (total) => {
          return '共' + total + '条'
        },
        onShowSizeChange: (current, pageSize) => {
          this.pagination.pageSize = pageSize
        },
      },
      loading: false,

      modal: {
        visible: false,
        loading: false,
        title: '',
      },
      form: {
        name: '',
        phone: '',
        role_id: undefined,
        status: 1
      },
      rules: {
        name: [{required: true, message: '请输入名称', trigger: 'blur'}],
        phone: [{required: true, message: '请输入电话', trigger: 'blur'}],
        role_id: [{required: true, message: '请选择角色组', trigger: 'blur'}],
        status: [{required: true, message: '请选择状态', trigger: 'blur'}],
      },

      roleData: [],

      //搜索
      search: {
        keyword: '',
        role_id: undefined
      }
    }
  },
  mounted() {
    this.getRoleData()
    this.fetch({page: 1, pageSize: 10});
  },
  methods: {
    fetch(data) {
      this.loading = true;
      request(USER, METHOD.GET, data).then((res) => {
        if (res) {
          this.data = res.data.data.list
          const pagination = {...this.pagination};
          pagination.total = res.data.data.total;
          this.pagination = pagination;
        }
        this.loading = false;
      });
    },
    tableChange(pagination) {
      const pager = {...this.pagination};
      pager.current = pagination.current;
      this.pagination = pager;
      this.fetch({
        page: pagination.current,
        pageSize: pagination.pageSize,
      })
    },

    showModal() {
      this.id = 0
      this.getRoleData().then(() => {
        this.modal = {title: '新增', visible: true, loading: false}
      })
    },
    edit(e) {
      this.id = e.id
      this.getRoleData().then(() => {
        this.modal = {title: '修改', visible: true, loading: false}
        this.form = {name: e.name, phone: e.phone, role_id: e.role_id, status: e.status}
      })
    },
    delConfirm(e) {
      request(USER + '/' + e.id, METHOD.DELETE).then((res) => {
        if (res) {
          this.$message.success('删除成功', 3)
          //成功接着往下走
          this.fetch()
        }
      });
    },

    handleOk() {
      this.modal.loading = true
      this.$refs.ruleForm.validate(valid => {
        if (valid) {
          let url = USER
          let method = METHOD.POST
          if (this.id > 0) {
            url = USER + '/' + this.id
            method = METHOD.PUT
          }
          //提交信息
          request(url, method, this.form).then((res) => {
            if (res) {
              this.$message.success('操作成功', 3)
              //成功接着往下走
              this.fetch()
              this.handleCancel()
            }
          });
        } else {
          return false;
        }
      })
      this.modal.loading = false
    },
    handleCancel() {
      this.clearForm()
      this.$refs.ruleForm.resetFields()
      this.modal.visible = false
    },
    clearForm() {
      this.form = {name: '', phone: '', role_id: undefined, status: 1}
    },

    //内部获取下拉数据
    async getRoleData() {
      request(SUB, METHOD.POST, {'role': ''}).then(res => {
        if (res) {
          this.roleData = res.data.data
        }
      })
    },

    //搜索
    onSearch(value) {
      this.search.keyword = value
      this.fetch(Object.assign({page: 1, pageSize: 10}, this.search));
    },
    //树状搜索
    searchTree(value) {
      this.search.role_id = value
      this.fetch(Object.assign({page: 1, pageSize: 10}, this.search));
    }
  }
}
</script>

<style scoped>

</style>