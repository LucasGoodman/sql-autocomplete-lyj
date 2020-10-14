import d3v3 from "d3v3";
import I18n from 'utils/i18n';

/**
 * Created by Lucas on 2020/10/13.
 */
const HueColors = {
    CUIScaleColors: [
        {
            name: 'gray',
            colors: [
                '#f8f8f8',
                '#e7e7e7',
                '#e0e0e0',
                '#dcdcdc',
                '#c8c8c8',
                '#b4b4b4',
                '#a0a0a0',
                '#787878',
                '#424242',
                '#212121'
            ]
        },
        {
            name: 'blue-gray',
            colors: [
                '#eceff1',
                '#cfd8dc',
                '#b0bec5',
                '#90a4ae',
                '#78909c',
                '#607d8b',
                '#546e7a',
                '#455a64',
                '#36454f',
                '#232c34'
            ]
        },
        {
            name: 'blue',
            colors: [
                '#e9f6fb',
                '#bee4f5',
                '#a9dbf1',
                '#7ecaeb',
                '#53b8e4',
                '#29a7de',
                '#2496c7',
                '#0b7fad',
                '#1c749b',
                '#186485'
            ]
        },
        {
            name: 'steel',
            colors: [
                '#e8eeee',
                '#c6d6d6',
                '#a0baba',
                '#7a9f9f',
                '#5d8a8a',
                '#417575',
                '#3c6c6c',
                '#345e5e',
                '#2d5252',
                '#274646'
            ]
        },
        {
            name: 'teal',
            colors: [
                '#e0f6f5',
                '#b3eae6',
                '#80dcd5',
                '#4dcec4',
                '#26c3b7',
                '#00b9aa',
                '#00aa9d',
                '#009488',
                '#008177',
                '#006f66'
            ]
        },
        {
            name: 'green',
            colors: [
                '#e2f3ea',
                '#b7e2cd',
                '#87ceab',
                '#57bb89',
                '#33ac6f',
                '#0f9d56',
                '#0e914f',
                '#0c7e45',
                '#0a6e3c',
                '#095e34'
            ]
        },
        {
            name: 'lime',
            colors: [
                '#edf5e2',
                '#d2e6b9',
                '#b4d689',
                '#96c55a',
                '#7fb836',
                '#69ac13',
                '#619f12',
                '#548a0f',
                '#49780d',
                '#3f670b'
            ]
        },
        {
            name: 'yellow',
            colors: [
                '#fffce6',
                '#fffacc',
                '#fff599',
                '#fff066',
                '#ffeb3b',
                '#ffe600',
                '#e6cf00',
                '#b3a100',
                '#807300',
                '#4d4500'
            ]
        },
        {
            name: 'orange',
            colors: [
                '#fbf1e1',
                '#ffe8af',
                '#ffd466',
                '#edb233',
                '#eba81a',
                '#e99f01',
                '#d18f00',
                '#ba7f00',
                '#a36f00',
                '#8b572a'
            ]
        },
        {
            name: 'red',
            colors: [
                '#ffe5e5',
                '#ffcccc',
                '#ffb2b2',
                '#e7808d',
                '#de4d5f',
                '#d0021b',
                '#bb0118',
                '#a60115',
                '#910112',
                '#7c0110'
            ]
        },
        {
            name: 'pink',
            colors: [
                '#f2dede',
                '#f3bfd4',
                '#ec93b7',
                '#e4689a',
                '#de4784',
                '#d8276f',
                '#c72466',
                '#ad1f59',
                '#971b4d',
                '#821743'
            ]
        },
        {
            name: 'purple',
            colors: [
                '#efe9f5',
                '#d8c8e7',
                '#bda3d6',
                '#a37ec6',
                '#8f62b9',
                '#7b46ad',
                '#71419f',
                '#62388a',
                '#563179',
                '#4a2a68'
            ]
        },
        {
            name: 'purple-gray',
            colors: [
                '#f1efef',
                '#d5cfd1',
                '#bab0b3',
                '#aca0a4',
                '#9f9095',
                '#977f86',
                '#837077',
                '#766168',
                '#6a575d',
                '#5e4d53'
            ]
        },
        {
            name: 'green-gray',
            colors: [
                '#e9e8e3',
                '#c8c6ba',
                '#b2af9f',
                '#a7a391',
                '#9c9883',
                '#918d76',
                '#827e6a',
                '#74705e',
                '#656252',
                '#575446'
            ]
        }
    ],

    hexToR: function(h) {
        return parseInt(this.cutHex(h).substring(0, 2), 16);
    },

    hexToG: function(h) {
        return parseInt(this.cutHex(h).substring(2, 4), 16);
    },

    hexToB: function(h) {
        return parseInt(this.cutHex(h).substring(4, 6), 16);
    },

    cutHex: function(h) {
        return h.charAt(0) === '#' ? h.substring(1, 7) : h;
    },

    decToHex: function(i) {
        return (i + 0x100).toString(16).substr(-2).toUpperCase();
    },

    scale: function(from, to, bands) {
        const fromRGB = [this.hexToR(from), this.hexToG(from), this.hexToB(from)];
        const toRGB = [this.hexToR(to), this.hexToG(to), this.hexToB(to)];
        let i;
        const delta = [];
        const result = [];

        for (i = 0; i < 4; i++) {
            delta[i] = (fromRGB[i] - toRGB[i]) / (bands + 1);
        }

        for (i = 0; i < bands; i++) {
            const r = Math.round(fromRGB[0] - delta[0] * i);
            const g = Math.round(fromRGB[1] - delta[1] * i);
            const b = Math.round(fromRGB[2] - delta[2] * i);
            result.push('#' + this.decToHex(r) + this.decToHex(g) + this.decToHex(b));
        }
        return result;
    },

    getNormalizedColors: function() {
        const normalizedColors = {};
        this.CUIScaleColors.forEach(scaleDef => {
            normalizedColors[scaleDef.name] = scaleDef.colors;
        });
        return normalizedColors;
    },

    getCUIChartColors: function() {
        let i;

        const normalizedColors = this.getNormalizedColors();

        // optimal visual sequence by contrasting colors
        const sequence = [
                'blue',
                'lime',
                'blue-gray',
                'pink',
                'steel',
                'purple',
                'teal',
                'red',
                'orange',
                'green'
            ],
            wholeSpectrum = [],
            sequenceHalfLength = sequence.length / 2;

        function addMain(mainSwatch) {
            wholeSpectrum.push({ color: normalizedColors[mainSwatch][sequenceHalfLength] });
        }

        function addPlus(mainSwatch) {
            wholeSpectrum.push({ color: normalizedColors[mainSwatch][sequenceHalfLength + i] });
        }

        function addMinus(mainSwatch) {
            wholeSpectrum.push({ color: normalizedColors[mainSwatch][sequenceHalfLength - i] });
        }

        for (i = 1; i < sequenceHalfLength; i++) {
            if (i === 1) {
                sequence.forEach(addMain);
            }

            sequence.forEach(addPlus);
            sequence.forEach(addMinus);
        }
        return wholeSpectrum;
    },

    d3Scale: function() {
        return d3v3.scale
            .category20()
            .range()
            .concat(d3v3.scale.category20b().range().concat(d3v3.scale.category20c().range()));
    },
    cuiD3Scale: function(swatch) {
        let colors = this.getCUIChartColors().map(c => {
            return c.color;
        });
        if (swatch) {
            this.CUIScaleColors.forEach(s => {
                if (s.name === swatch) {
                    colors = s.colors;
                }
            });
        }
        return colors;
    },
    LIGHT_BLUE: '#dbe8f1',
    BLUE: '#87bad5',
    DARK_BLUE: '#0b7fad',
    DARKER_BLUE: '#205875',
    PURPLE: '#c0b1e9',
    GRAY: '#666666',
    WHITE: '#ffffff',
    ORANGE: '#ff7f0e'
};

const normalizedColors = HueColors.getNormalizedColors();

const COLORS = {
    POPULAR: normalizedColors['blue'][7],
    KEYWORD: normalizedColors['blue'][4],
    COLUMN: normalizedColors['green'][2],
    TABLE: normalizedColors['pink'][3],
    DATABASE: normalizedColors['teal'][5],
    SAMPLE: normalizedColors['purple'][5],
    IDENT_CTE_VAR: normalizedColors['orange'][3],
    UDF: normalizedColors['purple-gray'][3],
    HDFS: normalizedColors['red'][2]
};
const CATEGORIES = {
    ALL: {
        id: 'all',
        color: HueColors.BLUE,
        label: I18n('All')
    },
    POPULAR: {
        id: 'popular',
        color: COLORS.POPULAR,
        label: I18n('Popular')
    },
    POPULAR_AGGREGATE: {
        id: 'popularAggregate',
        weight: 1500,
        color: COLORS.POPULAR,
        label: I18n('Popular'),
        detailsTemplate: 'agg-udf'
    },
    POPULAR_GROUP_BY: {
        id: 'popularGroupBy',
        weight: 1300,
        color: COLORS.POPULAR,
        label: I18n('Popular'),
        detailsTemplate: 'group-by'
    },
    POPULAR_ORDER_BY: {
        id: 'popularOrderBy',
        weight: 1200,
        color: COLORS.POPULAR,
        label: I18n('Popular'),
        detailsTemplate: 'order-by'
    },
    POPULAR_FILTER: {
        id: 'popularFilter',
        weight: 1400,
        color: COLORS.POPULAR,
        label: I18n('Popular'),
        detailsTemplate: 'filter'
    },
    POPULAR_ACTIVE_JOIN: {
        id: 'popularActiveJoin',
        weight: 1500,
        color: COLORS.POPULAR,
        label: I18n('Popular'),
        detailsTemplate: 'join'
    },
    POPULAR_JOIN_CONDITION: {
        id: 'popularJoinCondition',
        weight: 1500,
        color: COLORS.POPULAR,
        label: I18n('Popular'),
        detailsTemplate: 'join-condition'
    },
    COLUMN: {
        id: 'column',
        weight: 1000,
        color: COLORS.COLUMN,
        label: I18n('Columns'),
        detailsTemplate: 'column'
    },
    SAMPLE: {
        id: 'sample',
        weight: 900,
        color: COLORS.SAMPLE,
        label: I18n('Samples'),
        detailsTemplate: 'value'
    },
    IDENTIFIER: {
        id: 'identifier',
        weight: 800,
        color: COLORS.IDENT_CTE_VAR,
        label: I18n('Identifiers'),
        detailsTemplate: 'identifier'
    },
    CTE: {
        id: 'cte',
        weight: 700,
        color: COLORS.IDENT_CTE_VAR,
        label: I18n('CTEs'),
        detailsTemplate: 'cte'
    },
    TABLE: {
        id: 'table',
        weight: 600,
        color: COLORS.TABLE,
        label: I18n('Tables'),
        detailsTemplate: 'table'
    },
    DATABASE: {
        id: 'database',
        weight: 500,
        color: COLORS.DATABASE,
        label: I18n('Databases'),
        detailsTemplate: 'database'
    },
    UDF: {
        id: 'udf',
        weight: 400,
        color: COLORS.UDF,
        label: I18n('UDFs'),
        detailsTemplate: 'udf'
    },
    OPTION: {
        id: 'option',
        weight: 400,
        color: COLORS.UDF,
        label: I18n('Options'),
        detailsTemplate: 'option'
    },
    HDFS: {
        id: 'hdfs',
        weight: 300,
        color: COLORS.HDFS,
        label: I18n('Files'),
        detailsTemplate: 'hdfs'
    },
    VIRTUAL_COLUMN: {
        id: 'virtualColumn',
        weight: 200,
        color: COLORS.COLUMN,
        label: I18n('Columns'),
        detailsTemplate: 'column'
    },
    COLREF_KEYWORD: {
        id: 'colrefKeyword',
        weight: 100,
        color: COLORS.KEYWORD,
        label: I18n('Keywords'),
        detailsTemplate: 'keyword'
    },
    VARIABLE: {
        id: 'variable',
        weight: 50,
        color: COLORS.IDENT_CTE_VAR,
        label: I18n('Variables'),
        detailsTemplate: 'variable'
    },
    KEYWORD: {
        id: 'keyword',
        weight: 0,
        color: COLORS.KEYWORD,
        label: I18n('Keywords'),
        detailsTemplate: 'keyword'
    },
    POPULAR_JOIN: {
        id: 'popularJoin',
        weight: 1500,
        color: COLORS.POPULAR,
        label: I18n('Popular'),
        detailsTemplate: 'join'
    }
};

const DATA_TYPES = {
    'database': 'database',
    'table': 'table',
    'column': 'column'
};

const COLUMN_TYPES = {
    'extended': 'extended', // 普通字段
    'partition': 'partition' // 分区字段
};
export { HueColors, CATEGORIES, DATA_TYPES };
