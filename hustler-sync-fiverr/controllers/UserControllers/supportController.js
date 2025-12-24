const SupportMessage = require("../../models/SupportMessage");
const { success, error } = require("../../helpers/response");

const sendSupportMessage = async (req, res) => {
  try {
    const { subject, message } = req.body;
    let image = null;

    if (req.file) {
      image = req.file.path;
    }

    const supportMessage = await SupportMessage.create({
      userId: req.user._id,
      subject,
      message,
      image,
    });

    return success(res, "Support message sent successfully", supportMessage);
  } catch (err) {
    return error(res, err.message, 500);
  }
};

const getUserMessages = async (req, res) => {
  try {
    const messages = await SupportMessage.find({
      userId: req.user._id,
      isDeleted: false,
    }).sort({ createdAt: -1 });

    return success(res, "Messages fetched successfully", messages);
  } catch (err) {
    return error(res, err.message, 500);
  }
};

const getMessageById = async (req, res) => {
  try {
    const { id } = req.params;

    const message = await SupportMessage.findOne({
      _id: id,
      userId: req.user._id,
      isDeleted: false,
    });

    if (!message) {
      return error(res, "Message not found", 404);
    }

    return success(res, "Message fetched successfully", message);
  } catch (err) {
    return error(res, err.message, 500);
  }
};

module.exports = {
  sendSupportMessage,
  getUserMessages,
  getMessageById,
};
