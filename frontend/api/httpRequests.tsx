import { USE_LOCAL, LOCAL_IP } from '@env';

const Azure_URL = 'https://ript-fitness-app.azurewebsites.net';
const BASE_URL = USE_LOCAL === 'true' ? `http://${LOCAL_IP}` : Azure_URL;

async function getBaseUrl() {
  return USE_LOCAL === 'true' ? `http://${LOCAL_IP}` : Azure_URL;
}

export class httpRequests {

  // Method to handle GET requests and return JSON
static async get(endpoint: string, data? : Record<string, any>): Promise<any> { 
  try {
    // Fetch data from the specified endpoint

    const params = httpRequests.jsonToQueryString(data)
    const response = await fetch(`${BASE_URL}${endpoint}`); // Use endpoint or replace with BASE_URL if needed
    console.log(`${BASE_URL}${endpoint}/${params}`)
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    //const json = await response.json() //.json(); // Parse the response as JSON
    //console.log(json)
    return response; // Return the JSON data directly
  } catch (error) {

    // If access denied
    // Send to login page

    console.error('GET request failed:', error);
    throw error; // Throw the error for further handling if needed
  }
}

static jsonToQueryString(obj?: Record<string, any>): string {
  if (obj == undefined) {
    return "";
  }

  const keys = Object.keys(obj);

  // If there's only one key-value pair, return just the value
  if (keys.length === 1) {
    return encodeURIComponent(obj[keys[0]]);
  }

  // Otherwise, construct the query string as usual
  const queryString = keys
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`)
    .join('&');

  return `?${queryString}`;
}

// Method to handle POST requests and return Response
static async post(endpoint: string, data: Record<string, any>): Promise<Response> {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST', // Set method to POST
      headers: {
        'Content-Type': 'application/json', // Set content type to JSON
      },
      body: JSON.stringify(data), // Convert the data to a JSON string
    });

    return response; // Return the full response object
  } catch (error) {
    console.error('POST request failed:', error);
    throw error; 
  }
}


// Method to handle PUT requests and return JSON and status
static async put(endpoint: string, data: Record<string, any>): Promise<Response> {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'PUT', // Set method to PUT
      headers: {
        'Content-Type': 'application/json', // Set content type to JSON
      },
      body: JSON.stringify(data), // Convert the data to a JSON string
    });

    return response; // Return the full response object
  } catch (error) {
    console.error('PUT request failed:', error);
    throw error; 
  }
}

// Method to handle DELETE requests and return JSON
static async delete(endpoint: string, data? : Record<string, any>): Promise<any> { 
  try {
    // Fetch data from the specified endpoint
    const params = httpRequests.jsonToQueryString(data)
    const response = await fetch(`${BASE_URL}${endpoint}/${params}`, {
      method: 'DELETE'
    });
    console.log(`${BASE_URL}${endpoint}/${params}`)
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    const json = await response.json() //.json(); // Parse the response as JSON
    console.log(json)
    return json; // Return the JSON data directly
  } catch (error) {

    // If access denied
    // Send to login page

    console.error('DELETE request failed:', error);
    throw error; // Throw the error for further handling if needed
  }
}
}
