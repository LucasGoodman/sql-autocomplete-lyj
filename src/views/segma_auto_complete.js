import * as ko from "knockout";

/**
 * Created by Lucas on 2020/10/13.
 * sql自动补全，用于解析sql语法建议，呈现相关提示
 */

import { CATEGORIES } from './utils';
import DatabaseManager from "./database_manager";
import { UDF_CATEGORIES } from './udfReference';

const BaseSuggestion = {
    value: '', // 插入值
    meta: '', // 显示名
    category: CATEGORIES.KEYWORD,
    weightAdjust: 0, // 权重
    popular: false, // 不太懂是干啥的
    details: null   // 详细解释；关键词类型没有
};

class SegmaAutoComplete {
    constructor(option) {
        this.suggestions = [];
        this.databaseManager = new DatabaseManager({
            mark: option.mark
        });
    }

    addSuggestions(suggestions) {
        if (suggestions.length === 0) {
            return;
        }
        this.suggestions = [...this.suggestions, ...suggestions];
    }

    /**
     * 筛选建议
     * */
    filterSuggestions(filterString) {
        // console.log('filterSuggestions', filterString);
        // console.log('Original suggestion:', this.suggestions);
        if (!filterString) {
            return [];
        }
        let reg = new RegExp(filterString, 'i');
        let result = this.innerFilterSuggestions(filterString, reg);
        // console.log('Filter suggestion:', result);
        // console.log('this.suggestions', this.suggestions);
        this.sortSuggestions(result, reg);
        console.log('Sort suggestion:', this.suggestions);
        return result;
    }

    innerFilterSuggestions(filterString, reg) {
        // 点号特殊处理，不需要筛选
        if (filterString === '.') {
            return this.suggestions;
        }
        return this.suggestions.filter(suggestion => {
            return reg.test(suggestion.value);
        });
    }

    /**
     * 根据权重和相关性筛选建议
     * */
    sortSuggestions(suggestions, reg) {
        suggestions.sort((a, b) => {
            if (b.category.weight === a.category.weight) {
                let matchA = this.getMatchIndex(reg, a.value);
                let matchB = this.getMatchIndex(reg, b.value);
                return matchA - matchB;
            } else {
                return b.category.weight - a.category.weight;
            }
        });
    }

    getMatchIndex(reg, string) {
        let result = reg.exec(string);
        return result ? result.index : Infinity;
    }

    async update(parseResult) {
        this.suggestions = [];
        let {
            suggestDatabases,
            suggestTables,
            suggestColumns,
            suggestFilters,
            suggestFunctions,
            suggestAggregateFunctions,
            suggestKeywords
        } = parseResult;
        if (suggestDatabases) {
            await this.databaseHandler(suggestDatabases);
        }
        if (suggestTables) {
            await this.tableHandler(suggestTables);
        }
        if (suggestColumns) {
            let { tables } = suggestColumns;
            await this.columnHandler(tables);
        }
        if (suggestKeywords) {
            this.keywordsHandler(suggestKeywords);
        }
        if (suggestAggregateFunctions) {
            this.aggregateFunctionsHandler(suggestAggregateFunctions);
        }
        return [];
    }

    addPrefixAndSuffix(name, appendDot, prependFrom) {
        // todo: 这里加入的from是否区分大小写
        return `${prependFrom ? 'FROM ' : ''}${name}${appendDot ? '.' : ''}`;
    }

    async databaseHandler(suggestDatabases) {
        let self = this;
        let { appendDot, prependFrom } = suggestDatabases;
        let database = await this.databaseManager.getDatabases();

        let suggestions = database.map(dbName => {
            dbName = self.addPrefixAndSuffix(dbName, appendDot, prependFrom);
            return {
                value: dbName,
                meta: dbName,
                category: CATEGORIES.DATABASE,
                weightAdjust: 0,
                popular: false,
                details: null
            };
        });
        this.addSuggestions(suggestions);
    }

    async tableHandler(suggestTables) {
        let self = this;
        let { identifierChain, prependFrom } = suggestTables;
        let tables = await this.databaseManager.getTables(identifierChain);
        let suggestions = tables.map(table => {
            let { name, chain } = table;
            name = self.addPrefixAndSuffix(name, false, prependFrom);
            return {
                value: name,
                meta: name,
                category: CATEGORIES.TABLE,
                weightAdjust: 0,
                popular: false,
                details: null,
                chain
            };
        });
        this.addSuggestions(suggestions);
    }

    async columnHandler(tables) {
        let res = await Promise.all(tables.map(i => {
            let { identifierChain } = i;
            return this.databaseManager.getColumns(identifierChain);
        }));
        let suggestions = [];
        res.forEach(arr => suggestions = suggestions.concat(arr));
        suggestions = suggestions.map(column => {
            let { name, chain } = column;
            return {
                value: name,
                meta: name,
                category: CATEGORIES.COLUMN,
                weightAdjust: 0,
                popular: false,
                details: null,
                chain
            };
        });
        this.addSuggestions(suggestions);
    }

    keywordsHandler(keywords) {
        this.addSuggestions(keywords.map(keyword => {
            return {
                value: keyword.value,
                meta: keyword.value,
                category: CATEGORIES.KEYWORD,
                weightAdjust: 0,
                popular: false,
                details: null
            };
        }));
    }

    aggregateFunctionsHandler(suggestAggregateFunctions) {
        let suggestions = [];
        UDF_CATEGORIES.forEach(categorie => {
            for (let functionsKey in categorie.functions) {
                if (categorie.functions.hasOwnProperty(functionsKey)) {
                    let fun = categorie.functions[functionsKey];
                    let { description, draggable, name, signature } = fun;
                    suggestions = [
                        ...suggestions, {
                            value: name + '()',
                            meta: name + '()',
                            category: CATEGORIES.UDF,
                            weightAdjust: 0,
                            popular: false,
                            details: {
                                draggable,
                                signature,
                                description
                            }
                        }
                    ];
                }
            }
        });
        this.addSuggestions(suggestions);
    }

}

export default SegmaAutoComplete;
