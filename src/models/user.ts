import mongoose, { Schema, models,model, Document, Types } from 'mongoose';

interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  roleId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>({
  username: {type: String, required: true},
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  roleId: { type: Schema.Types.ObjectId, ref: 'Role' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

userSchema.pre<IUser>('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// await dbConnect()


// const User = model<IUser>('User', userSchema);
// const User = mongoose.model("User", userSchema);
// const User = models?.User ?? model("User", userSchema);
const User = mongoose.models.User || model('User', userSchema);
export default User;
