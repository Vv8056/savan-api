// /lib/savanApi.js

const BASE_URL = "https://www.jiosaavn.com/api.php";

export default class SavanApi {
  constructor(fetchImpl = fetch) {
    this.fetch = fetchImpl;
  }

  async _get(params = {}) {
    const url = new URL(BASE_URL);
    Object.entries(params).forEach(([k, v]) =>
      url.searchParams.append(k, v)
    );

    const response = await this.fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "User-Agent": "Mozilla/5.0",
        Referer: "https://www.jiosaavn.com/",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return response.json();
  }

  /* ---------------- GET LAUNCH ---------------- */
  async getLaunch() {
    return this._get({
      __call: "webapi.getLaunchData",
      api_version: "4",
      _format: "json",
      _marker: "0",
      ctx: "wap6dot0",
    });
  }

  /* ---------------- SEARCH ---------------- */
  async Search({
  query,
  countryCode = "in",
  includeMetaTags = true,
  page = 1
  }) {
    if (!query || !query.trim()) {
      throw new Error("Search query is required");
    }

    const cleanQuery = query.trim();

    return this._get({
      __call: "autocomplete.get",
      query: cleanQuery,
      cc: countryCode,
      includeMetaTags: String(includeMetaTags),
      _format: "json",
      _marker: "0",
      ctx: "wap6dot0",
      page: String(page)
    });
  }
  
  /* ---------------- AUTO FETCH ---------------- */
  async autoFetch({ token, type }) {
    const finalType = type || this._detectType(token);
    return this._callByType(token, finalType);
  }

  async _callByType(token, type) {
    switch (type.toLowerCase()) {
      case "song":
      case "mix":
      case "show":
      case "episode":
        return this._get({
          __call: "webapi.get",
          token,
          type,
          api_version: "4",
          _format: "json",
          ctx: "wap6dot0",
        });

      case "album":
        return this._get({
          __call: "webapi.getAlbum",
          token,
          api_version: "4",
          _format: "json",
          ctx: "wap6dot0",
        });

      case "artist":
      case "radio_station":
        return this._get({
          __call: "webapi.getArtist",
          token,
          api_version: "4",
          _format: "json",
          ctx: "wap6dot0",
        });

      case "playlist":
        return this._get({
          __call: "webapi.getPlaylist",
          token,
          api_version: "4",
          _format: "json",
          ctx: "wap6dot0",
        });

      default:
        throw new Error(`Unsupported type: ${type}`);
    }
  }

  _detectType(token) {
    if (!token || token.length < 8) return "song";
    if (token.endsWith("_")) return "album";
    if (token.includes("PL")) return "playlist";
    if (token.includes("MX")) return "mix";
    return "song";
  }
}
