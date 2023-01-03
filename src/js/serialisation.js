function serialize(data) {
    return JSON.stringify(data, (key, value) => {
        if(value instanceof Function) return value.toString();
        if(!!value?.toJSON) return value.toJSON();
        if(!!value?.serialize) return value.serialize();
        return value;
    });
}
function deserialize(data) {
    return JSON.parse(data, (key, value) => {
        if(typeof value !== "string") return value;
        if(value.startsWith("function") || ["fn", "function", "func"].includes(key)) return new Function(`return ${value}`)();
        if(value.startsWith("WebView{")) return require("./index").WebView.fromJSON(value);
        return value;
    });
}

module.exports = {
    serialize,
    deserialize,
}