// Core utility JavaScript and functions for use in filters
//
// Author: MC Brown (9af05337@opayq.com)


// Simulate the load() function to additional external JS scripts

function load(filename) {
    var file = new java.io.BufferedReader(new java.io.FileReader(new java.io.File(filename)));

    var sb = "";
    while((line = file.readLine()) != null)
        {
            sb = sb + line + java.lang.System.getProperty("line.separator");
        }

    eval(sb);
}

// Read a file and evaluate it as JSON, returning the evaluated portion

function readJSONFile(path)
{
    var file = new java.io.BufferedReader(new java.io.FileReader(new java.io.File(path)));

    var sb = "";
    while((line = file.readLine()) != null)
        {
            sb = sb + line + java.lang.System.getProperty("line.separator");
        }

    jsonval = eval("(" + sb + ")");

    return jsonval;
}

// Class for reoncstituing objects into JSON

JSON = {
    parse: function(sJSON) { return eval('(' + sJSON + ')'); },
    stringify: (function () {
      var toString = Object.prototype.toString;
      var isArray = Array.isArray || function (a) { return toString.call(a) === '[object Array]'; };
      var escMap = {'"': '\\"', '\\': '\\\\', '\b': '\\b', '\f': '\\f', '\n': '\\n', '\r': '\\r', '\t': '\\t'};
//      var escFunc = function (m) { return escMap[m] || '\\u' + (m.charCodeAt(0) + 0x10000).toString(16).substr(1); };
//      var escRE = /[\\"\u0000-\u001F\u2028\u2029]/g;
      return function stringify(value) {
        if (value == null) {
          return 'null';
        } else if (typeof value === 'number') {
          return isFinite(value) ? value.toString() : 'null';
        } else if (typeof value === 'boolean') {
          return value.toString();
        } else if (typeof value === 'object') {
          if (typeof value.toJSON === 'function') {
            return stringify(value.toJSON());
          } else if (isArray(value)) {
            var res = '[';
            for (var i = 0; i < value.length; i++)
              res += (i ? ', ' : '') + stringify(value[i]);
            return res + ']';
          } else if (toString.call(value) === '[object Object]') {
            var tmp = [];
            for (var k in value) {
              if (value.hasOwnProperty(k))
                tmp.push(stringify(k) + ': ' + stringify(value[k]));
            }
            return '{' + tmp.join(', ') + '}';
          }
        }
//        return '"' + value.toString().replace(escRE, escFunc) + '"';
        return '"' + value.toString() + '"';
      };
    })()
  };
