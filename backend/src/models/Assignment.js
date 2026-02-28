import mongoose from "mongoose";

const assignmentStatuses = ["assigned", "inProgress", "completed", "canceled"];

const assignmentSchema = new mongoose.Schema(
  {
    mission: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Mission",
      required: true,
      index: true,
    },
    volunteer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: assignmentStatuses,
      default: "assigned",
    },
  },
  {
    timestamps: true,
  },
);

assignmentSchema.index({ mission: 1, status: 1 });
assignmentSchema.index({ volunteer: 1, status: 1 });
assignmentSchema.index(
  { mission: 1 },
  {
    unique: true,
    partialFilterExpression: { status: { $in: ["assigned", "inProgress"] } },
  },
);

assignmentSchema.methods.toSafeObject = function toSafeObject() {
  return {
    id: this._id.toString(),
    mission:
      typeof this.mission === "object" && this.mission?._id
        ? {
            id: this.mission._id.toString(),
            title: this.mission.title,
            status: this.mission.status,
          }
        : this.mission?.toString?.() || this.mission,
    volunteer:
      typeof this.volunteer === "object" && this.volunteer?._id
        ? {
            id: this.volunteer._id.toString(),
            name: this.volunteer.name,
            email: this.volunteer.email,
            role: this.volunteer.role,
          }
        : this.volunteer?.toString?.() || this.volunteer,
    assignedBy:
      typeof this.assignedBy === "object" && this.assignedBy?._id
        ? {
            id: this.assignedBy._id.toString(),
            name: this.assignedBy.name,
          }
        : this.assignedBy?.toString?.() || this.assignedBy,
    status: this.status,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

const Assignment = mongoose.model("Assignment", assignmentSchema);

export { assignmentStatuses };
export default Assignment;
