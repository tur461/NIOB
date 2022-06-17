const log = {
    i: function() {console.log(...arguments)},
    t: function() {console.trace(...arguments)},
    e: function() {console.error(...arguments)},
    w: function() {console.warn(...arguments)},
    s: function(m) {console.log(...(typeof m == 'string' ? [`%c${m}`, 'color:lime'] : arguments))},
}

export default log;