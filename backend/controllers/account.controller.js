import mongoose from "mongoose";
import Account from "../models/account.model.js";

// ✅ current user balance
export const getBalance = async (req, res) => {
  try {
    const account = await Account.findOne({ userId: req.user.userId });

    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    return res.status(200).json({ balance: account.balance });
  } catch (error) {
    console.error("Error fetching balance:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ✅ transfer to another user
export const transfer = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const { amount, to } = req.body;
    const fromUserId = req.user.userId;

    if (!amount || !to) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    const sender = await Account.findOne({ userId: fromUserId }).session(
      session
    );
    if (!sender) {
      return res
        .status(404)
        .json({ success: false, message: "Sender account not found" });
    }

    if (sender.balance < amount) {
      return res
        .status(400)
        .json({ success: false, message: "Insufficient balance" });
    }

    const recipient = await Account.findOne({ userId: to }).session(session);
    if (!recipient) {
      return res
        .status(404)
        .json({ success: false, message: "Recipient account not found" });
    }

    await Account.updateOne(
      { userId: fromUserId },
      { $inc: { balance: -amount } }
    ).session(session);

    await Account.updateOne(
      { userId: to },
      { $inc: { balance: amount } }
    ).session(session);

    await session.commitTransaction();
    return res
      .status(200)
      .json({ success: true, message: "Transfer successful" });
  } catch (error) {
    await session.abortTransaction();
    console.error("Transfer error:", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  } finally {
    session.endSession();
  }
};
