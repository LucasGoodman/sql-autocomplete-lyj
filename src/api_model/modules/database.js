/**
 * Created by Lucas on 2019/10/30.
 */
import { $axios } from '../api';

export default {
    /**
     * 请求数据库列表
     * @returns {*}
     */
    fetchDatabases() {
        return $axios.post('/v1/meta-notebook/autocomplete');
    },
    /**
     * 请求表列表
     * @returns {*}
     */
    fetchTables(database) {
        return $axios.post(`/v1/meta-notebook/autocomplete/${database}`);
    },
    /**
     * 请求表详情
     * @returns {*}
     */
    fetchTableInfo(database, table) {
        return $axios.post(`/v1/meta-notebook/autocomplete/${database}/${table}`);
    }
};
