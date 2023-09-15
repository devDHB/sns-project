const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
    },
    password: {
      type: String,
      minLength: 5,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    kakaoId: {
      type: String,
      unique: true,
      sparse: true,
    },
    username: {
      type: String,
      required: true,
      trim: true,
    },
    firstName: {
      type: String,
      default: "First Name",
    },
    lastName: {
      type: String,
      default: "Last Name",
    },
    bio: {
      type: String,
      default: "데이터 없음",
    },
    hometown: {
      type: String,
      default: "데이터 없음",
    },
    workspace: {
      type: String,
      default: "데이터 없음",
    },
    education: {
      type: String,
      default: "데이터 없음",
    },
    contact: {
      type: String,
      default: "데이터 없음",
    },
    friends: [{ type: String }],
    friendsRequests: [{ type: String }],
  },
  { timestamps: true }
);

const saltRounds = 10;

userSchema.pre("save", function (next) {
  // 바디에서 받아온 user
  let user = this;
  // 비밀번호가 변경될 때만
  if (user.isModified("password")) {
    // salt 생성
    bcrypt.genSalt(saltRounds, function (err, salt) {
      if (err) {
        return next(err);
      }
      bcrypt.hash(user.password, salt, function (err, hashPassword) {
        if (err) {
          return next(err);
        }
        user.password = hashPassword;
        next();
      });
    });
  } else {
    next();
  }
});

userSchema.methods.comparePassword = function (plainPassword, cb) {
  // bcrypt compare 비교
  // plain password => 클라이언트에서 온 패스워드
  // this.password => db에 있는 비밀번호

  bcrypt.compare(plainPassword, this.password, function (err, isMatch) {
    if (err) {
      return cb(err);
    }
    cb(null, isMatch);
  });
};

const User = mongoose.model("User", userSchema);

module.exports = User;
