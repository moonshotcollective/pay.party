import HttpController from "./httpController";

export default class MongoDBController {
  http = new HttpController();
  async newParty(data) {
    const url = `${process.env.REACT_APP_API_URL}/party`;
    return this.http.post(url, {}, data); // Clean this up
  }
  async fetchAllParties() {
    const url = `${process.env.REACT_APP_API_URL}/parties`;
    return this.http.get(url);
  }
  async fetchParty(id) {
    const url = `${process.env.REACT_APP_API_URL}/party/${id}`;
    return this.http.get(url);
  }
  async updateParty(id, data) {
    const url = `${process.env.REACT_APP_API_URL}/party/${id}`;
    return this.http.put(url, data);
  }
}
