'use strict';

export default function compile(t) {

    // TODO do you want to use triple brackets here?
    const template = t,
          listeners = template.match(/\{\{\{.*\}\}\}/g);

    return function template (scope) {
        listeners.forEach(function(v) {
            v = v.replace(/\{|\}/g).trim();
        });
    }
};


// TODO you may just want to patch in the Angular compile and listen on {{{}}}
// TODO you also need to parse child scopes
