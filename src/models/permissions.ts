import { Schema, model, models, Document } from "mongoose"

interface IPermission extends Document {
  key: string
  name: string
}

const permissionSchema = new Schema<IPermission>({
  key: { type: String, required: true, unique: true },
  name: { type: String, required: true },
})

// const Permission = model<IPermission>('Permission', permissionSchema);
const Permission = models?.Permission ?? model("Permission", permissionSchema)
export default Permission
