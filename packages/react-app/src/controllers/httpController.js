import axios from "axios";
// This helper class is meant to serve as a flexible HTTP service
export default class HttpController {
  async get(baseURL, endpoint, params, headers) {
    const url = endpoint ? baseURL.concat(endpoint) : baseURL;
    const options = { params, headers };
    return axios.get(url, options);
  }
  async post(baseURL, params, body, headers, asFormEncoded) {
    const url = baseURL;
    const options = {
      params,
      headers,
    };
    if (asFormEncoded && body) {
      const bodyParams = new URLSearchParams();
      for (const b of Object.keys(body)) {
        bodyParams.append(b, body[b]);
      }
      body = bodyParams;
    }
    return axios.post(url, body, options);
  }
  async put(
    baseURL,
    // object!
    data,
    params,
    headers,
  ) {
    const url = baseURL;
    const options = {
      params,
      headers,
    };
    return axios.put(url, data, options);
  }
}
