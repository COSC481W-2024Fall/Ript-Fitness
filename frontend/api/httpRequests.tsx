const BASE_URL = 'http://164.76.13.58:8080'; // Replace with your actual URL
export class httpRequests {

  // Method to handle GET requests and return JSON
static async get(endpoint: string, data? : Record<string, any>): Promise<any> { 
  try {
    // Fetch data from the specified endpoint
    const params = httpRequests.jsonToQueryString(data)
    const response = await fetch(`${BASE_URL}${endpoint}${params}`); // Use endpoint or replace with BASE_URL if needed
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    const json = await response.json() //.json(); // Parse the response as JSON
    console.log(json)
    return json; // Return the JSON data directly
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
  } // Casting JSON to a usable object format
  const queryString = Object.keys(obj)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`)
    .join('&');


  return `?${queryString}`;
}



// Method to handle POST requests and return JSON
static async post(endpoint: string, data: Record<string, any>): Promise<any> { // Return type set as Promise<any> to reflect async behavior
  try {
    // Convert JSON data to string format for POST request body
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST', // Change method to POST
      headers: {
        'Content-Type': 'application/json', // Set content type to JSON
      },
      body: JSON.stringify(data), // Convert the JSON object to a string
    });


  
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const json = await response.json(); // Parse the response as JSON
    return json; // Return the JSON data directly
  } catch (error) {

    //if access denied
    //send to login page

    console.error('POST request failed:', error);
    throw error; // Throw the error for further handling if needed
  }
}


// Method to handle PUT requests and return JSON
static async put(endpoint: string, data: Record<string, any>): Promise<any> {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    const json = await response.json();
    return json;
  } catch (error) {

    // If access denied
    // Send to login page

    console.error('PUT request failed:', error);
    throw error;
  }
}

// Method to handle DELETE requests and return JSON
static async delete(endpoint: string, data: Record<string, any>): Promise<any> {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const json = await response.json();
    return json;
  } catch (error) {

    // If access denied
    // Send to login page


    console.error('DELETE request failed:', error);
    throw error;
  }
}
}
