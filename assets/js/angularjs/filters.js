marketPlaceApp.filter('percentage', function () {
    return function (changeFraction) {
        return (changeFraction * 100).toFixed(2) + "%";
    }
});

marketPlaceApp.filter('change', function () {
    return function (changeAmount) {
        if (changeAmount > 0) {
            return "▲ " + changeAmount.toFixed(2);
        }
        else if (changeAmount < 0) {
            return "▼ " + changeAmount.toFixed(2);
        }
        else {
            return changeAmount.toFixed(2);
        }
    }
});

marketPlaceApp.filter('total', function () {
    return function (input, property) {
        var i = input instanceof Array ? input.length : 0;
        // if property is not defined, returns length of array
        // if array has zero length or if it is not an array, return zero
        if (typeof property === 'undefined' || i === 0) {
            return i;
            // test if property is number so it can be counted
        } else if (isNaN(input[0][property])) {
            throw 'filter total can count only numeric values';
            // finaly, do the counting and return total
        } else {
            var total = 0;
            while (i--)
                total += input[i][property];
            return total;
        }
    };
});

marketPlaceApp.filter('sumProduct', function () {
    return function (input) {
        var i = input instanceof Array ? input.length : 0;
        var a = arguments.length;
        if (a === 1 || i === 0)
            return i;

        var keys = [];
        while (a-- > 1) {
            var key = arguments[a].split('.');
            var property = getNestedPropertyByKey(input[0], key);
            if (isNaN(property))
                throw 'filter sumProduct can count only numeric values';
            keys.push(key);
        }

        var total = 0;
        while (i--) {
            var product = 1;
            for (var k = 0; k < keys.length; k++)
                product *= getNestedPropertyByKey(input[i], keys[k]);
            total += product;
        }
        return total;

        function getNestedPropertyByKey(data, key) {
            for (var j = 0; j < key.length; j++)
                data = data[key[j]];
            return data;
        }
    }
});