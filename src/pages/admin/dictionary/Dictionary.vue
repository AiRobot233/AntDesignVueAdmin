<template>
  <a-layout>
    <a-layout-header :style="{background:'transparent',height:'10px'}">

    </a-layout-header>
    <a-layout-content :style="{padding: '24px', background: '#fff', minHeight: '280px' }">
      <div style="width: 100%;height: 50px">
        <a-button type="primary" @click="showModal" v-auth="`create`">
          新增
        </a-button>
      </div>

      <a-modal
          :title="modalTitle"
          :visible="visible"
          :confirm-loading="confirmLoading"
          :maskClosable="false"
          @ok="onSubmit"
          @cancel="handleCancel"
      >
        <a-form-model ref="dictionaryForm" :model="form" :label-col="{span: 4}" :wrapper-col="{span: 14}"
                      :rules="rules">
          <a-form-model-item label="上级" prop="pid">
            <a-tree-select
                v-model="form.pid"
                show-search
                placeholder="请选择上级"
                allow-clear
                tree-default-expand-all
                :treeData="treeData"
                :replaceFields="{chilabelColldren:'children', title:'value', key:'id', value: 'id'}"
            >
            </a-tree-select>
          </a-form-model-item>
          <a-form-model-item label="名称" prop="name">
            <a-input v-model="form.name" placeholder="请输入名称"/>
          </a-form-model-item>

          <a-form-model-item label="值" prop="value">
            <a-input v-model="form.value" placeholder="请输入值"/>
          </a-form-model-item>

          <a-form-model-item label="排序值" prop="sort">
            <a-input-number :precision="0" :min="0" style="width: 100%;" v-model="form.sort"
                            placeholder="请输入排序值"/>
          </a-form-model-item>

        </a-form-model>
      </a-modal>

      <a-table
          :columns="columns"
          :data-source="data"
          :loading="loading"
          rowKey="id"
      >
                <span slot="action" slot-scope="text, record">
                  <a @click="edit(record)" v-auth="`update`">修改</a>
                  <a-divider type="vertical"/>
                  <a-popconfirm
                      title="确定删除吗？"
                      ok-text="确认"
                      cancel-text="取消"
                      @confirm="delConfirm(record)"
                  >
                    <a href="#" v-if="record.children !== null" :disabled="true">删除</a>
                    <a href="#" v-else v-auth="`delete`">删除</a>
                  </a-popconfirm>
                </span>
      </a-table>
    </a-layout-content>
  </a-layout>
</template>

<script>
import {DICTIONARY, SUB} from '@/services/api'
import {METHOD, request} from "@/utils/request";

const columns = [
  {
    title: '名称',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: '值',
    dataIndex: 'value',
    key: 'value',
    align: 'center',
  },
  {
    title: '操作',
    key: 'action',
    scopedSlots: {customRender: 'action'},
    align: 'center',
  },
];

export default {
  data() {
    return {
      id: 0,

      data: [],
      columns,
      loading: false,

      form: {
        pid: undefined,
        name: '',
        value: '',
        sort: 0,
      },

      rules: {
        pid: [{required: true, message: '请选择上级', trigger: 'blur'}],
        name: [{required: true, message: '请输入名称', trigger: 'blur'}],
        value: [{required: true, message: '请输入值', trigger: 'blur'}],
        sort: [{required: true, message: '请输入排序值', trigger: 'blur'}],
      },

      visible: false,
      confirmLoading: false,
      modalTitle: '',

      isMethod: false,

      treeData: [],
    };
  },
  mounted() {
    this.fetch();
  },
  methods: {
    fetch() {
      this.loading = true;
      request(DICTIONARY, METHOD.GET).then((res) => {
        if (res) {
          this.data = res.data.data
        }
        this.loading = false;
      });
    },
    //打开表单
    showModal() {
      this.getTreeData().then(() => {
        this.id = 0
        this.clearForm()
        this.modalTitle = '新增';
        this.visible = true;
      })
    },
    //表单提交
    onSubmit() {
      this.confirmLoading = true
      this.$refs.dictionaryForm.validate(valid => {
        if (valid) {
          let url = DICTIONARY
          let method = METHOD.POST
          if (this.id > 0) {
            url = DICTIONARY + '/' + this.id
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
      });
      this.confirmLoading = false
    },
    //表单取消
    handleCancel() {
      this.visible = false;
      this.$refs.dictionaryForm.resetFields();
      this.clearForm()
    },

    //删除二次确认
    delConfirm(e) {
      request(DICTIONARY + '/' + e.id, METHOD.DELETE).then((res) => {
        if (res) {
          this.$message.success('删除成功', 3)
          //成功接着往下走
          this.fetch()
        }
      });
    },
    //修改按钮点击
    edit(e) {
      this.getTreeData().then(() => {
        this.id = e.id
        this.modalTitle = '修改';
        this.form = {
          pid: e.pid,
          name: e.name,
          value: e.value,
          sort: e.sort,
        }
        this.visible = true;
      })
    },

    //清空数据
    clearForm() {
      this.form = {
        pid: undefined,
        name: '',
        value: '',
        sort: 0,
      }
    },
    //内部获取下拉数据
    async getTreeData() {
      request(SUB, METHOD.POST, {'dictionary': ''}).then(res => {
        if (res) {
          let arr = []
          arr.push({id: 0, value: '顶级', children: res.data.data})
          this.treeData = arr
        }
      })

    },
  }
};
</script>

<style scoped>

</style>