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
exports.__esModule = true;
var typeConversion_1 = require("./hive/typeConversion");
var typeConversion_2 = require("./impala/typeConversion");
var typeConversion_3 = require("./generic/typeConversion");
var stripPrecision = function (types) {
    var result = [];
    types.forEach(function (type) {
        if (type.indexOf('(') > -1) {
            result.push(type.substring(0, type.indexOf('(')));
        }
        else {
            result.push(type);
        }
    });
    return result;
};
var getTypeConversion = function (dialect) {
    if (dialect === 'impala') {
        return typeConversion_2.TYPE_CONVERSION;
    }
    if (dialect === 'hive') {
        return typeConversion_1.TYPE_CONVERSION;
    }
    return typeConversion_3.TYPE_CONVERSION;
};
/**
 * Matches types based on implicit conversion i.e. if you expect a BIGINT then INT is ok but not BOOLEAN etc.
 */
exports.matchesType = function (dialect, expectedTypes, actualRawTypes) {
    if (expectedTypes.length === 1 && expectedTypes[0] === 'T') {
        return true;
    }
    var actualTypes = stripPrecision(actualRawTypes);
    if (actualTypes.indexOf('ARRAY') !== -1 ||
        actualTypes.indexOf('MAP') !== -1 ||
        actualTypes.indexOf('STRUCT') !== -1) {
        return true;
    }
    var conversionTable = getTypeConversion(dialect);
    for (var i = 0; i < expectedTypes.length; i++) {
        for (var j = 0; j < actualTypes.length; j++) {
            // To support future unknown types
            if (typeof conversionTable[expectedTypes[i]] === 'undefined' ||
                typeof conversionTable[expectedTypes[i]][actualTypes[j]] == 'undefined') {
                return true;
            }
            if (conversionTable[expectedTypes[i]] && conversionTable[expectedTypes[i]][actualTypes[j]]) {
                return true;
            }
        }
    }
    return false;
};
