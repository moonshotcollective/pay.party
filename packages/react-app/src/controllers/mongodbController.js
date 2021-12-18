import HttpController from "./httpController";

export default class MongoDBController {
  http = new HttpController();
  async newParty(data) {
    const url = "http://localhost:8080/party";
    return this.http.post(url, {}, data); // Clean this up
  }
  async fetchAllParties() {
    const url = "http://localhost:8080/party";
    return this.http.get(url);
  }
  async fetchParty(id) {
    const url = `http://localhost:8080/party/${id}`;
    return this.http.get(url);
  }
  async updateParty(id, data) {
    const url = `http://localhost:8080/party/${id}`;
    return this.http.put(url, data);
  }
}
