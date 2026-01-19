import env from "../config";

export default class HttpClient {
  // Base URL for the API

  public static get baseUrl(): string {
    if (
      window.location.origin.includes("localhost") ||
      window.location.origin.includes("127.0.0.1")
    ) {
      return "http://127.0.0.1:5000";
    }
    return `${window.location.origin}`;
  }

  // Method to perform a GET request
  public static async get<T>(
    endpoint: string,
    authToken: string | null = null
  ): Promise<T> {
    try {
      let headers: { [key: string]: string } = {
        "Content-Type": "application/json",
      };
      
      if (authToken) {
        headers["Authorization"] = `Bearer ${authToken}`;
      }
      
      const response = await fetch(`${this.baseUrl}/${endpoint}`, {
        method: "GET",
        headers: headers,
      });
      if (!response.ok) {
        // ⭐ Try to get error message from response
        try {
          const errorData = await response.json();
          const errorMessage = errorData.message || errorData.error || `Error: ${response.status}`;
          throw new Error(errorMessage);
        } catch (parseError) {
          // If JSON parsing fails, throw generic error
          throw new Error(`Error: ${response.status}`);
        }
      }
      let data = JSON.parse(await response.text());
      return data;
    } catch (error) {
      console.log(error);
      // You could add more error handling logic here
      throw error;
    }
  }

  // Method to perform a POST request
  public static async post<T>(endpoint: string, data: any, authToken: string | null = null): Promise<T> {
    try {
      let headers: { [key: string]: string } = {
        "Content-Type": "application/json",
      };
      
      if (authToken) {
        headers["Authorization"] = `Bearer ${authToken}`;
      }
      
      const response = await fetch(`${this.baseUrl}/${endpoint}`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error Response Body:", errorText);
        
        try {
          const errorJson = JSON.parse(errorText);
          console.error("Parsed Error:", errorJson);
          const errorMessage = errorJson.message || errorJson.error || `Error: ${response.status}`;
          throw new Error(errorMessage);
        } catch (e) {
          console.error("Could not parse error as JSON");
          throw new Error(`Error: ${response.status}`);
        }
      }
      return await response.json();
    } catch (error) {
      // You could add more error handling logic here
      throw error;
    }
  }

public static async delete<T>(endpoint: string, data: any, authToken: string | null = null): Promise<T> {
  try {
    let headers: { [key: string]: string } = {
      "Content-Type": "application/json",
    };
    
    if (authToken) {
      headers["Authorization"] = `Bearer ${authToken}`;
    }
    
    const response = await fetch(`${this.baseUrl}/${endpoint}`, {
      method: "DELETE",
      headers: headers,
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      // ⭐ Try to get error message from response
      try {
        const errorData = await response.json();
        const errorMessage = errorData.message || errorData.error || `Error: ${response.status}`;
        throw new Error(errorMessage);
      } catch (parseError) {
        throw new Error(`Error: ${response.status}`);
      }
    }
    return await response.json();
  } catch (error) {
    // You could add more error handling logic here
    throw error;
  }
}
}