import { Schema, model,models, Document, Types } from 'mongoose';

interface IRole extends Document {
  name: string;
  permissions: Types.ObjectId[];
}

const roleSchema = new Schema<IRole>({
  name: { type: String, required: true, unique: true },
  permissions: [{ type: Schema.Types.ObjectId, ref: 'Permission' }],
});

// const Role = model<IRole>('Role', roleSchema);
const Role = models?.Role ?? model("Role", roleSchema);
export default Role;
