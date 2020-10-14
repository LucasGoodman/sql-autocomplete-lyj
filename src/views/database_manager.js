/**
 * Created by Lucas on 2020/10/13.
 * 数据元管理
 */
import db_api from '../api_model/modules/database';
import { DATA_TYPES, COLUMN_TYPES } from "./utils";

const getChainString = (chain) => {
    return chain.join('.');
};
const databaseTree = {};

class DatabaseManager {
    constructor(option) {
        let self = this;
        let { mark } = option;
        this.mark = mark;
        if (!databaseTree[mark]) {
            self.databaseTree = {};
        }
        databaseTree[mark] = self.databaseTree;
    }

    async getDatabases() {
        let self = this;
        let list = [];
        let databaseKeys = Object.keys(self.databaseTree);
        if (databaseKeys.length === 0) {
            await self.fetchAndCacheDatabases();
        }
        list = Object.values(self.databaseTree).map(db => db.databaseName);
        return list;
    }

    async getTables(identifierChain) {
        let self = this;
        let list = [];
        // 如果有数据库标识
        if (identifierChain) {
            let dbName = identifierChain[0].name;
            let targetDatabase = self.databaseTree[dbName];
            if (targetDatabase) {
                if (!targetDatabase['tables']) {
                    await self.fetchAndCacheTableData(dbName);
                }
                list = Object.values(targetDatabase['tables']).map(table => {
                    return {
                        name: table.name,
                        chain: table.chain
                    };
                });
            }
        } else {
            for (let database in self.databaseTree) {
                if (self.databaseTree.hasOwnProperty(database)) {
                    let targetTables = self.databaseTree[database]['tables'];
                    if (targetTables) {
                        Object.values(targetTables).forEach(table => {
                            list = [
                                ...list,
                                {
                                    name: table.name,
                                    chain: table.chain
                                }
                            ];
                        });
                    }
                }
            }
        }
        return list;
    }

    async getColumns(identifierChain) {
        let self = this;
        let list = [];
        let dbName = identifierChain[0].name;
        let tbName = identifierChain[1].name;
        if (!self.databaseTree[dbName] || !self.databaseTree[dbName]['tables'][tbName] || !self.databaseTree[dbName]['tables'][tbName]['columns']) {
            await self.fetchAndCacheTableInfo(dbName, tbName);
        }
        let columns = self.databaseTree[dbName]['tables'][tbName]['columns'];
        list = Object.values(columns).map(col => {
            return {
                name: col.name,
                chain: col.chain
            };
        });
        return list;
    }

    /**
     * 获取并缓存 数据库 列表数据
     * */
    async fetchAndCacheDatabases() {
        let self = this;
        let res = await db_api.fetchDatabases();
        let databases = res.databases;
        databases.forEach(db => {
            self.databaseTree[db] = {
                databaseName: db,
                type: DATA_TYPES.database,
                tables: null,
                chain: []
            };
        });
    }

    /**
     * 获取并缓存 表 列表数据
     * */
    async fetchAndCacheTableData(dbName) {
        let self = this;
        let res = await db_api.fetchTables(dbName);
        let tables = res.tablesMeta;
        let targetDatabase = self.databaseTree[dbName];
        // todo: 获取并缓存 数据库 列表数据
        targetDatabase.tables = {};
        tables.forEach(tb => {
            targetDatabase.tables[tb] = {
                name: tb,
                type: DATA_TYPES.table,
                columns: null, // 用column字段直接判断当前表格是否加载了详情
                chain: [dbName]
            };
        });
    }

    /**
     * 获取并缓存 表 详情数据
     * */
    async fetchAndCacheTableInfo(dbName, tbName) {
        let self = this;
        let res = await db_api.fetchTableInfo(dbName, tbName);
        let targetTable = self.databaseTree[dbName]['tables'][tbName];
        // todo: 获取并缓存 数据库 列表数据
        let { extendedColumns, partitionColumns, hdfsLink, comment, isView } = res;
        let columns = {};
        extendedColumns.forEach(column => {
            let { comment, name, type } = column;
            columns[name] = {
                comment,
                name,
                type,
                isPartition: false,
                chain: [dbName, tbName]
            };
        });
        partitionColumns.forEach(column => {
            let { comment, name, type } = column;
            columns[name] = {
                comment,
                name,
                type,
                isPartition: true,
                chain: [dbName, tbName]
            };
        });
        self.databaseTree[dbName]['tables'][tbName] = {
            ...targetTable,
            columns,
            hdfsLink,
            comment,
            isView
        };
    };
}

export default DatabaseManager;
