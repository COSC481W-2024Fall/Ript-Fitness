import { GlobalContext } from "@/context/GlobalContext";
import { USE_LOCAL, LOCAL_IP, AZURE_API_URL } from "@env";
import { useContext } from "react";

//const AZURE_API_URL = "https://ript-fitness-app.azurewebsites.net";
const BASE_URL = USE_LOCAL === "true" ? `http://${LOCAL_IP}` : AZURE_API_URL;

export class httpRequests {
  static getBaseURL() {
    return USE_LOCAL === "true" ? `http://${LOCAL_IP}` : AZURE_API_URL;
  }

  // Method to handle GET requests and return JSON
  static async get(
    endpoint: string,
    token: string,
    data?: Record<string, any>
  ): Promise<any> {
    try {
      const params = httpRequests.jsonToQueryString(data);
      console.log(params);
      console.log(`${BASE_URL}${endpoint}${params}`);
      const response = await fetch(`${BASE_URL}${endpoint}${params}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        console.error(`Failed request to endpoint: ${endpoint}`);
        throw new Error(`Error: ${response.status}`);
      }
      const json = await response.json();
      return json;
    } catch (error) {
      console.error("GET request failed:", error);
      throw error;
    }
  }

  // Method to handle POST requests and return Response
  static async post(
    endpoint: string,
    token: string,
    data: Record<string, any>
  ): Promise<Response> {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      return response;
    } catch (error) {
      console.error("POST request failed:", error);
      throw error;
    }
  }

  // Method to handle PUT requests and return Response
  static async put(
    endpoint: string,
    token: string,
    data: Record<string, any>
  ): Promise<Response> {
    try {
      let response;
      console.log("rthrth" + token)
      if (token != "") {
        response = await fetch(`${BASE_URL}${endpoint}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        });
      } else {
        response = await fetch(`${BASE_URL}${endpoint}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });
      }
      return response;
    } catch (error) {
      console.error("PUT request failed:", error);
      throw error;
    }
  }

  // Method to handle DELETE requests and return JSON
  static async delete(
    endpoint: string,
    token: string,
    data?: Record<string, any>
  ): Promise<any> {
    try {
      const params = httpRequests.jsonToQueryString(data);
      const response = await fetch(`${BASE_URL}${endpoint}${params}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const json = await response.json();
      return json;
    } catch (error) {
      console.error("DELETE request failed:", error);
      throw error;
    }
  }

  // Helper function to convert JSON to query string
  static jsonToQueryString(obj?: Record<string, any>): string {
    if (!obj || Object.keys(obj).length === 0) {
      return "";
    }

    const queryString = Object.keys(obj)
      .map(
        (key) => `${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`
      )
      .join("&");

    return `?${queryString}`;
  }
}
