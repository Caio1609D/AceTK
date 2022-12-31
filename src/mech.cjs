class mech {
    constructor (query, func, listener, input) {
        this.query = query
        this.func = func
        this.listener = listener
        this.input = input
    }

    label (text) {
        let label = document.createElement("label")
        label.setAttribute("for", query.id)
        label.innerText = text
        insertBefore(label, this.query)
        return label
    }
}

const mechhandler = {
    construct(target, args) {
        const element = document.querySelector(args["query"])
        if (!element) {
            return null
        }
        const handlers = {"INPUT": "change", "BUTTON": "click"}
        element.addEventListener(((args["listener"]) ? args["listener"] : handlers[element.tagName]), args["func"]((args["input"]) ? args["input"] : element.value))
        return new target(element, args["func"], args["listener"])
    }
}

const activator = new Proxy(mech, mechhandler);

module.exports = { mech }