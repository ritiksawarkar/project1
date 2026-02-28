import mongoose from "mongoose";

const missionStatuses = [
  "created",
  "assigned",
  "inTransit",
  "delivered",
  "closed",
];

const missionPriorities = ["low", "medium", "high"];

const missionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 160,
    },
    donor: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 120,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    area: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    priority: {
      type: String,
      enum: missionPriorities,
      default: "medium",
    },
    status: {
      type: String,
      enum: missionStatuses,
      default: "created",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

missionSchema.methods.toSafeObject = function toSafeObject() {
  return {
    id: this._id.toString(),
    title: this.title,
    donor: this.donor,
    category: this.category,
    area: this.area,
    priority: this.priority,
    status: this.status,
    createdBy:
      typeof this.createdBy === "object" && this.createdBy?._id
        ? {
            id: this.createdBy._id.toString(),
            name: this.createdBy.name,
            email: this.createdBy.email,
            role: this.createdBy.role,
          }
        : this.createdBy?.toString?.() || this.createdBy,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

const Mission = mongoose.model("Mission", missionSchema);

export { missionStatuses, missionPriorities };
export default Mission;
