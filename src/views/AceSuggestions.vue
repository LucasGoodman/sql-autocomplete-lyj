<!--ACE编辑器 - 提示组件-->
<template>
    <div v-if="localVisible"
         class="ace-suggestions"
         :style="wrapperStyle"
         @click="$emit('focus')">
        <div class="auto-completer-suggestions">
            <div class="suggestions-header">
                <div class="suggestions-categories">
                    <template v-for="category in tabCategories">
                        <div :key="category.id"
                             class="category"
                             :class="{active:currentTabCategory === category}"
                             :style="{'border-color':currentTabCategory === category ? category.color : 'transparent'}"
                             @click="currentTabCategory = category">
                            {{category.label}}
                        </div>
                    </template>
                </div>
            </div>
            <div class="suggestions-content">
                <div class="suggestions-wrapper">
                    <template v-for="(suggestion,index) in currentSuggestions">
                        <div :key="index"
                             :ref="getRefStringByIndex(index)"
                             :class="{selected:activeIndex === index}"
                             class="suggestion"
                             @click="autocomplete(suggestion.value)">
                            <div class="suggestion-value">
                                <div class="dot"
                                     :style="{background:suggestion.category.color}">
                                </div>
                                <span v-html="getMatchString(suggestion.value)"></span>
                            </div>
                            <div class="suggestion-meta">
                                {{suggestion.meta}}
                            </div>
                        </div>
                    </template>
                </div>
            </div>
        </div>
        <div class="auto-completer-details">
            <div class="suggestions-header">
                details-header
            </div>
            <div class="details-content">
                <div class="details-content-inner">
                    details-content
                    <el-button size="small"
                               @click="scroll">
                        滚动测试
                    </el-button>
                    {{tabCategories}}
                    <br />
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { CATEGORIES } from './utils';

export default {
    name: 'AceSuggestions',
    // components: {},
    // directives: {},
    // filters: {},
    // model: {},
    props: {
        suggestions: {
            type: Array,
            default: () => []
        },
        filter: {
            type: String,
            default: ''
        },
        visible: {
            type: Boolean,
            default: false
        },
        position: {
            type: Object,
            default: () => ({
                pageX: 0,
                pageY: 0
            })
        }
    },
    data() {
        return {
            activeIndex: 0,
            currentTabCategory: null
        };
    },
    computed: {
        localVisible: {
            get() {
                return this.visible;
            },
            set(val) {
                this.$emit('update:visible', val);
            }
        },
        wrapperStyle() {
            console.log('this.position', this.position);
            return {
                top: `${this.position.pageY}px`,
                left: `${this.position.pageX}px`
            };
        },
        tabCategories() {
            let array = [];
            this.suggestions.forEach(suggestion => {
                if (!array.includes(suggestion.category)) {
                    array.push(suggestion.category);
                }
            });
            array.sort((a, b) => {
                return a.weight - b.weight;
            });
            array.unshift(CATEGORIES.ALL);
            return array;
        },
        currentSuggestions() {
            if (this.currentTabCategory === CATEGORIES.ALL) {
                return this.suggestions;
            } else {
                return this.suggestions.filter(s => {
                    return s.category === this.currentTabCategory;
                });
            }
        }
    },
    watch: {
        activeIndex(val) {
            let refString = this.getRefStringByIndex(val);
            if (!this.$refs[refString]) {
                return;
            }
            let el = this.$refs[refString][0];
            if (!el) {
                return;
            }
            el.scrollIntoView({ block: "nearest", inline: "nearest", behavior: 'smooth' });
        },
        tabCategories(categories) {
            if (!categories.includes(this.currentTabCategory)) {
                this.currentTabCategory = categories[0];
            }
        },
        currentTabCategory() {
            this.checkActiveIndex();
        }
    },
    // mounted() {},
    // created() {},
    // activated() {},
    // beforeDestroy() {},
    // destroyed() {},
    methods: {
        keyDowHandler(e) {
            console.log('e', e);
        },
        getRefStringByIndex(i) {
            return `suggestion${i}`;
        },
        scroll() {
            this.activeIndex++;
        },
        /**
         * 正则变量中的特殊字符转义
         * https://locutus.io/php/pcre/preg_quote/
         * */
        preg_quote(str, delimiter) { // eslint-disable-line camelcase
            return (str + '')
                .replace(new RegExp('[.\\\\+*?\\[\\^\\]$(){}=!<>|:\\' + (delimiter || '') + '-]', 'g'), '\\$&');
        },
        getMatchString(value) {
            let reg = new RegExp(this.preg_quote(this.filter), 'i');
            let matchResult = reg.exec(value);
            if (matchResult) {
                let originMatch = matchResult[0]; // 只匹配第一个
                let matchIndex = matchResult.index;
                let bolderMatch = `<b>${originMatch}</b>`;
                let beforeMatch = value.slice(0, matchIndex);
                let afterMatch = value.substring(matchIndex + originMatch.length);
                return beforeMatch + bolderMatch + afterMatch;
            } else {
                return value;
            }
        },
        autocomplete(value) {
            this.$emit('autocomplete', value);
            this.localVisible = false;
        },
        checkActiveIndex() {
            if (this.activeIndex > this.currentSuggestions.length) {
                this.activeIndex = this.currentSuggestions.length - 1;
            }
        }
    }
};
</script>

<style lang="less"
       scoped>
@cui-gray-700: #5a656d;

.ace-suggestions {
    display: flex;
    position: fixed;
    z-index: 999;
    max-height: 260px;
    align-items: flex-start;

    .auto-completer-suggestions, .auto-completer-details {
        display: flex;
        overflow: hidden;
        border: 1px solid #dcdcdc;
        border-radius: 2px;
        width: 300px;
        max-height: 250px;
        background-color: #ffffff;
        box-shadow: 0 2px 6px 0 rgba(0, 0, 0, 0.18), 0 2px 8px 0 rgba(0, 0, 0, 0.13);
        flex: 0 0 300px;
        flex-direction: column;
    }

    .suggestions-header {
        overflow: hidden;
        position: relative;
        padding: 5px;
        height: 30px;
        font-size: 14px;
        line-height: 20px;
        white-space: nowrap;
        text-overflow: ellipsis;
        background-color: #f8f8f8;
        flex: 0 0 20px;
    }

    .auto-completer-suggestions {
        .suggestions-categories {
            display: inline-block;
            float: left;

            .category {
                display: inline-block;
                border-bottom: 2px solid transparent;
                padding: 0 5px;
                cursor: pointer;

                &.active {
                    border-color: #2557b4;
                    cursor: default;
                }
            }
        }

        .suggestions-content {
            overflow: auto;
            max-height: 225px;
        }

        .suggestion {
            clear: both;
            position: relative;
            padding: 3px;
            height: 19px;
            font: 12px / normal Roboto Mono, Menlo, Monaco, Consolas, "Courier New", monospace;
            line-height: 18px;
            background-color: #ffffff;
            cursor: pointer;
            direction: ltr;

            &:hover {
                background-color: #f3f9fc;
            }

            &.selected {
                background-color: #dbe8f1;
            }
        }

        .suggestion-value {
            overflow-x: hidden;
            margin-right: 6px;
            margin-left: 3px;
            width: 85%;
            white-space: nowrap;
            text-overflow: ellipsis;

            b {
                font-weight: bolder;
            }

            .dot {
                display: inline-block;
                margin-top: 5px;
                border-radius: 4px;
                width: 8px;
                height: 8px;
                background: #eeeeee;
            }

            span {
                margin-left: 5px;
            }
        }

        .suggestion-meta {
            position: absolute;
            top: 3px;
            right: 0;
            z-index: 1;
            padding-right: 3px;
            white-space: nowrap;
            color: @cui-gray-700;
            background-color: inherit;
        }
    }

    .auto-completer-details {
        margin-left: 5px;

        .details-content {
            overflow: auto;
            max-height: 225px;
        }

        .details-content-inner {
            padding: 7px;

            .details-comment, .details-description {
                margin-top: 5px;
                margin-bottom: 5px;
                color: #787878;
            }

            .details-code {
                padding: 3px;
                font: 12px / normal Roboto Mono, Menlo, Monaco, Consolas, "Courier New", monospace;
                color: #787878;
                background-color: #f8f8f8;
                direction: ltr;
            }

            .details-attribute {
                display: inline-block;
                color: #787878;
            }
        }
    }
}
</style>
