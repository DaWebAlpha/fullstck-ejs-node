/**
 * User Model Definition
 * ----------------------
 * This file defines the Mongoose schema for the User collection.
 * Features:
 *  - Auto-generates a unique ID using cuid2 (length: 10)
 *  - Validates username (cannot be 'admin', only letters/numbers/spaces/_ allowed)
 *  - Validates email format and ensures uniqueness
 *  - Hashes passwords automatically using mongoose-bcrypt
 *  - Adds uniqueness validation messages via mongoose-unique-validator
 *  - Includes createdAt and updatedAt timestamps
 */

import validator from 'validator';
import { createId } from '@paralleldrive/cuid2';
import mongooseBcrypt from 'mongoose-bcrypt';
import uniqueValidator from 'mongoose-unique-validator';


const userSchema = new mongoose.Schema({
    id: {type: String, default: () => createId({length: 10})},
    username:{
        type: String,
        lowercase: true,
        required: true,
        trim: true,
        validate:[
            {
                validator: (str) => !/^admin$/.test(str.toLowerCase()),
                message: "Name admin is reserved",
            },
            {
                validator: (str) => /^[a-zA-Z0-9\s_]+$/.test(str),
                message: "Name should contain only letters,numbers, space or _",
            }
        ]
    },
    email:{
        type: String,
        unique: true,
        lowercase: true,
        required: true,
        validate:{
            validator: validator.isEmail,
            message: "Enter a valid Email"
        }
    },
    password:{
        type: String,
        required: true,
        bcrypt: true,
    }
}, {timestamps: true})

userSchema.plugin(mongooseBcrypt);
userSchema.plugin(uniqueValidator, {"message": '{PATH} already exits'});

export const User = mongoose.model('User', userSchema);