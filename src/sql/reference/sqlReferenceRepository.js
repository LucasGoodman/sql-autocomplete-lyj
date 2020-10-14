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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
var typeUtils_1 = require("./typeUtils");
var i18n_1 = require("utils/i18n");
var huePubSub_1 = require("utils/huePubSub");
var apiCache_1 = require("./apiCache");
var apiUtils_1 = require("./apiUtils");
exports.CLEAR_UDF_CACHE_EVENT = 'hue.clear.udf.cache';
exports.DESCRIBE_UDF_EVENT = 'hue.describe.udf';
exports.UDF_DESCRIBED_EVENT = 'hue.udf.described';
var SET_REFS = {
    // @ts-ignore
    impala: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
        return [2 /*return*/, Promise.resolve().then(function () { return require(/* webpackChunkName: "impala-ref" */ './impala/setReference'); })];
    }); }); }
};
var UDF_REFS = {
    // @ts-ignore
    generic: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
        return [2 /*return*/, Promise.resolve().then(function () { return require(/* webpackChunkName: "generic-ref" */ './generic/udfReference'); })];
    }); }); },
    // @ts-ignore
    hive: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
        return [2 /*return*/, Promise.resolve().then(function () { return require(/* webpackChunkName: "hive-ref" */ './hive/udfReference'); })];
    }); }); },
    // @ts-ignore
    impala: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
        return [2 /*return*/, Promise.resolve().then(function () { return require(/* webpackChunkName: "impala-ref" */ './impala/udfReference'); })];
    }); }); },
    // @ts-ignore
    pig: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
        return [2 /*return*/, Promise.resolve().then(function () { return require(/* webpackChunkName: "pig-ref" */ './pig/udfReference'); })];
    }); }); }
};
var IGNORED_UDF_REGEX = /^[!=$%&*+-/<>^|~]+$/;
var mergedUdfPromises = {};
var getMergedUdfKey = function (connector, database) {
    var key = connector.id;
    if (database) {
        key += '_' + database;
    }
    return key;
};
exports.hasUdfCategories = function (connector) {
    return typeof UDF_REFS[connector.dialect] !== 'undefined';
};
var findUdfsToAdd = function (apiUdfs, existingCategories) {
    var existingUdfNames = new Set();
    existingCategories.forEach(function (category) {
        Object.keys(category.functions).forEach(function (udfName) {
            existingUdfNames.add(udfName.toUpperCase());
        });
    });
    var result = {};
    apiUdfs.forEach(function (apiUdf) {
        if (!result[apiUdf.name] &&
            !existingUdfNames.has(apiUdf.name.toUpperCase()) &&
            !IGNORED_UDF_REGEX.test(apiUdf.name)) {
            result[apiUdf.name] = apiUdf;
        }
    });
    return result;
};
var mergeWithApiUdfs = function (categories, connector, database) { return __awaiter(void 0, void 0, void 0, function () {
    var apiUdfs, additionalUdfs, generalCategory;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, apiUtils_1.fetchUdfs(connector, database)];
            case 1:
                apiUdfs = _a.sent();
                if (apiUdfs.length) {
                    additionalUdfs = findUdfsToAdd(apiUdfs, categories);
                    if (Object.keys(additionalUdfs).length) {
                        generalCategory = {
                            name: i18n_1["default"]('General'),
                            functions: additionalUdfs
                        };
                        categories.unshift(generalCategory);
                    }
                }
                return [2 /*return*/];
        }
    });
}); };
exports.getUdfCategories = function (connector, database) { return __awaiter(void 0, void 0, void 0, function () {
    var promiseKey;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                promiseKey = getMergedUdfKey(connector, database);
                if (!mergedUdfPromises[promiseKey]) {
                    mergedUdfPromises[promiseKey] = new Promise(function (resolve) { return __awaiter(void 0, void 0, void 0, function () {
                        var cachedCategories, categories, module_1;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, apiCache_1.getCachedUdfCategories(connector, database)];
                                case 1:
                                    cachedCategories = _a.sent();
                                    if (cachedCategories) {
                                        resolve(cachedCategories);
                                    }
                                    categories = [];
                                    if (!UDF_REFS[connector.dialect]) return [3 /*break*/, 3];
                                    return [4 /*yield*/, UDF_REFS[connector.dialect]()];
                                case 2:
                                    module_1 = _a.sent();
                                    if (module_1.UDF_CATEGORIES) {
                                        categories = module_1.UDF_CATEGORIES;
                                        categories.forEach(function (category) {
                                            Object.values(category.functions).forEach(function (udf) {
                                                udf.described = true;
                                            });
                                        });
                                    }
                                    _a.label = 3;
                                case 3: return [4 /*yield*/, mergeWithApiUdfs(categories, connector, database)];
                                case 4:
                                    _a.sent();
                                    return [4 /*yield*/, apiCache_1.setCachedUdfCategories(connector, database, categories)];
                                case 5:
                                    _a.sent();
                                    resolve(categories);
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                }
                return [4 /*yield*/, mergedUdfPromises[promiseKey]];
            case 1: return [2 /*return*/, _a.sent()];
        }
    });
}); };
exports.findUdf = function (connector, functionName) { return __awaiter(void 0, void 0, void 0, function () {
    var categories, found;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, exports.getUdfCategories(connector)];
            case 1:
                categories = _a.sent();
                found = [];
                categories.forEach(function (category) {
                    if (category.functions[functionName]) {
                        found.push(category.functions[functionName]);
                    }
                });
                return [2 /*return*/, found];
        }
    });
}); };
exports.getReturnTypesForUdf = function (connector, functionName) { return __awaiter(void 0, void 0, void 0, function () {
    var udfs, returnTypesPresent_1, returnTypes_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!functionName) {
                    return [2 /*return*/, ['T']];
                }
                return [4 /*yield*/, exports.findUdf(connector, functionName)];
            case 1:
                udfs = _a.sent();
                if (!udfs.length) {
                    returnTypesPresent_1 = false;
                    returnTypes_1 = new Set();
                    udfs.forEach(function (udf) {
                        if (udf.returnTypes) {
                            returnTypesPresent_1 = true;
                            udf.returnTypes.forEach(function (type) { return returnTypes_1.add(type); });
                        }
                    });
                    if (returnTypesPresent_1) {
                        return [2 /*return*/, __spreadArrays(returnTypes_1)];
                    }
                }
                return [2 /*return*/, ['T']];
        }
    });
}); };
exports.getUdfsWithReturnTypes = function (connector, returnTypes, includeAggregate, includeAnalytic) { return __awaiter(void 0, void 0, void 0, function () {
    var categories, result;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, exports.getUdfCategories(connector)];
            case 1:
                categories = _a.sent();
                result = [];
                categories.forEach(function (category) {
                    if ((!category.isAnalytic && !category.isAggregate) ||
                        (includeAggregate && category.isAggregate) ||
                        (includeAnalytic && category.isAnalytic)) {
                        Object.keys(category.functions).forEach(function (udfName) {
                            var udf = category.functions[udfName];
                            if (!returnTypes || typeUtils_1.matchesType(connector.dialect, returnTypes, udf.returnTypes)) {
                                result.push(udf);
                            }
                        });
                    }
                });
                result.sort(function (a, b) { return a.name.localeCompare(b.name); });
                return [2 /*return*/, result];
        }
    });
}); };
exports.getArgumentDetailsForUdf = function (connector, functionName, argumentPosition) { return __awaiter(void 0, void 0, void 0, function () {
    var foundFunctions, possibleArguments;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, exports.findUdf(connector, functionName)];
            case 1:
                foundFunctions = _a.sent();
                if (!foundFunctions.length) {
                    return [2 /*return*/, [{ type: 'T' }]];
                }
                possibleArguments = [];
                foundFunctions.forEach(function (foundFunction) {
                    var args = foundFunction.arguments;
                    if (argumentPosition > args.length) {
                        possibleArguments.push.apply(possibleArguments, args[args.length - 1].filter(function (type) { return type.multiple; }));
                    }
                    else {
                        possibleArguments.push.apply(possibleArguments, args[argumentPosition - 1]);
                    }
                });
                return [2 /*return*/, possibleArguments];
        }
    });
}); };
exports.getSetOptions = function (connector) { return __awaiter(void 0, void 0, void 0, function () {
    var module_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!SET_REFS[connector.dialect]) return [3 /*break*/, 2];
                return [4 /*yield*/, SET_REFS[connector.dialect]()];
            case 1:
                module_2 = _a.sent();
                if (module_2.SET_OPTIONS) {
                    return [2 /*return*/, module_2.SET_OPTIONS];
                }
                _a.label = 2;
            case 2: return [2 /*return*/, {}];
        }
    });
}); };
var findUdfInCategories = function (categories, udfName) {
    var foundUdf = undefined;
    categories.some(function (category) {
        return Object.values(category.functions).some(function (udf) {
            if (udf.name === udfName) {
                foundUdf = udf;
                return true;
            }
        });
    });
    return foundUdf;
};
huePubSub_1["default"].subscribe(exports.DESCRIBE_UDF_EVENT, function (details) { return __awaiter(void 0, void 0, void 0, function () {
    var categories, foundUdf, apiUdf;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, exports.getUdfCategories(details.connector, details.database)];
            case 1:
                categories = _a.sent();
                foundUdf = findUdfInCategories(categories, details.udfName);
                if (!(foundUdf && !foundUdf.described)) return [3 /*break*/, 4];
                return [4 /*yield*/, apiUtils_1.fetchDescribe(details.connector, foundUdf, details.database)];
            case 2:
                apiUdf = _a.sent();
                if (!apiUdf) return [3 /*break*/, 4];
                if (apiUdf.description) {
                    foundUdf.description = apiUdf.description;
                }
                if (apiUdf.signature) {
                    foundUdf.signature = apiUdf.signature;
                }
                foundUdf.described = true;
                return [4 /*yield*/, apiCache_1.setCachedUdfCategories(details.connector, details.database, categories)];
            case 3:
                _a.sent();
                huePubSub_1["default"].publish(exports.UDF_DESCRIBED_EVENT, {
                    connector: details.connector,
                    database: details.database,
                    udf: foundUdf
                });
                _a.label = 4;
            case 4: return [2 /*return*/];
        }
    });
}); });
huePubSub_1["default"].subscribe(exports.CLEAR_UDF_CACHE_EVENT, function (details) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, apiCache_1.clearUdfCache(details.connector)];
            case 1:
                _a.sent();
                Object.keys(mergedUdfPromises).forEach(function (key) {
                    if (key === details.connector.id || key.indexOf(details.connector.id + '_') === 0) {
                        delete mergedUdfPromises[key];
                    }
                });
                if (details.callback) {
                    details.callback();
                }
                return [2 /*return*/];
        }
    });
}); });
