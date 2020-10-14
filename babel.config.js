module.exports = {
    presets: [
        '@vue/cli-plugin-babel/preset'
    ],
    'plugins': [
        [
            'component',
            {
                'libraryName': 'element-ui',
                'styleLibraryName': 'theme-chalk'
            }
        ]
    ],
    "ignore": [
        "public",
        "src/sql",
        "src/api",
        "src/parse",
        "src/doc",
        "src/ko",
        "src/catalog",
        "src/apps",
        "src/utils"
    ]
};
