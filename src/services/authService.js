import axios from "axios";

const API = "http://localhost:3000/users";

export const registerUser = async (
  name,
  email,
  password,
  mobile,
  address
) => {
  try {
    // check existing email
    const existingUser = await axios.get(`${API}?email=${email}`);

    if (existingUser.data.length > 0) {
      return {
        success: false,
        message: "Email already registered",
      };
    }

    const response = await axios.post(API, {
      name,
      email,
      password,
      mobile,
      address,
    });

    return {
      success: true,
      user: response.data,
    };
  } catch (error) {
    console.log("Registration Error:", error); //  show in console

    return {
      success: false,
      message:
        error.response?.data?.message ||
        error.message ||
        "Server error",
    };
  }
};



// LOGIN USER
export const loginUser = async (email, password) => {
  try {
    const response = await axios.get(
      `${API}?email=${email}&password=${password}`
    );

    if (response.data.length === 0) {
      return {
        success: false,
        message: "Invalid email or password",
      };
    }

    return {
      success: true,
      user: response.data[0],
    };
  } catch (error) {
    return {
      success: false,
      message: "Login failed",
    };
  }
};
