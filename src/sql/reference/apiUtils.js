"use strict";
// Licensed to Cloudera, Inc. under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  Cloudera, Inc. licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var apiUtils_1 = require("api/apiUtils");
var urls_1 = require("api/urls");
var i18n_1 = require("utils/i18n");
var FUNCTION_OPERATION = 'function';
var FUNCTIONS_OPERATION = 'functions';
var DEFAULT_DESCRIPTION = i18n_1["default"]('No description available.');
var DEFAULT_RETURN_TYPES = ['T'];
var DEFAULT_ARGUMENTS = [[{ type: 'T', multiple: true }]];
var SIGNATURE_REGEX = /([a-z]+(?:\.{3})?)/gi;
var TYPE_REGEX = /(?<type>[a-z]+)(?<multiple>\.{3})?/i;
var stripPrecision = function (typeString) { return typeString.replace(/\(\*(,\*)?\)/g, ''); };
var adaptApiUdf = function (apiUdf) {
    var signature = apiUdf.name + '()';
    return {
        name: apiUdf.name,
        returnTypes: extractReturnTypes(apiUdf),
        arguments: exports.extractArgumentTypes(apiUdf),
        signature: signature,
        draggable: signature,
        description: DEFAULT_DESCRIPTION,
        described: false
    };
};
var extractReturnTypes = function (apiUdf) {
    return apiUdf.return_type ? [stripPrecision(apiUdf.return_type)] : DEFAULT_RETURN_TYPES;
};
exports.extractArgumentTypes = function (apiUdf) {
    if (apiUdf.signature) {
        var cleanSignature = stripPrecision(apiUdf.signature);
        if (cleanSignature === '()') {
            return [];
        }
        var match = cleanSignature.match(SIGNATURE_REGEX);
        if (match) {
            return match.map(function (argString) {
                var typeMatch = argString.match(TYPE_REGEX);
                if (typeMatch && typeMatch.groups) {
                    var arg = { type: typeMatch.groups.type };
                    if (typeMatch.groups.multiple) {
                        arg.multiple = true;
                    }
                    return [arg];
                }
                else {
                    return [];
                }
            });
        }
    }
    return DEFAULT_ARGUMENTS;
};
exports.mergeArgumentTypes = function (target, additional) {
    var _a;
    for (var i = 0; i < target.length; i++) {
        if (i >= additional.length) {
            break;
        }
        if (target[i][0].type === 'T') {
            continue;
        }
        if (additional[i][0].type === 'T') {
            target[i] = additional[i];
            continue;
        }
        (_a = target[i]).push.apply(_a, additional[i]);
    }
};
exports.adaptApiFunctions = function (functions) {
    var udfs = [];
    var adapted = {};
    functions.forEach(function (apiUdf) {
        var _a;
        if (adapted[apiUdf.name]) {
            var adaptedUdf = adapted[apiUdf.name];
            var additionalArgs = exports.extractArgumentTypes(apiUdf);
            exports.mergeArgumentTypes(adaptedUdf.arguments, additionalArgs);
            if (adaptedUdf.returnTypes[0] !== 'T') {
                var additionalReturnTypes = extractReturnTypes(apiUdf);
                if (additionalReturnTypes[0] !== 'T') {
                    (_a = adaptedUdf.returnTypes).push.apply(_a, additionalReturnTypes);
                }
                else {
                    adaptedUdf.returnTypes = additionalReturnTypes;
                }
            }
        }
        else {
            adapted[apiUdf.name] = adaptApiUdf(apiUdf);
            udfs.push(adapted[apiUdf.name]);
        }
    });
    return udfs;
};
var createUrl = function (database, udf) {
    if (database && udf) {
        return "" + urls_1.AUTOCOMPLETE_API_PREFIX + database + "/" + udf.name;
    }
    if (database) {
        return "" + urls_1.AUTOCOMPLETE_API_PREFIX + database;
    }
    if (udf) {
        return "" + urls_1.AUTOCOMPLETE_API_PREFIX + udf.name;
    }
    return urls_1.AUTOCOMPLETE_API_PREFIX;
};
var createRequestData = function (connector, operation) { return ({
    notebook: {},
    snippet: JSON.stringify({
        type: connector.id
    }),
    operation: operation
}); };
exports.fetchUdfs = function (connector, database, silenceErrors) {
    if (silenceErrors === void 0) { silenceErrors = true; }
    return __awaiter(void 0, void 0, void 0, function () {
        var url, data, response, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    url = createUrl(database);
                    data = createRequestData(connector, FUNCTIONS_OPERATION);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, apiUtils_1.simplePostAsync(url, data, { silenceErrors: silenceErrors })];
                case 2:
                    response = _a.sent();
                    if (response && response.functions) {
                        return [2 /*return*/, exports.adaptApiFunctions(response.functions)];
                    }
                    return [3 /*break*/, 4];
                case 3:
                    err_1 = _a.sent();
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/, []];
            }
        });
    });
};
exports.fetchDescribe = function (connector, udf, database, silenceErrors) {
    if (silenceErrors === void 0) { silenceErrors = true; }
    return __awaiter(void 0, void 0, void 0, function () {
        var url, data, response, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    url = createUrl(database, udf);
                    data = createRequestData(connector, FUNCTION_OPERATION);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, apiUtils_1.simplePostAsync(url, data, { silenceErrors: silenceErrors })];
                case 2:
                    response = _a.sent();
                    if (response && response["function"]) {
                        return [2 /*return*/, response["function"]];
                    }
                    return [3 /*break*/, 4];
                case 3:
                    err_2 = _a.sent();
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
};
