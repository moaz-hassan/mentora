import LessonMaterial from "../../models/courses/lessonMaterial.model.js";

class LessonMaterialRepository {
  async findByLessonId(lessonId) {
    return await LessonMaterial.find({ lesson_id: lessonId })
      .sort({ order_number: 1 })
      .exec();
  }

  async findById(materialId) {
    return await LessonMaterial.findById(materialId).exec();
  }

  async create(materialData) {
    return await LessonMaterial.create(materialData);
  }

  async updateById(materialId, updateData) {
    return await LessonMaterial.findByIdAndUpdate(
      materialId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).exec();
  }

  async deleteById(materialId) {
    return await LessonMaterial.findByIdAndDelete(materialId).exec();
  }

  async countByLessonId(lessonId) {
    return await LessonMaterial.countDocuments({ lesson_id: lessonId }).exec();
  }

  async updateOrder(materials) {
    return await Promise.all(
      materials.map((item) =>
        LessonMaterial.findByIdAndUpdate(item.id, {
          $set: { order_number: item.order_number },
        }).exec()
      )
    );
  }
}

export default new LessonMaterialRepository();
