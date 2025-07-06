import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import zod from "zod";
import Account from "../models/account.model.js";

// Zod validation schemas
const signupBodyValidation = zod.object({
  username: zod.string().min(3).max(30).trim().toLowerCase(),
  firstName: zod.string().max(50).trim(),
  lastName: zod.string().max(50).trim(),
  password: zod.string().min(6),
});

const loginBodyValidation = zod.object({
  username: zod.string().min(3).max(30).trim().toLowerCase(),
  password: zod.string().min(6),
});

const updateBodyValidation = zod.object({
  firstName: zod.string().max(50).trim(),
  lastName: zod.string().max(50).trim(),
  password: zod.string().min(6).optional(),
});

// ✅ Signup Controller
export const userSignup = async (req, res) => {
  try {
    const validated = signupBodyValidation.safeParse(req.body);
    if (!validated.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid input",
        errors: validated.error.errors,
      });
    }

    const { username, firstName, lastName, password } = validated.data;

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Username already exists",
      });
    }

    const newUser = await User.create({
      username,
      firstName,
      lastName,
      password, // ✅ Will be hashed by Mongoose pre-save hook
    });

    //----create new account -----
    await Account.create({
      userId: newUser._id,
      balance: 1 + Math.random() * 10000,
    });

    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      token,
      user: {
        id: newUser._id,
        username: newUser.username,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
      },
    });
  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// ✅ Login Controller
export const userLogin = async (req, res) => {
  try {
    const validated = loginBodyValidation.safeParse(req.body);
    if (!validated.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid input",
        errors: validated.error.errors,
      });
    }

    const { username, password } = validated.data;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// ✅ Update Controller
export const userUpdate = async (req, res) => {
  try {
    const validated = updateBodyValidation.safeParse(req.body);
    if (!validated.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid input",
        errors: validated.error.errors,
      });
    }

    const { firstName, lastName, password } = validated.data;

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.firstName = firstName;
    user.lastName = lastName;

    if (password) {
      user.password = password; // ✅ Will be hashed by pre-save
    }

    await user.save(); // Triggers pre-save hook for hashing if password was modified

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: {
        id: user._id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  } catch (err) {
    console.error("Update error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// ✅ Get Users Controller
export const getUsers = async (req, res) => {
  try {
    const filter = req.query.filter?.trim() || "";

    // Case-insensitive regex match for firstName or lastName
    const users = await User.find({
      $or: [
        { firstName: { $regex: filter, $options: "i" } },
        { lastName: { $regex: filter, $options: "i" } },
      ],
    }).select("firstName lastName _id"); // Return only necessary fields

    return res.status(200).json({
      users,
    });
  } catch (err) {
    console.error("Error fetching users:", err.message);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const userLogout = async (req, res) => {
  try {
    return res.status(200).json({ message: "Logout successful" });
  } catch (err) {
    console.error("Logout error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        _id: user._id,
      },
    });
  } catch (error) {
    console.error("Error in getCurrentUser:", error);
    res.status(500).json({ message: "Server error" });
  }
};
