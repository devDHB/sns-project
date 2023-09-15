const passport = require("passport");
const User = require("../models/users.model");
const LocalStrategy = require("passport-local").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const KakaoStrategy = require("passport-kakao").Strategy;

// req.login(user) 받아온 user 로 세션 생성
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// client => session => request
// id 파라미터는 serializeUser 에서 넣어준 user.id 임
passport.deserializeUser((id, done) => {
  User.findById(id).then((user) => {
    // req.user = user 가 됨
    done(null, user);
  });
});

const localStrategyConfig = new LocalStrategy(
  { usernameField: "email", passwordField: "password" },
  (email, password, done) => {
    User.findOne({
      email: email.toLocaleLowerCase(),
    })
      .then((user) => {
        // 유저가 없으면
        if (!user) {
          return done(null, false, { msg: `Email ${email} not found` });
        }

        user.comparePassword(password, (err, isMatch) => {
          if (err) return done(err);

          if (isMatch) {
            // 비번이 맞으면 user 객체를 보냄
            return done(null, user);
          }

          // 비번 틀렸을 시
          return done(null, false, { msg: "Invalid email or password." });
        });
      })
      .catch((err) => {
        return res.status(400).send(err);
      });
  }
);
passport.use("local", localStrategyConfig);

const googleStrategyConfig = new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    // clientID: process.env.GOOGLE_CLIENT_ID,
    // clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback",
    scope: ["email", "profile"],
  },
  // 유저 정보를 위해서 "코드" 가 포함된 요청을 구글에 보내야함
  // 그러기 위해 server.js에 get요청 함 /auth/google/callback
  // 위 겟요청을 통과하면 밑의 함수 실행됨 => db에 저장할 차례
  (accessToken, refreshToken, profile, done) => {
    console.log("123");
    User.findOne({ googleId: profile.id }, (err, existingUser) => {
      console.log("45");
      if (err) {
        console.log("error");
        return done(err);
      }

      if (existingUser) {
        console.log("exist?");
        return done(null, existingUser);
      } else {
        console.log("last?");
        console.log(profile);
        const user = new User();
        user.email = profile.emails[0].value;
        user.googleId = profile.id;
        user.username = profile.displayName;
        user.firstName = profile.name.givenName;
        user.lastName = profile.name.familyName;
        user.save((err) => {
          console.log(err);
          if (err) {
            return done(err);
          }
          done(null, user);
        });
      }
    });
  }
);
passport.use("google", googleStrategyConfig);

const kakaoStrategyConfig = new KakaoStrategy(
  {
    clientID: process.env.KAKAO_CLIENT_ID,
    callbackURL: "/auth/kakao/callback",
  },
  (accessToken, refreshToken, profile, done) => {
    User.findOne({ kakaoId: profile.id }, (err, existingUser) => {
      if (err) {
        return done(err);
      }
      if (existingUser) {
        return done(null, existingUser);
      } else {
        const user = new User();
        user.kakaoId = profile.id;
        user.email = profile._json.kakao_account.email;
        user.save((err) => {
          if (err) {
            return done(err);
          }
          done(null, user);
        });
      }
    });
  }
);

passport.use("kakao", kakaoStrategyConfig);
