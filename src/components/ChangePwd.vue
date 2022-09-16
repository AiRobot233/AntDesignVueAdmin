<template>
    <a-modal
            title="修改密码"
            :visible="visible"
            @ok="handleOk"
            @cancel="handleCancel"
            :maskClosable="false"
            :confirmLoading="loading"
    >
        <a-form-model
                :model="form"
                :rules="rules"
                ref="form"
                layout="horizontal"
                :label-col="{ span: 6 }"
                :wrapper-col="{ span: 14 }"
        >
            <a-form-model-item prop="password" label="旧密码">
                <a-input
                        v-model="form.password"
                        placeholder="请输入旧密码"
                        type="password"
                ></a-input>
            </a-form-model-item>
            <a-form-model-item prop="newPassword" label="新密码" has-feedback>
                <a-input
                        v-model="form.newPassword"
                        placeholder="请输入新密码"
                        type="password"
                ></a-input>
            </a-form-model-item>
            <a-form-model-item prop="newPassword2" label="确认新密码" has-feedback>
                <a-input
                        v-model="form.newPassword2"
                        placeholder="请再次输入新密码"
                        type="password"
                ></a-input>
            </a-form-model-item>

        </a-form-model>
    </a-modal>
</template>

<script>
    import {METHOD, request} from "../utils/request";
    import {CHANGE_PWD} from '../services/api'

    export default {
        props: {
            visible: {},
        },
        data() {
            // 表单验证
            let validateNewPassword = (rule, value, callback) => {
                if (value === this.form.password) {
                    callback(new Error("新密码不能与旧密码相同"));
                } else {
                    callback();
                }
            };
            let validateNewPassword2 = (rule, value, callback) => {
                if (value !== this.form.newPassword) {
                    callback(new Error("与新密码不一致"));
                } else {
                    callback();
                }
            };
            return {
                loading: false,

                form: {
                    password: "",
                    newPassword: "",
                    newPassword2: "",
                },
                rules: {
                    password: [
                        {required: true, message: "请输入旧密码", trigger: "change"},
                    ],
                    newPassword: [
                        {required: true, message: "请输入新密码", trigger: "change"},
                        {validator: validateNewPassword, trigger: "change"},
                    ],
                    newPassword2: [
                        {required: true, message: "请重新输入新密码", trigger: "change"},
                        {validator: validateNewPassword2, trigger: "change"},
                    ],
                },
            }
        },
        methods: {
            handleOk() {
                this.$refs.form.validate(valid => {
                    if (valid) {
                        this.loading = true
                        let params = {
                            old_password: this.form.password,
                            password: this.form.newPassword2
                        }
                        request(CHANGE_PWD, METHOD.PUT, params).then((res) => {
                            if (res) {
                                this.$message.success('修改密码成功');
                            }
                            this.loading = false
                        });
                    } else {
                        return false
                    }
                })


            },
            handleCancel() {
                this.clearForm()
                this.$refs.form.resetFields()
                this.$emit('setVisible', false)
            },
            clearForm() {
                this.form = {password: "", newPassword: "", newPassword2: ""}
            },
        }

    }
</script>

<style scoped>

</style>