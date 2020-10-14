/**
 * Created by Lucas on 2020/9/16.
 */
import $ from 'jquery';
import * as ko from 'knockout';
import komapping from 'knockout.mapping';

ko.mapping = komapping;
const globalVars = {
    ko: ko,
    AUTOCOMPLETE_TIMEOUT: 1,
    CACHEABLE_TTL: 1,
    HAS_LINK_SHARING: true,
    HAS_OPTIMIZER: false,
    HUE_I18n: {},
    HUE_BASE_URL: '',
    HUE_CHARTS: {
        TYPES: 'bar'
    },
    LOGGED_USERNAME: 'foo',
    LOGGED_USER_ID: 'bar',
    PREVENT_AUTOFILL_INPUT_ATTRS:
        'autocorrect="off" autocomplete="do-not-autocomplete" autocapitalize="off" spellcheck="false"',
    STATIC_URLS: {
        'impala/art/icon_impala_48.png': 'impala/art/icon_impala_48.png',
        'beeswax/art/icon_beeswax_48.png': 'beeswax/art/icon_beeswax_48.png'
    },
    SQL_COLUMNS_KNOWN_FACET_VALUES: {
        type: { array: -1, boolean: -1 }
    },
    ace: {
        edit: () => ({
            setOptions: () => {
            },
            getSession: () => ({
                setMode: () => {
                },
                doc: {
                    createAnchor: () => ({
                        on: () => {
                        },
                        getPosition: () => ({
                            row: 0
                        }),
                        setPosition: () => {
                        },
                        detach: () => {
                        }
                    })
                },
                getTextRange: () => {
                },
                addGutterDecoration: () => {
                },
                removeGutterDecoration: () => {
                }
            }),
            setTheme: () => {
            },
            getValue: () => '',
            getSelectionRange: () => ({ start: { row: 0, column: 0 }, end: { row: 0, column: 0 } }),
            on: () => {
            },
            off: () => {
            },
            commands: {
                on: () => {
                },
                off: () => {
                }
            },
            container: {
                addEventListener: () => {
                },
                removeEventListener: () => {
                }
            }
        }),
        require: () => ({
            Tooltip: Tooltip,
            Range: AceRange,
            Autocomplete: Autocomplete
        })
    }
};
for (let globalVarsKey in globalVars) {
    if (globalVars.hasOwnProperty(globalVarsKey)) {
        window[globalVarsKey] = globalVars[globalVarsKey];
    }
}
