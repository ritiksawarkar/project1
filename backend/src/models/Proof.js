import mongoose from "mongoose";

const proofTypes = ["pickup", "handoff", "delivery"];
const proofStatuses = ["submitted", "verified", "rejected"];

const proofSchema = new mongoose.Schema(
  {
    mission: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Mission",
      required: true,
      index: true,
    },
    assignment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assignment",
      default: null,
      index: true,
    },
    proofType: {
      type: String,
      enum: proofTypes,
      required: true,
    },
    status: {
      type: String,
      enum: proofStatuses,
      default: "submitted",
    },
    note: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

proofSchema.index({ mission: 1, status: 1 });
proofSchema.index({ submittedBy: 1, status: 1 });

proofSchema.methods.toSafeObject = function toSafeObject() {
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
    assignment:
      typeof this.assignment === "object" && this.assignment?._id
        ? {
            id: this.assignment._id.toString(),
            status: this.assignment.status,
          }
        : this.assignment?.toString?.() || this.assignment,
    proofType: this.proofType,
    status: this.status,
    note: this.note,
    submittedBy:
      typeof this.submittedBy === "object" && this.submittedBy?._id
        ? {
            id: this.submittedBy._id.toString(),
            name: this.submittedBy.name,
            email: this.submittedBy.email,
          }
        : this.submittedBy?.toString?.() || this.submittedBy,
    verifiedBy:
      typeof this.verifiedBy === "object" && this.verifiedBy?._id
        ? {
            id: this.verifiedBy._id.toString(),
            name: this.verifiedBy.name,
            email: this.verifiedBy.email,
          }
        : this.verifiedBy?.toString?.() || this.verifiedBy,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

const Proof = mongoose.model("Proof", proofSchema);

export { proofTypes, proofStatuses };
export default Proof;
