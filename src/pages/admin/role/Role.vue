<template>
    <a-layout>
        <a-layout-header :style="{background:'transparent',height:'10px'}">

        </a-layout-header>
        <a-layout-content :style="{padding: '24px', background: '#fff', minHeight: '280px' }">
            <div style="width: 100%;height: 50px">
                <a-button type="primary" @click="showModal" v-auth="`POST`">
                    新增
                </a-button>
            </div>

            <a-modal
                    :title="modal.title"
                    :visible="modal.visible"
                    :confirm-loading="modal.loading"
                    :maskClosable="false"
                    @ok="onSubmit"
                    @cancel="handleCancel"
            >

                <a-form-model ref="ruleForm" :model="form" :label-col="{span: 4}" :wrapper-col="{span: 15}"
                              :rules="rules">

                    <a-form-model-item label="名称" prop="name">
                        <a-input v-model="form.name" placeholder="请输入名称"/>
                    </a-form-model-item>

                    <a-form-model-item label="上级" prop="pid">
                        <a-tree-select
                                v-model="form.pid"
                                :treeData="roleData"
                                placeholder="请选择"
                                :replaceFields="{children:'children', title:'name', key:'id', value: 'id'}"
                        />
                    </a-form-model-item>

                    <a-form-model-item label="规则" prop="rule">
                        <a-tree
                                v-model="form.rule"
                                :checkable="true"
                                :treeData="ruleData"
                                :replaceFields="{children:'children', title:'name', key:'id'}"
                                :checkStrictly="true"
                                @check="treeCheck"
                        />

                    </a-form-model-item>
                </a-form-model>
            </a-modal>

            <a-table v-if="tableData.length > 0"
                     :columns="columns"
                     :data-source="tableData"
                     :loading="tableLoading"
                     rowKey="id"
                     :defaultExpandAllRows="true"
            >

                <span slot="action" slot-scope="text, record">
                  <a @click="edit(record)" v-if="record.id === 1" :disabled="true">修改</a>
                  <a @click="edit(record)" v-else v-auth="`PUT`">修改</a>
                  <a-divider type="vertical"/>
                  <a-popconfirm
                          title="确定删除吗？"
                          ok-text="确认"
                          cancel-text="取消"
                          @confirm="delConfirm(record)"
                  >
                   <a href="#" v-if="record.id === 1" :disabled="true">删除</a>
                   <a href="#" v-else v-auth="`DELETE`">删除</a>
                  </a-popconfirm>
                </span>
            </a-table>

        </a-layout-content>
    </a-layout>

</template>

<script>
    import {ROLE, RULE_SELECT, ROLE_SELECT} from '@/services/api'
    import {METHOD, request} from "@/utils/request";

    const columns = [
        {
            title: '名称',
            dataIndex: 'name',
            key: 'name',
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

                columns,
                tableData: [],
                tableLoading: false,

                modal: {
                    title: '',
                    visible: false,
                    loading: false
                },

                form: {
                    name: '',
                    pid: undefined,
                    rule: [],
                },
                rules: {
                    name: [{required: true, message: '请输入名称', trigger: 'blur'}],
                    pid: [{required: true, message: '请选择上级', trigger: 'blur'}],
                    rule: [{required: true, message: '请选择规则', trigger: 'blur'}],
                },

                ruleData: [],
                roleData: [],

            }
        },
        mounted() {
            this.fetch()
        },
        methods: {
            fetch() {
                this.tableLoading = true
                request(ROLE, METHOD.GET).then(res => {
                    if (res) {
                        this.tableData = res.data.data
                    }
                    this.tableLoading = false
                })
            },
            showModal() {
                this.id = 0
                this.getSelectData().then(() => {
                    this.modal = {title: '新增', visible: true, loading: false}
                })
            },
            edit(e) {
                this.id = e.id
                //数据重组
                let rule = []
                e.rule.split(',').forEach(function (item) {
                    rule.push(parseInt(item))
                })
                this.getSelectData().then(() => {
                    this.modal = {title: '修改', visible: true, loading: false}
                    this.form = {name: e.name, pid: e.pid, rule: rule}
                })
            },
            delConfirm(e) {
                request(ROLE + '/' + e.id, METHOD.DELETE).then(res => {
                    if (res) {
                        this.$message.success('删除成功', 3)
                        //成功接着往下走
                        this.fetch()
                    }
                })
            },

            onSubmit() {
                this.modal.loading = true
                this.$refs.ruleForm.validate(valid => {
                    if (valid) {
                        let url = ROLE
                        let method = METHOD.POST
                        if (this.id > 0) {
                            url = ROLE + '/' + this.id
                            method = METHOD.PUT
                        }
                        request(url, method, this.getParams()).then(res => {
                            if (res) {
                                //成功接着往下走
                                this.fetch()
                                this.handleCancel()
                            }
                        })

                    } else {
                        return false
                    }
                })
                this.modal.loading = false
            },
            handleCancel() {
                this.clearForm()
                this.$refs.ruleForm.resetFields();
                this.modal.visible = false
            },
            clearForm() {
                this.form = {name: '', pid: undefined, rule: []}
            },
            //内部获取下拉数据
            async getSelectData() {
                request(RULE_SELECT, METHOD.GET).then(res => {
                    if (res) {
                        this.ruleData = res.data.data
                    }
                })

                request(ROLE_SELECT, METHOD.GET).then(res => {
                    if (res) {
                        this.roleData = res.data.data
                    }
                })
            },
            //更换规则触发
            treeCheck(checkedKeys, e) {
                if (e.checked) {
                    this.checkedKeys = checkedKeys;
                    let list = this.backFather(
                        e.node.eventKey,
                        this.ruleData,
                        "children",
                        "pid"
                    )
                    // 选中添加：1.如果有父级，将各层父级都勾选；
                    this.checkedKeys.checked.push(...list);
                    //去除重复id
                    this.checkedKeys.checked = [...new Set(this.checkedKeys.checked)];
                }
                this.form.rule = checkedKeys.checked
            },

            backFather(id, tree, childName, parentId, end = 0) {
                let list = [id];
                function backArr(childId, arr) {
                    arr.forEach((item) => {
                        if (item.id === childId) {
                            // 找到指定的id了,进入寻找父级id
                            if (item[parentId] === end) {
                                // 到第一级了
                                // list.unshift(0);
                            } else {
                                // 进入循环查找
                                list.unshift(item[parentId]);
                                backArr(item[parentId], tree);
                            }
                        } else if (item[childName] && item[childName].length > 0) {
                            backArr(childId, item[childName]);
                        }
                    });
                    return list;
                }
                return backArr(id, tree);
            },

            //数据转化
            getParams() {
                return {name: this.form.name, pid: this.form.pid, rule: this.form.rule.join(",")}
            }
        }
    }
</script>

<style scoped>

</style>