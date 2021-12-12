const formats = require('dd-trace/ext/formats');

class Logger {
    constructor(t) {
        this.tracer = t;
    }
    log(level, message) {
        const span = this.tracer.scope().active();
        const time = new Date().toISOString();
        const record = { time, level, message };

        if (span) {
            this.tracer.inject(span.context(), formats.LOG, record);
            console.log('se mando una trace a dd');
        }

        console.log(JSON.stringify(record));
    }
}

module.exports = Logger;