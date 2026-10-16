import Notification from "../../models/communication/notification.model.js";

class NotificationRepository {
  async create(data) {
    return await Notification.create(data);
  }

  async insertMany(docs) {
    return await Notification.insertMany(docs);
  }

  async findById(id) {
    return await Notification.findById(id).exec();
  }

  async findByUserId(userId, options = {}) {
    const { skip = 0, limit = 20, sort = { createdAt: -1 } } = options;
    return await Notification.find({ user_id: userId })
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .exec();
  }

  async markAsRead(id, userId) {
    return await Notification.findOneAndUpdate(
      { _id: id, user_id: userId },
      { $set: { is_read: true } },
      { new: true }
    ).exec();
  }

  async markAllAsRead(userId) {
    return await Notification.updateMany({ user_id: userId, is_read: false }, { $set: { is_read: true } });
  }

  async countUnread(userId) {
    return await Notification.countDocuments({ user_id: userId, is_read: false }).exec();
  }

  async deleteById(id) {
    return await Notification.findByIdAndDelete(id).exec();
  }
}

export default new NotificationRepository();
