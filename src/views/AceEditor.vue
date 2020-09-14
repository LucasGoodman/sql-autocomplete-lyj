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
            <el-button size="small"
                       @click="test">
                测试
            </el-button>
        </div>
        <div id="editor">
            select * from table
        </div>
    </div>
</template>

<script>
export default {
    name: 'AceEditor',
    // components: {},
    // directives: {},
    // filters: {},
    // model: {},
    // props: [],
    // data() {},
    // computed: {},
    // watch: {},
    mounted() {
        window.editor = ace.edit("editor");
        // editor.setTheme("ace/theme/monokai");
        editor.session.setMode("ace/mode/sql");
        editor.setOptions({
            // autoScrollEditorIntoView: true,
            copyWithEmptySelection: true
        });
    },
    // created() {},
    // activated() {},
    // beforeDestroy() {},
    // destroyed() {},
    methods: {
        readOnly() {
            window.editor.setReadOnly(true);
        },
        test() {
            editor.find('select', {
                backwards: false,
                wrap: false,
                caseSensitive: false,
                wholeWord: false,
                regExp: false
            });
            editor.findNext();
            editor.findPrevious();
        }
    }
};
</script>

<style lang="less"
       scoped>
#editor {
    width: 100%;
    height: 500px;
    background: rgba(0, 0, 0, 0.01);
}
</style>
