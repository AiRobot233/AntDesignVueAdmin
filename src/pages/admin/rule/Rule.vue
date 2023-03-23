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
                <a-form-model ref="ruleForm" :model="form" :label-col="{span: 4}" :wrapper-col="{span: 14}"
                              :rules="rules">
                    <a-form-model-item label="上级" prop="pid">
                        <a-tree-select
                                v-model="form.pid"
                                show-search
                                placeholder="请选择上级"
                                allow-clear
                                tree-default-expand-all
                                :treeData="treeData"
                                :replaceFields="{chilabelColldren:'children', title:'name', key:'id', value: 'id'}"
                        >
                        </a-tree-select>
                    </a-form-model-item>
                    <a-form-model-item label="名称" prop="name">
                        <a-input v-model="form.name" placeholder="请输入名称"/>
                    </a-form-model-item>
                    <a-form-model-item label="类型" prop="type">
                        <a-select v-model="form.type" placeholder="请选择类型" @change="typeChange">
                            <a-select-option value="page">page</a-select-option>
                            <a-select-option value="api">api</a-select-option>
                        </a-select>
                    </a-form-model-item>
                    <a-form-model-item label="路由" prop="router">
                        <a-input v-model="form.router" placeholder="请输入地址/路由"/>
                    </a-form-model-item>

                    <a-form-model-item label="路由规则" v-if="isMethod">
                        <a-select v-model="form.method" placeholder="路由规则">
                            <a-select-option value="GET">GET</a-select-option>
                            <a-select-option value="POST">POST</a-select-option>
                            <a-select-option value="PUT">PUT</a-select-option>
                            <a-select-option value="DELETE">DELETE</a-select-option>
                        </a-select>
                    </a-form-model-item>

                  <a-form-model-item label="按钮权限" v-if="isMethod">
                      <a-input v-model="form.tag" placeholder="请输入按钮权限"/>
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
                  <a @click="addChildren(record)" v-if="record.type === 'page'">创建子规则</a>
                  <a-divider type="vertical"/>
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
    import {RULE, SUB} from '@/services/api'
    import {METHOD, request} from "@/utils/request";

    const columns = [
        {
            title: '名称',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: '类型',
            dataIndex: 'type',
            key: 'type',
            width: '12%',
            align: 'center',
        },
        {
            title: '路由',
            dataIndex: 'router',
            width: '30%',
            key: 'router',
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
                    type: undefined,
                    router: '',
                    method: undefined,
                    tag: ''
                },

                rules: {
                    pid: [{required: true, message: '请选择上级', trigger: 'blur'}],
                    name: [{required: true, message: '请输入名称', trigger: 'blur'}],
                    type: [{required: true, message: '请选择类型', trigger: 'blur'}],
                    router: [{required: true, message: '请输入地址/路由', trigger: 'blur'}],
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
                request(RULE, METHOD.GET).then((res) => {
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
                this.$refs.ruleForm.validate(valid => {
                    if (valid) {
                        let url = RULE
                        let method = METHOD.POST
                        if (this.id > 0) {
                            url = RULE + '/' + this.id
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
                this.typeChange('page') //清除选择
                this.$refs.ruleForm.resetFields();
                this.clearForm()
            },

            //删除二次确认
            delConfirm(e) {
                request(RULE + '/' + e.id, METHOD.DELETE).then((res) => {
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
                    this.typeChange(e.type)
                    this.form = {
                        pid: e.pid,
                        name: e.name,
                        type: e.type,
                        router: e.router,
                        method: e.method,
                    }
                    this.visible = true;
                })
            },
            //创建子规则
            addChildren(e){
                this.getTreeData().then(() => {
                    this.modalTitle = '新增';
                    this.form = {
                        pid: e.id,
                        name: '',
                        type: undefined,
                        router: '',
                        method: undefined,
                    }
                    this.visible = true;
                })
            },

            //类型选择更换，触发路由规则
            typeChange(value) {
                if (value === 'page') {
                    this.isMethod = false
                    this.form.method = undefined
                }
                if (value === 'api') {
                    this.isMethod = true
                }
            },
            //清空数据
            clearForm() {
                this.form = {
                    pid: undefined,
                    name: '',
                    type: undefined,
                    router: '',
                    method: undefined,
                }
            },
            //内部获取下拉数据
            async getTreeData() {
                request(SUB, METHOD.POST, {'rule': 'page'}).then(res => {
                    if (res) {
                        this.treeData = res.data.data
                    }
                })
            },
        }
    };
</script>

<style scoped>

</style>