//跨域代理前缀
const API_PROXY_PREFIX = '/api'
const BASE_URL = process.env.NODE_ENV === 'production' ? process.env.VUE_APP_API_BASE_URL : API_PROXY_PREFIX
// const BASE_URL = process.env.VUE_APP_API_BASE_URL
module.exports = {
    LOGIN: `${BASE_URL}/login`,
    ROUTES: `${BASE_URL}/routes`,
    GOODS: `${BASE_URL}/goods`,
    GOODS_COLUMNS: `${BASE_URL}/columns`,

    RULE: `${BASE_URL}/rule`,
    RULE_SELECT: `${BASE_URL}/rule/select`,

    ROLE: `${BASE_URL}/role`,
    ROLE_SELECT: `${BASE_URL}/role/select`,

    USER: `${BASE_URL}/user`,

    CHANGE_PWD: `${BASE_URL}/change/pwd`,

    DICTIONARY: `${BASE_URL}/dictionary`,
    DICTIONARY_SELECT: `${BASE_URL}/dictionary/select`,
    UNIT_DICTIONARY: `${BASE_URL}/unit/dictionary`,

}
