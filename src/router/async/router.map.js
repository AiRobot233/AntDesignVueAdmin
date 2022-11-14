// 视图组件
const view = {
    tabs: () => import('@/layouts/tabs'),
    blank: () => import('@/layouts/BlankView'),
    page: () => import('@/layouts/PageView')
}

// 路由组件注册
const routerMap = {
    login: {
        authority: '*',
        path: '/login',
        component: () => import('@/pages/login')
    },
    root: {
        path: '/',
        name: '首页',
        redirect: '/login',
        component: view.tabs
    },
    exp403: {
        authority: '*',
        name: 'exp403',
        path: '403',
        component: () => import('@/pages/exception/403')
    },
    exp404: {
        name: 'exp404',
        path: '404',
        component: () => import('@/pages/exception/404')
    },
    exp500: {
        name: 'exp500',
        path: '500',
        component: () => import('@/pages/exception/500')
    },

    home: {
        name: '首页',
        icon: 'home',
        component: () => import('@/pages/admin/home/Home')
    },
    system: {
        name: '系统设置',
        icon: 'setting',
        component: view.blank
    },

    rule: {
        name: '规则配置',
        meta: {
            authority: {
                role: 'rule'
            }
        },
        icon: 'bars',
        component: () => import('@/pages/admin/rule/Rule')
    },
    role: {
        name: '角色配置',
        meta: {
            authority: {
                role: 'role'
            }
        },
        icon: 'team',
        component: () => import('@/pages/admin/role/Role')
    },
    user: {
        name: '用户管理',
        meta: {
            authority: {
                role: 'user'
            }
        },
        icon: 'user',
        component: () => import('@/pages/admin/user/User')
    }
}
export default routerMap

