<!--AceEditor-->
<template>
    <div class="ace-edtior">
        <div class="button-wrapper">
            <el-button size="small">
                插入
            </el-button>
            <el-button size="small"
                       @click="readOnly">
                只读
            </el-button>
            <!--<el-button size="small"
                       @click="sqlAnalysis">
                sql解析
            </el-button>-->
            <!--<el-button size="small"
                       @click="snippet">
                创建提示
            </el-button>-->
            <el-button size="small"
                       @click="insert">
                插入占位符
            </el-button>
            <el-button size="small"
                       @click="createLocalforage">
                localforage 创建实例
            </el-button>
            <el-button size="small"
                       @click="setLocalforage">
                localforage 写数据
            </el-button>
            <el-button size="small"
                       @click="getLocalforage">
                localforage 读数据
            </el-button>
            <el-button size="small"
                       @click="beforeCursor">
                beforeCursor
            </el-button>
            <el-button size="small"
                       type="primary"
                       @click="analysis">
                分析
            </el-button>
            <el-button size="small"
                       @click="autoCompleteVisible =  !autoCompleteVisible">
                提示开关
            </el-button>
            <!--<div ref="placeHolder"
                 class="ace_invisible ace_emptyMessage">
                占位符
            </div>-->
        </div>
        <div class="content">
            <div class="editor-wrapper">
                <div id="editor">select * from lyj_test_hive</div>
                <ace-suggestions :suggestions="suggestions"
                                 :filter="filter"
                                 :position="autoCompletePosition"
                                 :visible.sync="autoCompleteVisible"
                                 @autocomplete="handleAutocomplete"
                                 @focus="editorFocus"></ace-suggestions>
            </div>
            <div class="parse-result-list">
                <h1>
                    parse-result-list
                </h1>
                <template v-for="(tip,index) in suggestions">
                    <p :key="index"
                       class="tip"
                       @click="parseDetails = tip">
                    </p>
                </template>
            </div>
            <div class="parse-details">
                <h1>
                    parse-details
                </h1>
                <pre style="font-family: 'Microsoft YaHei';">{{parseDetails}}</pre>
            </div>
        </div>
    </div>
</template>

<script>
import ace from '../../public/ace-builds/src-noconflict/ace';
import '../../public/ace-builds/src-noconflict/ext-language_tools';
// import { addCompleter } from '../../public/ace-builds/src-noconflict/ext-language_tools';
import '../../public/ace-builds/webpack-resolver';
import SqlAutocompleter from 'sql/sqlAutocompleter';
import AutocompleteResults from 'sql/autocompleteResults';
import localForage from 'localforage';
import './ace.extended';
import SegmaAutoComplete from './segma_auto_complete';
import AceSuggestions from "./AceSuggestions";

const AUTOCOMPLETE_MODULES = {
    calcite: () => import(/* webpackChunkName: "calcite-parser" */ 'parse/sql/calcite/calciteAutocompleteParser'),
    druid: () => import(/* webpackChunkName: "druid-parser" */ 'parse/sql/druid/druidAutocompleteParser'),
    elasticsearch: () => import(/* webpackChunkName: "elasticsearch-parser" */ 'parse/sql/elasticsearch/elasticsearchAutocompleteParser'),
    flink: () => import(/* webpackChunkName: "flink-parser" */ 'parse/sql/flink/flinkAutocompleteParser'),
    generic: () => import(/* webpackChunkName: "generic-parser" */ 'parse/sql/generic/genericAutocompleteParser'),
    hive: () => import(/* webpackChunkName: "hive-parser" */ 'parse/sql/hive/hiveAutocompleteParser'),
    impala: () => import(/* webpackChunkName: "impala-parser" */ 'parse/sql/impala/impalaAutocompleteParser'),
    ksql: () => import(/* webpackChunkName: "ksql-parser" */ 'parse/sql/ksql/ksqlAutocompleteParser'),
    phoenix: () => import(/* webpackChunkName: "phoenix-parser" */ 'parse/sql/phoenix/phoenixAutocompleteParser'),
    presto: () => import(/* webpackChunkName: "presto-parser" */ 'parse/sql/presto/prestoAutocompleteParser')
};
const AVAILABLE_AUTOCOMPLETERS = {
    // solrFormula: SolrFormulaAutocompleter,
    // solrQuery: SolrQueryAutocompleter,
    impalaQuery: SqlAutocompleter,
    hiveQuery: SqlAutocompleter,
    impala: SqlAutocompleter,
    hive: SqlAutocompleter
};

// const snippetManager = ace.require("ace/snippets").snippetManager;
// import $ from 'jquery';
import LOTS_OF_PARSE_RESULTS from 'sql/test/lotsOfParseResults';
import _debounce from 'lodash/debounce';

export default {
    name: 'AceEditor',
    components: {
        AceSuggestions
    },
    // directives: {},
    // filters: {},
    // model: {},
    // props: [],
    data() {
        return {
            editor: null,
            suggestions: [],
            parseDetails: null,
            onSqlAnalysing: false,
            filter: '', // 需要匹配的关键词
            autoCompleteVisible: true,
            autoCompletePosition: {
                pageX: 1200,
                pageY: 0
            },
            timestamp: 0
        };
    },
    computed: {
        _analysis() {
            return _debounce(this.analysis, 200);
        }
    },
    watch: {
        suggestions(val) {
            if (val.length === 0) {
                console.log('关闭提示');
            }
            // 更新提示框位置
            this.autoCompletePositionUpdate();
            this.autoCompleteVisible = true;
        }
    },
    mounted() {
        this.editorInit();
    },
    // activated() {},
    // created() {},
    // activated() {},
    // beforeDestroy() {},
    // destroyed() {},
    methods: {
        editorInit() {
            // 初始化编辑器
            this.editor = ace.edit("editor");
            this.editor.session.setMode("ace/mode/sql");
            this.editor.setOptions({
                // enableBasicAutocompletion: true,
                enableSnippets: true,
                copyWithEmptySelection: true,
                enableLiveAutocompletion: true,
                enableBasicAutocompletion: true,
                autoScrollEditorIntoView: true,
                highlightActiveLine: false
                // printMargin: false,
                // showGutter: false
                // maxLines: 1 // make it 1 line
            });
            this.editor.setFontSize("18px");

            // 执行监听
            let singleLine = false;
            const bindPrefix = singleLine ? 'Enter|Shift-Enter|' : '';
            this.editor.commands.addCommand({
                name: 'enter',
                bindKey: { win: bindPrefix + 'Ctrl-Enter', mac: bindPrefix + 'Ctrl-Enter|Command-Enter' },
                exec: (e) => {
                    console.log('editor.commands.addCommand :', e);
                }
            });
            this.editor.commands.addCommand({
                name: 'down',
                bindKey: { win: bindPrefix + 'Down', mac: bindPrefix + 'Down|Command-Down' },
                exec: (e) => {
                    console.log('监听到键盘事件 “下” ：', e);
                }
            });
            // 自动补全
            /*const AceAutocomplete = ace.require('ace/autocomplete').Autocomplete;
            editor.completer = new AceAutocomplete();
            editor.completer.exactMatch = false;
            editor.useHueAutocompleter = true;
            console.log(' editor.completer', editor.completer);*/
            // 执行后监听
            this.editor.commands.on('afterExec', e => {
                // console.log('执行后：', e);
                // 光标移入括号内
                if (e.command.name === 'insertstring') {
                    let triggerAutocomplete = false;
                    if (/\S+\(\)$/.test(e.args)) {
                        editor.moveCursorTo(
                            editor.getCursorPosition().row,
                            editor.getCursorPosition().column - 1
                        );
                        triggerAutocomplete = true;
                    }
                    if (triggerAutocomplete) {
                        window.setTimeout(() => {
                            editor.execCommand('startAutocomplete');
                        }, 1);
                    }
                }
            });
            // todo:执行时机有待商榷
            this.editor.on('change', e => {
                console.log('Editor Change', e);
                console.log(' this.editor', this.editor);
                // todo: 脚本初始化之后需要执行一次分析，拿到初始的数据库列表
                this.$nextTick(() => {
                    this._analysis();
                });
            });

            // 用来区分数据库类型
            let mark = 'hive-default';
            // 创建解析器
            this.editor.completer = new SegmaAutoComplete({
                mark
            });

            /*// 创建参数
            const autocomplete = {
                support: '',
                type: 'hiveQuery'
            };
            const params = {
                temporaryOnly: false,
                namespace: 'namespace',
                compute: '',
                database: 'segma_database',
                availableDatabases: 'default',
                isSqlDialect: false
            };
            // 创造片段
            const snippet = {
                autocompleteSettings: {
                    temporaryOnly: params.temporaryOnly
                },
                type: '',
                dialect: '',
                connector: 'hive',
                id: 'editor',
                namespace: params.namespace,
                compute: params.compute,
                database: params.database,
                availableDatabases: params.availableDatabases,
                positionStatement: {
                    location: {
                        first_line: 1,
                        last_line: 1,
                        first_column: 0,
                        last_column: editor.getValue().length
                    }
                },
                whenContextSet: function() {
                    const promise = new Promise((resolve, reject) => {
                        setTimeout(() => {
                            resolve();
                        }, 1000);
                    });
                    promise.dispose = function() {
                    };
                    return promise;
                },
                isSqlDialect: params.isSqlDialect,
                aceCursorPosition: '',
                inFocus: ''
            };
            // 创造解析器
            const autocompleteArgs = {
                editor: function() {
                    return editor;
                },
                snippet: snippet,
                fixedPrefix: params.fixedPrefix,
                fixedPostfix: params.fixedPostfix,
                support: autocomplete.support
            };
            const AVAILABLE_AUTOCOMPLETERS = {
                // solrFormula: SolrFormulaAutocompleter,
                // solrQuery: SolrQueryAutocompleter,
                impalaQuery: SqlAutocompleter,
                hiveQuery: SqlAutocompleter,
                impala: SqlAutocompleter,
                hive: SqlAutocompleter
            };
            const AutocompleterClass = AVAILABLE_AUTOCOMPLETERS[autocomplete.type] || SqlAutocompleter;
            let autocompleter = new AutocompleterClass(autocompleteArgs);
            console.log('autocompleter', autocompleter);
            // 解析
            let parseThrottle = -1;
            const valueUpdateListener = editor.on('input', () => {
                let value = editor.getValue();
                return;
                if (self.parsedValue && self.autocompleter && self.autocompleter.parse) {
                    window.clearTimeout(parseThrottle);
                    parseThrottle = window.setTimeout(() => {
                        const parseResult = self.autocompleter.parse(editor.getValue());
                        if (parseResult) {
                            self.parsedValue(parseResult.parsedValue);
                        } else {
                            // TODO: What to do when we can't parse?
                            self.parsedValue(editor.getValue());
                        }
                    }, 200);
                }
            });*/
        },
        readOnly() {
            this.editor.setReadOnly(true);
        },
        /*snippet() {
            // 创建片段
            let file = [
                { name: 'build', code: 'console.log("build")' },
                { name: 'destroy', code: 'console.log("destroy")' }
            ].map(({ name, code }) =>
                [
                    'snippet ' + name,
                    code
                        .split('\n')
                        .map(c => '\t' + c)
                        .join('\n')
                ].join('\n')
            )
                .join('\n');
            let snippet = snippetManager.parseSnippetFile(file);
            snippetManager.register(snippet, "sql");
        },*/
        async sqlAnalysis() {
            const activeStatementLocation = {
                first_line: 1,
                last_line: 1,
                first_column: 0,
                last_column: this.editor.getValue().length
            };
            const cursorPosition = this.editor.getCursorPosition();
            const beforeCursor =
                this.editor.session.getTextRange({
                    start: {
                        row: activeStatementLocation.first_line - 1,
                        column: activeStatementLocation.first_column
                    },
                    end: cursorPosition
                });
            const afterCursor =
                this.editor.session.getTextRange({
                    start: cursorPosition,
                    end: {
                        row: activeStatementLocation.last_line - 1,
                        column: activeStatementLocation.last_column
                    }
                });
            let type = 'hive';
            const targetModule = AUTOCOMPLETE_MODULES[type];
            let res = await targetModule();
            let autocompleteParser = res.default;
            let parseResult = await autocompleteParser.parseSql(
                beforeCursor,
                afterCursor
            );
            return parseResult;
        },
        async analysis() {
            if (this.onSqlAnalysing) {
                return;
            }
            let timestamp = new Date().getTime();
            this.timestamp = timestamp;
            this.onSqlAnalysing = true;
            let parseResult = await this.sqlAnalysis();
            console.log('parseResult', parseResult);
            await this.editor.completer.update(parseResult);
            this.filter = this.getWordBeforeCursor();
            console.log('this.filter', this.filter);
            let suggestions = this.editor.completer.filterSuggestions(this.filter);
            // 只需要最新的提示
            if (this.timestamp !== timestamp) {
                return;
            }
            console.log('Final suggestions -- ', suggestions);
            this.suggestions = suggestions;
            this.onSqlAnalysing = false;


            /*const subject = new AutocompleteResults({
                fixedPrefix: '',
                fixedPostfix: '',
                support: '',
                snippet: {
                    autocompleteSettings: {
                        temporaryOnly: false
                    },
                    type: function() {
                        return 'hive';
                    },
                    connector: function() {
                        return { id: 'hive', dialect: 'hive' };
                    },
                    database: function() {
                        return 'default';
                    },
                    namespace: function() {
                        return { id: 'defaultNamespace' };
                    },
                    compute: function() {
                        return { id: 'defaultCompute' };
                    },
                    whenContextSet: function() {
                        return $.Deferred().resolve();
                    }
                },
                editor: function() {
                    return window.editor;
                }
            });
            if (parseResult.suggestKeywords) {
                const cleanedKeywords = [];
                parseResult.suggestKeywords.forEach(keyword => {
                    if (!keyword.value) {
                        cleanedKeywords.push({ value: keyword });
                    } else {
                        cleanedKeywords.push(keyword);
                    }
                });
                parseResult.suggestKeywords = cleanedKeywords;
            }
            try {
                subject.update(parseResult);
                // console.log('subject', subject);
                // console.log('parseResult', parseResult);
                console.log('subject.filtered', subject.filtered());
                this.suggestions = subject.filtered();
            } catch (e) {
                console.log('e', e);
                console.error(e);
            }
            if (subject.loading()) {
            }*/
        },
        /**
         * 获取光标前的单词
         * */
        getWordBeforeCursor() {
            let cursorPosition = this.editor.getCursorPosition();
            let token = this.editor.session.getTokenAt(cursorPosition.row, cursorPosition.column);
            return token ? token.value : '';
        },
        autoCompletePositionUpdate() {
            let { pageX, pageY } = this.editor.getCursorScreenPosition();
            this.autoCompletePosition = {
                pageX,
                pageY: pageY + 20
            };
        },
        handleAutocomplete(valueToInsert) {
            // 先移除已匹配部分
            let ranges = this.editor.selection.getAllRanges();
            ranges.forEach(range => {
                range.start.column -= this.filter.length;
                this.editor.session.remove(range);
            });
            this.editor.execCommand('insertstring', valueToInsert);
            this.editorFocus();
        },
        editorFocus() {
            this.editor.focus();
        },

        insert() {
            let scroller = window.editor.renderer.scroller;
            scroller.appendChild(this.$refs.placeHolder);
        },
        createLocalforage(name = 'lucas_test_deb') {
            let ins = localForage.createInstance({ name });
            console.log('ins', ins);
            return ins;
        },
        async setLocalforage() {
            let data = await this.createLocalforage().setItem('database', 'db1');
            console.log('data', data);
        },
        async getLocalforage() {
            let data = await this.createLocalforage().getItem('database');
            console.log('data', data);
        },
        beforeCursor() {
            // 找词
            /*let cursorPosition = this.editor.getCursorPosition();
            let token = this.editor.session.getTokenAt(cursorPosition.row, cursorPosition.column);
            console.log('cursorPosition', cursorPosition);
            console.log('token', token);*/

            // 删除范围
            this.editor.removeTextBeforeCursor(2);

            // 取得光标位置
            let p = this.editor.getCursorScreenPosition();
            console.log('p', p);
        }
    }
};
</script>

<style lang="less">
#editor {
    width: 100%;
    height: 500px;
    background: rgba(0, 0, 0, 0.01);
}

.layout-default, .ace-edtior {
    height: 100%;
}

.content {
    display: flex;
    height: 800px;

    & > div {
        display: inline-block;
        flex-basis: 33%;
    }
}

.editor-wrapper {
    position: relative;
}

.parse-result-list {
    overflow: auto;

    .tip:hover {
        background: #eeeeee;
    }
}

.parse-details {
    overflow: auto;
}
</style>
