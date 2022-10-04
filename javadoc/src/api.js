export const ENDPOINT = process.env.API_ENDPOINT;

export function doRequest(path, data, method = "GET") {
    const hasBody = allowBody(method.toUpperCase());
    const init = {
        method: method.toUpperCase(),
        body: hasBody ? data : undefined,
        credentials: "same-origin"
    };
    let url = ENDPOINT + path;
    if (!hasBody) {
        let params = toQueryParams(data);
        if (params.length !== 0) {
            url += "?" + params;
        }
    }
    return fetch(url, init).then(resp => {
        if (resp.status >= 400) {
            let isJsonResp = resp.headers.get("Content-Type").indexOf("application/json") !== -1;
            return Promise.reject({
                status: resp.status,
                resp: isJsonResp ? resp.json() : {code: resp.status, msg: resp.status + " " + resp.statusText}
            });
        }
        return resp.json();
    });
}

function allowBody(method) {
    return method === "POST" || method === "PUT" || method === "PATCH";
}

function toQueryParams(data) {
    if (typeof data === "object" && data !== null) {
        return Object.keys(data)
            .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`)
            .join("&");
    }
    return "";
}
