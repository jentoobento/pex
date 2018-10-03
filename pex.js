const Immutable = require('immutable');
const assert = require('assert');

function getErrors(arr) {
    function getNestedErr(item, result) {
        if (Array.isArray(item)) {
            return item.forEach(val => {
                getNestedErr(val, result);
            });
        } else if (typeof item === 'object' && item !== null) {
            return Object.values(item).forEach(val => {
                getNestedErr(val, result);
            });
        } else {
            return result.push(item);
        }
    }

    return [...new Set(arr.reduce((previous, current) => {
        getNestedErr(current, previous);
        return previous;
    }, []))].join('. ') + '.';
}

function getErrorsKeepStructure(item, itemIsInitiallyArray) {
    if (Array.isArray(item)) {
        if (itemIsInitiallyArray) {
            return item.map(element => {
                return getErrorsKeepStructure(element, false);
            })
        } else {
            return [...new Set(item.map(element => {
                return getErrorsKeepStructure(element, false);
            }))].join(' ');
        }
    } else if (typeof item === 'object' && item !== null) {
        return Object.entries(item).reduce((previous, current) => {
            return { ...previous, [current[0]]: getErrorsKeepStructure(current[1], false) }
        }, {});
    }
    return item + '.';
}

function transformErrors(error, arrOfKeysToKeepStructure = []) {
    return Immutable.Map(Object.entries(error.toJS()).reduce((previous, current) => {
        if (arrOfKeysToKeepStructure.includes(current[0]) || current[0] === 'url' || current[0] === 'urls') {
            return { ...previous, [current[0]]: getErrorsKeepStructure(current[1], true) }
        } else {
            if (Array.isArray(current[1])) {
                return { ...previous, [current[0]]: getErrors(current[1]) }
            } else if (typeof current[1] === 'object' && current[1] !== null) {
                return { ...previous, [current[0]]: getErrors([current[1]]) }
            } else {
                return { ...previous, [current[0]]: current[1] }
            }
        }
    }, {}));
}

it('should tranform errors', () => {
    // example error object returned from API converted to Immutable.Map
    const errors = Immutable.fromJS({
        name: ['This field is required'],
        age: ['This field is required', 'Only numeric characters are allowed'],
        urls: [{}, {}, {
            site: {
                code: ['This site code is invalid'],
                id: ['Unsupported id'],
            }
        }],
        url: {
            site: {
                code: ['This site code is invalid'],
                id: ['Unsupported id'],
            }
        },
        tags:
            [
                {},
                {
                    non_field_errors:
                        ['Only alphanumeric characters are allowed'],
                    another_error:
                        ['Only alphanumeric characters are allowed'],
                    third_error: ['Third error']
                },
                {},
                {
                    non_field_errors:
                        [
                            'Minumum length of 10 characters is required',
                            'Only alphanumeric characters are allowed'
                        ],
                }
            ],
        tag: {
            nested: {
                non_field_errors: ['Only alphanumeric characters are allowed'],
            },
        },
    });

    // in this specific case,
    // errors for `url` and `urls` keys should be nested
    // see expected object below
    const result = transformErrors(errors);

    assert.deepEqual(result.toJS(), {
        name: 'This field is required.',
        age: 'This field is required. Only numeric characters are allowed.',
        urls: [{}, {}, {
            site: {
                code: 'This site code is invalid.',
                id: 'Unsupported id.',
            },
        }],
        url: {
            site: {
                code: 'This site code is invalid.',
                id: 'Unsupported id.',
            },
        },
        tags: 'Only alphanumeric characters are allowed. Third error. ' +
            'Minumum length of 10 characters is required.',
        tag: 'Only alphanumeric characters are allowed.',
    });
});
